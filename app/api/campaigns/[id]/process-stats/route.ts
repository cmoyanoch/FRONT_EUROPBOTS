import pool from '@/lib/database'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== ENDPOINT PROCESS STATS ===')
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
      SELECT
        process,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage
      FROM webapp.leads
      WHERE campaigns = $1 AND process IS NOT NULL
      GROUP BY process
      ORDER BY count DESC
    `

    const result = await pool.query(query, [campaignId])

    // Calcular total de leads
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM webapp.leads
      WHERE campaigns = $1
    `
    const totalResult = await pool.query(totalQuery, [campaignId])
    const totalLeads = parseInt(totalResult.rows[0]?.total || '0')

    // Formatear los resultados
    const processStats = result.rows.map(row => ({
      process: row.process,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage)
    }))

    console.log('✅ Query ejecutada, process stats:', processStats)

    const response = {
      success: true,
      campaign_id: campaignId,
      total_leads: totalLeads,
      process_distribution: processStats
    }

    console.log('✅ Respuesta:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error al obtener estadísticas de proceso:', error)
    return NextResponse.json(
      {
        error: 'Error al obtener estadísticas de proceso',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
