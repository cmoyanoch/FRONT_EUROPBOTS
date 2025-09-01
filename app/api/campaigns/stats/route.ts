import { NextResponse } from 'next/server'
import pool from '../../../../lib/database'

export async function GET() {
  try {
    console.log('=== OBTENIENDO ESTADÍSTICAS DE CAMPAÑAS ===')

    // Usar la función de estadísticas de la base de datos
    const result = await pool.query(`
      SELECT * FROM webapp.get_campaign_stats()
    `)

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No se pudieron obtener estadísticas'
      }, { status: 404 })
    }

    const stats = result.rows[0]

    console.log('✅ Estadísticas obtenidas:', stats)

    return NextResponse.json({
      success: true,
      stats: {
        total_campaigns: stats.total_campaigns,
        active_campaigns: stats.active_campaigns,
        completed_campaigns: stats.completed_campaigns,
        expired_campaigns: stats.expired_campaigns,
        avg_duration_days: parseFloat(stats.avg_duration_days || '0'),
        avg_progress: parseFloat(stats.avg_progress || '0')
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de campañas:', error)
    return NextResponse.json({
      success: false,
      message: 'Error al obtener estadísticas de campañas',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
