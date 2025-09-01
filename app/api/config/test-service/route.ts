import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../../lib/database'

// ============================================================================
// FUNCIÓN DE DESENCRIPTACIÓN
// ============================================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long!!'
const ALGORITHM = 'aes-256-cbc'

function decrypt(encryptedData: string, iv: string): string {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// ============================================================================
// POST - Probar conectividad de servicio
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const { service_name } = await request.json()

    if (!service_name) {
      return NextResponse.json({
        success: false,
        message: 'service_name es requerido'
      }, { status: 400 })
    }

    // Obtener configuración del servicio
    const serviceResult = await pool.query(`
      SELECT
        sc.id,
        sc.service_name,
        sc.service_display_name,
        sc.service_category,
        sc.config_data,
        eak.encrypted_key,
        eak.encryption_iv
      FROM webapp.service_config sc
      LEFT JOIN webapp.encrypted_api_keys eak ON sc.id = eak.service_config_id
      WHERE sc.service_name = $1 AND sc.is_active = true
    `, [service_name])

    if (serviceResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Servicio "${service_name}" no encontrado o inactivo`
      }, { status: 404 })
    }

    const service = serviceResult.rows[0]
    const configData = service.config_data || {}

    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'

    let testResult: any = {
      service_name: service.service_name,
      service_display_name: service.service_display_name,
      service_category: service.service_category,
      success: false,
      response_time_ms: 0,
      error_message: null,
      details: {}
    }

    const startTime = Date.now()

    try {
      switch (service.service_category) {
        case 'external_service':
          testResult = await testExternalService(service, configData)
          break
        case 'webhook':
          testResult = await testWebhookService(service, configData)
          break
        case 'database':
          testResult = await testDatabaseService(service, configData)
          break
        case 'api':
          testResult = await testApiService(service, configData)
          break
        default:
          testResult.error_message = `Categoría de servicio no soportada: ${service.service_category}`
      }
    } catch (error) {
      testResult.error_message = error instanceof Error ? error.message : 'Error desconocido'
    }

    testResult.response_time_ms = Date.now() - startTime

    // Log del evento de prueba
    await pool.query(`
      INSERT INTO webapp.config_logs (
        service_config_id,
        event_type,
        event_description,
        new_values,
        error_message,
        user_id
      )
      VALUES ($1, 'tested', 'Prueba de conectividad', $2, $3, $4)
    `, [service.id, testResult, testResult.error_message, userId])

    return NextResponse.json({
      success: true,
      test_result: testResult
    })

  } catch (error) {
    console.error('Error testing service:', error)

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA POR CATEGORÍA
// ============================================================================

async function testExternalService(service: any, configData: any) {
  const baseUrl = configData.base_url
  const apiKeyRequired = configData.api_key_required

  if (!baseUrl) {
    throw new Error('base_url no configurado')
  }

  // Obtener API key si es requerida
  let apiKey = null
  if (apiKeyRequired && service.encrypted_key && service.encryption_iv) {
    try {
      apiKey = decrypt(service.encrypted_key, service.encryption_iv)
    } catch (error) {
      throw new Error('Error al desencriptar API key')
    }
  }

  // Construir URL de prueba según el servicio
  let testUrl = baseUrl
  let headers: any = {
    'Content-Type': 'application/json'
  }

  if (apiKey) {
    if (service.service_name === 'phantombuster') {
      headers['X-Phantombuster-Key'] = apiKey
      testUrl += '/agents/fetch-output'
    } else if (service.service_name === 'axonaut') {
      headers['userApiKey'] = apiKey
      testUrl += '/companies'
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    return {
      service_name: service.service_name,
      service_display_name: service.service_display_name,
      service_category: service.service_category,
      success: response.ok,
      status_code: response.status,
      status_text: response.statusText,
      url_tested: testUrl,
      details: {
        has_api_key: !!apiKey,
        response_headers: Object.fromEntries(response.headers.entries())
      }
    }

  } catch (fetchError) {
    clearTimeout(timeoutId)

    if (fetchError instanceof Error) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout: El servicio no respondió en 10 segundos')
      }
      throw fetchError
    }
    throw new Error('Error de conexión')
  }
}

async function testWebhookService(service: any, configData: any) {
  const baseUrl = configData.base_url
  const webhooks = configData.webhooks
  const timeout = configData.timeout || 10000

  if (!baseUrl || !webhooks) {
    throw new Error('base_url o webhooks no configurados')
  }

  // Probar el primer webhook disponible
  const webhookKey = Object.keys(webhooks)[0]
  const webhookPath = webhooks[webhookKey]
  const testUrl = `${baseUrl}${webhookPath}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    return {
      service_name: service.service_name,
      service_display_name: service.service_display_name,
      service_category: service.service_category,
      success: response.ok,
      status_code: response.status,
      status_text: response.statusText,
      url_tested: testUrl,
      details: {
        webhook_tested: webhookKey,
        webhook_path: webhookPath
      }
    }

  } catch (fetchError) {
    clearTimeout(timeoutId)

    if (fetchError instanceof Error) {
      if (fetchError.name === 'AbortError') {
        throw new Error(`Timeout: El webhook no respondió en ${timeout}ms`)
      }
      throw fetchError
    }
    throw new Error('Error de conexión')
  }
}

async function testDatabaseService(service: any, configData: any) {
  const host = configData.host
  const port = configData.port
  const database = configData.database
  const user = configData.user

  if (!host || !port || !database || !user) {
    throw new Error('Configuración de base de datos incompleta')
  }

  try {
    // Probar conexión a la base de datos
    const testQuery = await pool.query('SELECT 1 as test_connection')

    return {
      service_name: service.service_name,
      service_display_name: service.service_display_name,
      service_category: service.service_category,
      success: true,
      status_code: 200,
      status_text: 'OK',
      details: {
        host,
        port,
        database,
        user,
        connection_test: testQuery.rows[0].test_connection
      }
    }

  } catch (dbError) {
    throw new Error(`Error de conexión a la base de datos: ${dbError instanceof Error ? dbError.message : 'Error desconocido'}`)
  }
}

async function testApiService(service: any, configData: any) {
  const baseUrl = configData.base_url
  const endpoints = configData.endpoints

  if (!baseUrl) {
    throw new Error('base_url no configurado')
  }

  // Probar el primer endpoint disponible
  const endpointKeys = endpoints ? Object.keys(endpoints) : []
  const endpointKey = endpointKeys.length > 0 ? endpointKeys[0] : null
  const endpointPath = endpoints && endpointKey ? endpoints[endpointKey] : '/health'
  const testUrl = `${baseUrl}${endpointPath}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    return {
      service_name: service.service_name,
      service_display_name: service.service_display_name,
      service_category: service.service_category,
      success: response.ok,
      status_code: response.status,
      status_text: response.statusText,
      url_tested: testUrl,
      details: {
        endpoint_tested: endpointKey || 'default',
        endpoint_path: endpointPath
      }
    }

  } catch (fetchError) {
    clearTimeout(timeoutId)

    if (fetchError instanceof Error) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout: El servicio no respondió en 10 segundos')
      }
      throw fetchError
    }
    throw new Error('Error de conexión')
  }
}
