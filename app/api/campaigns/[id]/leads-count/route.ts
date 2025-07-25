import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== ENDPOINT LEADS COUNT ===')
  console.log('Campaign ID:', params.id)
  
  try {
    const campaignId = params.id

    if (!campaignId) {
      console.log('❌ Campaign ID es requerido')
      return NextResponse.json(
        { error: 'Campaign ID es requerido' },
        { status: 400 }
      )
    }

    console.log('✅ Conectando a PostgreSQL...')
    const query = `
      SELECT COUNT(*) as leads_count 
      FROM webapp.leads 
      WHERE campaigns = $1
    `

    const result = await pool.query(query, [campaignId])
    const leadsCount = parseInt(result.rows[0]?.leads_count || '0')
    
    console.log('✅ Query ejecutada, leads count:', leadsCount)

    const response = {
      success: true,
      campaign_id: campaignId,
      leads_count: leadsCount
    }
    
    console.log('✅ Respuesta:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error al obtener conteo de leads:', error)
    return NextResponse.json(
      { 
        error: 'Error al obtener conteo de leads',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 