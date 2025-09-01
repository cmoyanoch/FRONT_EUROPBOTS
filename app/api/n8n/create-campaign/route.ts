import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getWebhookUrl } from '../../../../lib/webhook';

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'n8n_user',
  host: process.env.DB_HOST || 'server_europbot-n8n_postgres-1',
  database: process.env.DB_NAME || 'n8n_db',
  password: process.env.DB_PASSWORD || '3Lchunch0',
  port: parseInt(process.env.DB_PORT || '5432'),
})

// Función para convertir roles a perfiles
async function convertRolesToProfiles(roles: string[]): Promise<number[]> {
  if (!roles || roles.length === 0) return []

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT DISTINCT id_profiles
        FROM webapp.roles
        WHERE name = ANY($1) AND is_active = true
        ORDER BY id_profiles
      `, [roles])

      return result.rows.map(row => row.id_profiles).filter(id => id !== null)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error convirtiendo roles a perfiles:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO CREATE-CAMPAIGN API ===')

    const campaignData = await request.json()
    console.log('Datos recibidos:', campaignData)

    // Validación de datos
    if (!campaignData.filters?.sectors?.length) {
      console.error('Filtros de sectores requeridos')
      return NextResponse.json({
        success: false,
        message: 'Filtres de secteurs requis'
      }, { status: 400 })
    }

    // Usar perfiles específicos y roles enviados desde el frontend
    console.log('Procesando perfiles y roles específicos...')
    const profiles = campaignData.filters.profiles || []
    const roles = campaignData.filters.roles || []
    console.log('Perfiles específicos recibidos:', profiles)
    console.log('Roles específicos recibidos:', roles)

    // Obtener webhook URL
    console.log('Obteniendo webhook URL para automation...')
    let webhookUrl = await getWebhookUrl('automation')
    if (!webhookUrl) {
      console.error('No se encontró webhook URL para automation')
      return NextResponse.json({
        success: false,
        message: 'Webhook de campagne introuvable'
      }, { status: 500 })
    }
    console.log('Webhook URL obtenida:', webhookUrl)

    // Construir la URL con parámetros (enviar tanto perfiles como roles)
    const url = new URL(webhookUrl)
    url.searchParams.set('sectors', campaignData.filters.sectors.join(','))
    url.searchParams.set('profiles', profiles.join(',')) // Usar perfiles específicos

    // Procesar roles correctamente - extraer IDs y nombres de los roles
    const roleIds = Array.isArray(roles) ? roles.map(role =>
      typeof role === 'string' ? null : role.roleId || role.id || null
    ).filter(id => id !== null) : []

    const roleNames = Array.isArray(roles) ? roles.map(role =>
      typeof role === 'string' ? role : role.roleName || role.name || ''
    ).filter(name => name) : []

    // Enviar tanto IDs como nombres de roles
    url.searchParams.set('roleIds', roleIds.join(',')) // Enviar IDs de roles
    url.searchParams.set('roles', roleNames.join(',')) // Enviar nombres de roles

    url.searchParams.set('regions', campaignData.filters.regions?.join(',') || '')
    url.searchParams.set('searchId', `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    url.searchParams.set('userId', 'default-user')
    url.searchParams.set('userEmail', 'admin@europbot.com')
    url.searchParams.set('source', 'europbots_webapp')
    url.searchParams.set('platform', 'n8n_workflow')
    url.searchParams.set('timestamp', new Date().toISOString())

    // URL final - usar n8n:5678 para comunicación interna de Docker
    let finalUrl = url.toString()
    if (finalUrl.includes('n8n.localhost')) {
      finalUrl = finalUrl.replace('https://n8n.localhost', 'http://n8n:5678')
    }
    console.log('URL final:', finalUrl)

    // Llamar al webhook
    console.log('Llamando webhook de campaña...')
    const n8nResponse = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    console.log('Respuesta del webhook:', n8nResponse.status, n8nResponse.statusText)

    if (n8nResponse.ok) {
      const n8nResult = await n8nResponse.json()
      console.log('Campaña creada exitosamente')
      return NextResponse.json({
        success: true,
        message: 'Campagne créée avec succès',
        campaignId: n8nResult.campaignId || 'generated-id',
        n8nResponse: n8nResult,
        conversionInfo: {
          rolesReceived: roles,
          profilesSent: profiles
        }
      })
    } else {
      console.error('Error en webhook:', n8nResponse.status, n8nResponse.statusText)
      return NextResponse.json({
        success: false,
        message: 'Erreur lors du traitement de la campagne dans n8n',
        error: n8nResponse.statusText
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error en create-campaign:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
