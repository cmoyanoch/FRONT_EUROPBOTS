import { NextResponse } from 'next/server'
import pool from '../../../lib/database'

export async function GET() {
  try {
    console.log('=== OBTENIENDO CAMPAÑAS CON PROGRESO AUTOMÁTICO ===')

    // Usar la nueva función que calcula automáticamente el progreso
    const result = await pool.query(`
      SELECT * FROM webapp.get_campaigns_with_progress()
    `)

    console.log(`Campañas encontradas: ${result.rows.length}`)
    console.log('DEBUG - Sample row regions:', result.rows[0]?.regions)

    // Formatear los datos para el frontend
    const campaigns = result.rows.map(row => ({
      campaign_id: row.campaign_id,
      campaign_name: row.campaign_name,
      created_at: row.created_at,
      started_at: row.started_at,
      ended_at: row.ended_at,
      duration_days: row.duration_days,
      status: row.status,
      sectors: row.sectors,
      roles: row.roles,
      id_roles: row.id_roles,
      regions: row.regions,
      progress: row.progress,
      days_remaining: row.days_remaining,
      hours_remaining: row.hours_remaining,
      is_expired: row.is_expired,
      is_active: row.is_active
    }))

    return NextResponse.json({
      success: true,
      campaigns: campaigns,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error obteniendo campañas:', error)
    return NextResponse.json({
      success: false,
      message: 'Error al obtener las campañas',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
