import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../../../lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    console.log(`=== DESACTIVANDO CAMPAÑA ===`)
    console.log(`Campaign ID: ${campaignId}`)

    // Verificar conexión a la base de datos
    console.log('Verificando conexión a la base de datos...')
    await pool.query('SELECT 1')
    console.log('✅ Conexión a la base de datos OK')

    // Verificar si la campaña existe
    console.log('Verificando si la campaña existe...')
    const checkResult = await pool.query(`
      SELECT campaign_id, status FROM webapp.campaigns WHERE campaign_id = $1
    `, [campaignId])
    console.log(`Verificación completada. Filas encontradas: ${checkResult.rowCount}`)

    if (checkResult.rowCount === 0) {
      console.log('❌ Campaña no encontrada')
      return NextResponse.json({
        success: false,
        message: 'Campaña no encontrada'
      }, { status: 404 })
    }

    console.log(`Campaign encontrada. Status actual: ${checkResult.rows[0].status}`)

    // Actualizar el status de la campaña a 'cancelled'
    console.log('Ejecutando UPDATE...')
    const result = await pool.query(`
      UPDATE webapp.campaigns 
      SET status = 'cancelled'
      WHERE campaign_id = $1
    `, [campaignId])
    console.log(`UPDATE completado. Filas afectadas: ${result.rowCount}`)

    console.log(`✅ Campaña desactivada: ${campaignId}`)

    return NextResponse.json({
      success: true,
      message: 'Campaña desactivada correctamente'
    })

  } catch (error) {
    console.error('❌ Error desactivando campaña:', error)
    return NextResponse.json({
      success: false,
      message: 'Error al desactivar la campaña',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 