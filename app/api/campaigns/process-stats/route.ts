import pool from '@/lib/database'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== ENDPOINT ALL PROCESS STATS ===')

    const query = `
      SELECT
        campaigns as campaign_id,
        process,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY campaigns)), 1) as percentage
      FROM webapp.leads
      WHERE campaigns IS NOT NULL AND process IS NOT NULL
      GROUP BY campaigns, process
      ORDER BY campaigns, count DESC
    `

    const result = await pool.query(query)

    // Agrupar por campaña
    const processStatsByCampaign: { [key: string]: any[] } = {}

    result.rows.forEach(row => {
      const campaignId = row.campaign_id
      if (!processStatsByCampaign[campaignId]) {
        processStatsByCampaign[campaignId] = []
      }

      processStatsByCampaign[campaignId].push({
        process: row.process,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      })
    })

    console.log('✅ Query ejecutada, process stats by campaign:', processStatsByCampaign)

    return NextResponse.json({
      success: true,
      process_stats_by_campaign: processStatsByCampaign
    })

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
