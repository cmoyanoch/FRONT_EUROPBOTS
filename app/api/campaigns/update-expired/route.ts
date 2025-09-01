import { NextResponse } from 'next/server'
import pool from '../../../../lib/database'

export async function POST() {
  try {
    console.log('=== ACTUALIZANDO CAMPAÑAS EXPIRADAS ===')

    // Actualizar campañas que han expirado (ended_at < NOW) y están activas
    const updateResult = await pool.query(`
      UPDATE webapp.campaigns
      SET status = 'completed'
      WHERE status = 'active'
        AND ended_at IS NOT NULL
        AND ended_at < NOW()
    `)

    console.log(`✅ Campañas actualizadas a 'completed': ${updateResult.rowCount}`)

    // Obtener campañas que están próximas a expirar (en las próximas 24 horas)
    const expiringSoonResult = await pool.query(`
      SELECT
        campaign_id,
        campaign_name,
        started_at,
        ended_at,
        duration_days,
        EXTRACT(EPOCH FROM (ended_at - NOW())) / 3600 as hours_remaining
      FROM webapp.campaigns
      WHERE status = 'active'
        AND ended_at IS NOT NULL
        AND ended_at > NOW()
        AND ended_at <= NOW() + INTERVAL '24 hours'
      ORDER BY ended_at ASC
    `)

    console.log(`📊 Campañas próximas a expirar: ${expiringSoonResult.rowCount}`)

    return NextResponse.json({
      success: true,
      message: 'Campañas expiradas actualizadas correctamente',
      data: {
        updated_campaigns: updateResult.rowCount,
        expiring_soon: expiringSoonResult.rows,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error actualizando campañas expiradas:', error)
    return NextResponse.json({
      success: false,
      message: 'Error al actualizar campañas expiradas',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
