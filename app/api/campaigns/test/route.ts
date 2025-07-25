import { NextResponse } from 'next/server'
import pool from '../../../../lib/database'

export async function GET() {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===')
    
    // Prueba simple de conexión
    const result = await pool.query('SELECT 1 as test')
    
    console.log('✅ Database connection successful')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      test: result.rows[0]
    })

  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 