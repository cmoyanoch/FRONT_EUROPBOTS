import { NextRequest, NextResponse } from 'next/server'
import { getWebhookUrl } from '../../../../lib/webhook'

interface SearchParams {
  sectors: string[]
  roles: string[]
  countries: string[]
  companySizes: string[]
  userId?: string
  userEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json()
    // Validar que al menos un filtro esté seleccionado
    const hasFilters = body.sectors.length > 0 || 
                      body.roles.length > 0 || 
                      body.countries.length > 0 || 
                      body.companySizes.length > 0
    if (!hasFilters) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos un filtro de búsqueda' },
        { status: 400 }
      )
    }
    // Preparar los datos para el webhook de n8n
    const webhookData = {
      searchId: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user: {
        id: body.userId,
        email: body.userEmail
      },
      filters: {
        sectors: body.sectors,
        roles: body.roles,
        countries: body.countries,
        companySizes: body.companySizes
      },
      status: 'pending',
      source: 'europbots_webapp',
      platform: 'n8n_workflow'
    }
    // Obtener el webhook de tipo 'search_bot' de la tabla
    let webhookUrl = await getWebhookUrl('search_bot')
    if (!webhookUrl) {
      return NextResponse.json({ error: 'No se encontró el webhook de búsqueda' }, { status: 500 })
    }
    // Preparar query parameters para el GET request
    const queryParams = new URLSearchParams({
      searchId: webhookData.searchId,
      timestamp: webhookData.timestamp,
      userId: body.userId || '',
      userEmail: body.userEmail || '',
      sectors: body.sectors.join(','),
      roles: body.roles.join(','),
      countries: body.countries.join(','),
      companySizes: body.companySizes.join(','),
      source: 'europbots_webapp',
      platform: 'n8n_workflow'
    })
    // Construir URL completa con query parameters
    let fullWebhookUrl = `${webhookUrl}?${queryParams.toString()}`
    if (fullWebhookUrl.includes('n8n.localhost')) {
      fullWebhookUrl = fullWebhookUrl.replace('https://n8n.localhost', 'http://n8n:5678')
    }
    // Log para debug
    console.log('Llamando webhook de búsqueda:', fullWebhookUrl)
    // Enviar datos al webhook de n8n
    const webhookResponse = await fetch(fullWebhookUrl, {
      method: 'GET', // El webhook está configurado para GET
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EUROPBOTS-WebApp/1.0'
      },
    })
    if (!webhookResponse.ok) {
      console.error('Error en webhook n8n:', await webhookResponse.text())
      return NextResponse.json(
        { error: 'Error al conectar con el workflow de n8n' },
        { status: 500 }
      )
    }
    const webhookResult = await webhookResponse.json()
    return NextResponse.json({
      success: true,
      searchId: webhookData.searchId,
      message: 'Búsqueda iniciada exitosamente en n8n',
      n8nResponse: webhookResult,
      estimatedTime: '5-10 minutos',
      webhookUrl: fullWebhookUrl
    })
  } catch (error) {
    console.error('Error en búsqueda n8n:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Endpoint para búsquedas con n8n workflow' },
    { status: 200 }
  )
} 