import { NextRequest, NextResponse } from 'next/server'
import { getWebhookUrl } from '../../../../lib/webhook'

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
        message: 'Filtros de sectores requeridos' 
      }, { status: 400 })
    }
    
    // Obtener webhook URL
    console.log('Obteniendo webhook URL para automation...')
    let webhookUrl = await getWebhookUrl('automation')
    if (!webhookUrl) {
      console.error('No se encontró webhook URL para automation')
      return NextResponse.json({ 
        success: false, 
        message: 'No se encontró el webhook de campaña' 
      }, { status: 500 })
    }
    console.log('Webhook URL obtenida:', webhookUrl)
    
    // Construir la URL con parámetros
    const url = new URL(webhookUrl)
    url.searchParams.set('sectors', campaignData.filters.sectors.join(','))
    url.searchParams.set('roles', campaignData.filters.roles?.join(',') || '')
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
        n8nResponse: n8nResult
      })
    } else {
      console.error('Error en webhook:', n8nResponse.status, n8nResponse.statusText)
      return NextResponse.json({
        success: false,
        message: 'Error al procesar la campaña en n8n',
        error: n8nResponse.statusText
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error en create-campaign:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 