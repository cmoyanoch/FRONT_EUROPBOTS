import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json()

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'URL del webhook es requerida'
      }, { status: 400 })
    }

    // Validar que sea una URL válida
    try {
      new URL(webhookUrl)
    } catch {
      return NextResponse.json({
        success: false,
        message: 'URL del webhook no es válida'
      }, { status: 400 })
    }

    console.log('Probando conexión a webhook:', webhookUrl)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout

    try {
      // Determinar si es un webhook GET o POST basado en la URL
      const isGetWebhook = webhookUrl.includes('campaign-launcher') || webhookUrl.includes('search-launcher')
      
      let response
      if (isGetWebhook) {
        // Para webhooks GET, construir URL con parámetros
        const url = new URL(webhookUrl)
        url.searchParams.set('test', 'true')
        url.searchParams.set('message', 'Prueba de conectividad desde EUROPBOTS')
        url.searchParams.set('timestamp', new Date().toISOString())
        url.searchParams.set('source', 'web-app-config')
        url.searchParams.set('sectors', 'tech')
        url.searchParams.set('roles', 'ceo')
        
        // Si es localhost, usar n8n:5678 para comunicación interna de Docker
        let finalUrl = url.toString()
        if (finalUrl.includes('n8n.localhost')) {
          finalUrl = finalUrl.replace('https://n8n.localhost', 'http://n8n:5678')
        }
        
        console.log('Probando webhook GET:', finalUrl)
        
        response = await fetch(finalUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        })
      } else {
        // Para webhooks POST, enviar payload en body
    const testPayload = {
          test: true,
          message: 'Prueba de conexión desde EUROPBOTS',
      timestamp: new Date().toISOString(),
          source: 'web-app-config'
      }
        
        response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
          signal: controller.signal
      })
      }
      
      clearTimeout(timeoutId)
      console.log('Respuesta del webhook:', response.status, response.statusText)

      if (response.ok) {
        return NextResponse.json({
            success: true, 
            message: 'Conexión exitosa',
          status: response.status,
          statusText: response.statusText
        })
      } else {
        return NextResponse.json({
          success: false,
          message: `Error en la respuesta del webhook: ${response.status} ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        }, { status: 400 })
      }

    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Error testing webhook connection:', fetchError)
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json({
            success: false,
            message: 'Timeout: El webhook no respondió en 10 segundos'
          }, { status: 408 })
        }
        
        if (fetchError.message.includes('ENOTFOUND')) {
          return NextResponse.json({
            success: false,
            message: 'No se puede resolver el dominio del webhook'
          }, { status: 400 })
        }
        
        if (fetchError.message.includes('ECONNREFUSED')) {
          return NextResponse.json({
            success: false,
            message: 'Conexión rechazada. Verifica que el servidor esté funcionando'
          }, { status: 400 })
        }
        
        if (fetchError.message.includes('fetch failed')) {
          return NextResponse.json({
            success: false,
            message: 'Error de red. Verifica que la URL sea correcta y el servidor esté disponible'
          }, { status: 400 })
        }
      }

      return NextResponse.json({
        success: false,
        message: 'Error de conexión al webhook',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in test-webhook API:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 