import { NextResponse } from 'next/server'
import pool from '../../../lib/database'

export async function GET() {
  try {
    console.log('=== OBTENIENDO CAMPAÑAS ===')
    
             const result = await pool.query(`
           SELECT
             campaign_id,
             campaign_name,
             created_at,
             started_at,
             ended_at,
             duration_days,
             status,
             sectors,
             roles
           FROM webapp.campaigns
           WHERE status != 'deleted' AND status != 'cancelled'
           ORDER BY created_at DESC
         `)
    
    console.log(`Campañas encontradas: ${result.rows.length}`)
    
    return NextResponse.json({
      success: true,
      campaigns: result.rows
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