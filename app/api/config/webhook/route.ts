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

    // Aquí guardarías la URL en la base de datos
    // Por ahora, solo simulamos el guardado
    console.log('Guardando webhook URL:', webhookUrl)

    // TODO: Implementar guardado en base de datos
    // const result = await db.query(
    //   'INSERT INTO webapp.webhook_config (user_id, webhook_url, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET webhook_url = $2, updated_at = NOW()',
    //   [userId, webhookUrl]
    // )

    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook guardado exitosamente',
        webhookUrl 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error saving webhook:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // TODO: Implementar obtención desde base de datos
    // const result = await db.query(
    //   'SELECT webhook_url FROM webapp.webhook_config WHERE user_id = $1',
    //   [userId]
    // )

    return NextResponse.json(
      { 
        webhookUrl: null, // Por ahora retornamos null
        message: 'Webhook no configurado'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error getting webhook:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 