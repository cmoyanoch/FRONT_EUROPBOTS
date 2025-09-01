import pool from '@/lib/database'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Query para obtener el conteo de leads por cada campaña
    const query = `
      SELECT
        campaigns as campaign_id,
        COUNT(*) as leads_count
      FROM webapp.leads
      WHERE campaigns IS NOT NULL
      GROUP BY campaigns
      ORDER BY campaigns
    `

    const result = await pool.query(query)

    // Convertir el resultado a un objeto con campaign_id como clave
    const leadsCounts: { [key: string]: number } = {}
    result.rows.forEach(row => {
      leadsCounts[row.campaign_id] = parseInt(row.leads_count)
    })

    return NextResponse.json({
      success: true,
      leads_counts: leadsCounts,
      total_campaigns: result.rows.length
    })

  } catch (error) {
    console.error('❌ Error al obtener conteos de leads:', error)
    return NextResponse.json(
      {
        error: 'Error al obtener conteos de leads',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
