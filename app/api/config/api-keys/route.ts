import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../../lib/database'

// ============================================================================
// FUNCIONES DE ENCRIPTACIÓN
// ============================================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long!!'.padEnd(32, '!').slice(0, 32)
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): { encryptedData: string, iv: string } {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return { encryptedData: encrypted, iv: iv.toString('hex') }
}

function decrypt(encryptedData: string, iv: string): string {
  const ivBuffer = Buffer.from(iv, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, ivBuffer)
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// ============================================================================
// GET - Obtener API keys (sin mostrar valores encriptados)
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const showValue = searchParams.get('show_value') === 'true'

    let query = `
      SELECT
        eak.id,
        eak.service_config_id,
        eak.key_name,
        eak.key_description,
        eak.expires_at,
        eak.created_at,
        eak.updated_at,
        sc.service_name,
        sc.service_display_name,
        u.email as updated_by_email
    `

    if (showValue) {
      query += `, eak.encrypted_key, eak.encryption_iv`
    }

    query += `
      FROM webapp.encrypted_api_keys eak
      JOIN webapp.service_config sc ON eak.service_config_id = sc.id
      LEFT JOIN webapp.users u ON eak.updated_by = u.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (service) {
      query += ` AND sc.service_name = $${paramIndex}`
      params.push(service)
      paramIndex++
    }

    query += ` ORDER BY sc.service_display_name, eak.key_name`

    const result = await pool.query(query, params)

    // Desencriptar valores si se solicitan
    const keys = result.rows.map(row => {
      const key = { ...row }

      if (showValue && key.encrypted_key && key.encryption_iv) {
        try {
          key.decrypted_value = decrypt(key.encrypted_key, key.encryption_iv)
        } catch (error) {
          key.decrypted_value = '*** ERROR DE DESENCRIPTACIÓN ***'
        }
        // Remover datos encriptados por seguridad
        delete key.encrypted_key
        delete key.encryption_iv
      }

      return key
    })

    return NextResponse.json({
      success: true,
      api_keys: keys,
      total: keys.length
    })

  } catch (error) {
    console.error('Error getting API keys:', error)

    return NextResponse.json({
      success: false,
      message: 'Error al obtener las API keys',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// POST - Crear nueva API key
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const {
      service_name,
      key_name,
      key_value,
      key_description,
      expires_at
    } = await request.json()

    // Validaciones
    if (!service_name || !key_name || !key_value) {
      return NextResponse.json({
        success: false,
        message: 'service_name, key_name y key_value son requeridos'
      }, { status: 400 })
    }

    // Verificar que el servicio existe
    const serviceResult = await pool.query(`
      SELECT id, service_display_name FROM webapp.service_config
      WHERE service_name = $1 AND is_active = true
    `, [service_name])

    if (serviceResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Servicio "${service_name}" no encontrado o inactivo`
      }, { status: 404 })
    }

    const serviceConfigId = serviceResult.rows[0].id
    const serviceDisplayName = serviceResult.rows[0].service_display_name

    // Encriptar la API key
    const { encryptedData, iv } = encrypt(key_value)

    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'

    // Guardar en la base de datos
    const result = await pool.query(`
      INSERT INTO webapp.encrypted_api_keys (
        service_config_id,
        key_name,
        key_description,
        encrypted_key,
        encryption_iv,
        expires_at,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      RETURNING id, key_name, key_description, expires_at
    `, [serviceConfigId, key_name, key_description, encryptedData, iv, expires_at, userId])

    // Log del evento
    await pool.query(`
      INSERT INTO webapp.config_logs (service_config_id, event_type, event_description, user_id)
      VALUES ($1, 'created', 'Nueva API key creada', $2)
    `, [serviceConfigId, userId])

    return NextResponse.json({
      success: true,
      message: `API key "${key_name}" para ${serviceDisplayName} creada exitosamente`,
      api_key: result.rows[0]
    })

  } catch (error) {
    console.error('Error creating API key:', error)

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// PUT - Actualizar API key
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({
        success: false,
        message: 'Parámetro "id" es requerido'
      }, { status: 400 })
    }

    const {
      key_name,
      key_value,
      key_description,
      expires_at
    } = await request.json()

    if (!key_name && !key_value && !key_description && expires_at === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar'
      }, { status: 400 })
    }

    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'

    // Obtener API key actual
    const currentKey = await pool.query(`
      SELECT eak.*, sc.service_name, sc.service_display_name
      FROM webapp.encrypted_api_keys eak
      JOIN webapp.service_config sc ON eak.service_config_id = sc.id
      WHERE eak.id = $1
    `, [keyId])

    if (currentKey.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'API key no encontrada'
      }, { status: 404 })
    }

    // Construir query de actualización dinámicamente
    let updateQuery = `UPDATE webapp.encrypted_api_keys SET updated_at = CURRENT_TIMESTAMP, updated_by = $1`
    const params: any[] = [userId]
    let paramIndex = 2

    if (key_name !== undefined) {
      updateQuery += `, key_name = $${paramIndex}`
      params.push(key_name)
      paramIndex++
    }

    if (key_description !== undefined) {
      updateQuery += `, key_description = $${paramIndex}`
      params.push(key_description)
      paramIndex++
    }

    if (expires_at !== undefined) {
      updateQuery += `, expires_at = $${paramIndex}`
      params.push(expires_at)
      paramIndex++
    }

    if (key_value !== undefined) {
      // Encriptar nueva API key
      const { encryptedData, iv } = encrypt(key_value)
      updateQuery += `, encrypted_key = $${paramIndex}, encryption_iv = $${paramIndex + 1}`
      params.push(encryptedData, iv)
      paramIndex += 2
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`
    params.push(keyId)

    const result = await pool.query(updateQuery, params)

    // Log del evento
    await pool.query(`
      INSERT INTO webapp.config_logs (service_config_id, event_type, event_description, user_id)
      VALUES ($1, 'updated', 'API key actualizada', $2)
    `, [currentKey.rows[0].service_config_id, userId])

    return NextResponse.json({
      success: true,
      message: `API key "${currentKey.rows[0].key_name}" actualizada exitosamente`,
      api_key: {
        id: result.rows[0].id,
        key_name: result.rows[0].key_name,
        key_description: result.rows[0].key_description,
        expires_at: result.rows[0].expires_at
      }
    })

  } catch (error) {
    console.error('Error updating API key:', error)

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Eliminar API key
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    // Intentar obtener el ID de los query parameters primero
    const { searchParams } = new URL(request.url)
    let keyId = searchParams.get('id')

    // Si no está en query parameters, intentar obtenerlo del body
    if (!keyId) {
      try {
        const body = await request.json()
        keyId = body.id
      } catch (bodyError) {
        // Si no se puede parsear el body, continuar con keyId como null
      }
    }

    if (!keyId) {
      return NextResponse.json({
        success: false,
        message: 'Parámetro "id" es requerido (en query parameters o body)'
      }, { status: 400 })
    }

    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'

    // Obtener API key para el log
    const currentKey = await pool.query(`
      SELECT eak.key_name, eak.service_config_id, sc.service_display_name
      FROM webapp.encrypted_api_keys eak
      JOIN webapp.service_config sc ON eak.service_config_id = sc.id
      WHERE eak.id = $1
    `, [keyId])

    if (currentKey.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'API key no encontrada'
      }, { status: 404 })
    }

    // Eliminar API key
    const result = await pool.query(`
      DELETE FROM webapp.encrypted_api_keys WHERE id = $1
      RETURNING id, key_name
    `, [keyId])

    // Log del evento
    await pool.query(`
      INSERT INTO webapp.config_logs (service_config_id, event_type, event_description, user_id)
      VALUES ($1, 'deleted', 'API key eliminada', $2)
    `, [currentKey.rows[0].service_config_id, userId])

    return NextResponse.json({
      success: true,
      message: `API key "${currentKey.rows[0].key_name}" eliminada exitosamente`,
      api_key: result.rows[0]
    })

  } catch (error) {
    console.error('Error deleting API key:', error)

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
