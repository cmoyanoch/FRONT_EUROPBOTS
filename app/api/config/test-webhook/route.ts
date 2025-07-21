import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json()

    // Validar la URL
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL del webhook es requerida' },
        { status: 400 }
      )
    }

    // Validar que sea una URL válida
    try {
      new URL(webhookUrl)
    } catch {
      return NextResponse.json(
        { error: 'URL del webhook no es válida' },
        { status: 400 }
      )
    }

    // Probar la conexión enviando un payload de prueba
    const testPayload = {
      event: 'test_connection',
      timestamp: new Date().toISOString(),
      message: 'Prueba de conexión desde EUROPBOTS',
      data: {
        test: true,
        source: 'europbots-webhook-test'
      }
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EUROPBOTS-Webhook-Test/1.0'
        },
        body: JSON.stringify(testPayload),
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        return NextResponse.json(
          { 
            success: true, 
            message: 'Conexión exitosa',
            statusCode: response.status,
            webhookUrl 
          },
          { status: 200 }
        )
      } else {
        return NextResponse.json(
          { 
            error: `El webhook respondió con código ${response.status}`,
            statusCode: response.status,
            webhookUrl 
          },
          { status: 400 }
        )
      }

    } catch (fetchError) {
      console.error('Error testing webhook connection:', fetchError)
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Timeout: El webhook no respondió en 10 segundos' },
            { status: 408 }
          )
        }
        
        if (fetchError.message.includes('ENOTFOUND')) {
          return NextResponse.json(
            { error: 'No se puede resolver el dominio del webhook' },
            { status: 400 }
          )
        }
        
        if (fetchError.message.includes('ECONNREFUSED')) {
          return NextResponse.json(
            { error: 'Conexión rechazada por el servidor del webhook' },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Error al conectar con el webhook: ' + (fetchError instanceof Error ? fetchError.message : 'Error desconocido') },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error testing webhook:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 