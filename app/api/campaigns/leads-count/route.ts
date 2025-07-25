import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    const campaignId = 'CAMP_TECHNO_CEO_W30_060034'
    
    const query = `
      SELECT COUNT(*) as leads_count 
      FROM webapp.leads 
      WHERE campaigns = $1
    `

    const result = await pool.query(query, [campaignId])
    const leadsCount = parseInt(result.rows[0]?.leads_count || '0')

    return NextResponse.json({
      success: true,
      campaign_id: campaignId,
      leads_count: leadsCount
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error al obtener conteo de leads',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 