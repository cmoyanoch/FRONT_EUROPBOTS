import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, type = 'search' } = await request.json()

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'URL del webhook es requerida'
      }, { status: 400 })
    }

    if (!['search', 'campaign'].includes(type)) {
      return NextResponse.json({
        success: false,
        message: 'Tipo de webhook debe ser "search" o "campaign"'
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

    // Mapear tipos de la UI a tipos de la BD
    const webhookType = type === 'search' ? 'search_bot' : 'automation'
    
    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'
    
    // Guardar en la base de datos
    console.log(`Guardando webhook URL (${type}):`, webhookUrl)
    
    const result = await pool.query(`
      INSERT INTO webapp.webhook_config (user_id, webhook_url, webhook_type, is_active)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (user_id, webhook_type) 
      DO UPDATE SET 
        webhook_url = EXCLUDED.webhook_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, webhook_url, webhook_type
    `, [userId, webhookUrl, webhookType])

    return NextResponse.json({
      success: true,
      message: `Webhook de ${type} guardado exitosamente`,
      webhookUrl,
      type
    })

  } catch (error) {
    console.error('Error saving webhook:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'search'

    if (!['search', 'campaign'].includes(type)) {
      return NextResponse.json({
        success: false,
        message: 'Tipo de webhook debe ser "search" o "campaign"'
      }, { status: 400 })
    }

    // Mapear tipos de la UI a tipos de la BD
    const webhookType = type === 'search' ? 'search_bot' : 'automation'
    
    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'
    
    // Obtener de la base de datos
    const result = await pool.query(`
      SELECT webhook_url, webhook_type, is_active
      FROM webapp.webhook_config
      WHERE user_id = $1 
      AND webhook_type = $2
      AND is_active = true
      ORDER BY updated_at DESC
      LIMIT 1
    `, [userId, webhookType])
    
    let webhookUrl = result.rows[0]?.webhook_url || 
      (type === 'search' ? 'https://n8n.localhost/webhook/search-launcher' : 'https://n8n.localhost/webhook/campaign-launcher')
    
    return NextResponse.json({
      success: true,
      webhookUrl,
      type
    })

  } catch (error) {
    console.error('Error getting webhook:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error al obtener la configuración del webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 