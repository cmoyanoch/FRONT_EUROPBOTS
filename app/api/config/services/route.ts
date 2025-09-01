import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../../lib/database'

// ============================================================================
// GET - Obtener todas las configuraciones de servicios
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const service = searchParams.get('service')

    let query = `
      SELECT
        sc.id,
        sc.service_name,
        sc.service_display_name,
        sc.service_description,
        sc.service_category,
        sc.config_data,
        sc.is_active,
        sc.is_encrypted,
        sc.created_at,
        sc.updated_at,
        u.email as updated_by_email
      FROM webapp.service_config sc
      LEFT JOIN webapp.users u ON sc.updated_by = u.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (category) {
      query += ` AND sc.service_category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (service) {
      query += ` AND sc.service_name = $${paramIndex}`
      params.push(service)
      paramIndex++
    }

    query += ` ORDER BY sc.service_category, sc.service_display_name`

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      services: result.rows,
      total: result.rows.length
    })

  } catch (error) {
    console.error('Error getting service configs:', error)

    return NextResponse.json({
      success: false,
      message: 'Error al obtener las configuraciones de servicios',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// POST - Crear o actualizar configuración de servicio
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const {
      service_name,
      service_display_name,
      service_description,
      service_category,
      config_data,
      is_active = true,
      is_encrypted = false
    } = await request.json()

    // Validaciones
    if (!service_name || !service_display_name || !service_category) {
      return NextResponse.json({
        success: false,
        message: 'service_name, service_display_name y service_category son requeridos'
      }, { status: 400 })
    }

    if (!['api', 'webhook', 'database', 'external_service'].includes(service_category)) {
      return NextResponse.json({
        success: false,
        message: 'service_category debe ser: api, webhook, database, o external_service'
      }, { status: 400 })
    }

    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'

    // Guardar en la base de datos
    const result = await pool.query(`
      INSERT INTO webapp.service_config (
        service_name,
        service_display_name,
        service_description,
        service_category,
        config_data,
        is_active,
        is_encrypted,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      ON CONFLICT (service_name)
      DO UPDATE SET
        service_display_name = EXCLUDED.service_display_name,
        service_description = EXCLUDED.service_description,
        service_category = EXCLUDED.service_category,
        config_data = EXCLUDED.config_data,
        is_active = EXCLUDED.is_active,
        is_encrypted = EXCLUDED.is_encrypted,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = EXCLUDED.updated_by
      RETURNING id, service_name, service_display_name, service_category
    `, [service_name, service_display_name, service_description, service_category, config_data, is_active, is_encrypted, userId])

    // Log del evento
    await pool.query(`
      INSERT INTO webapp.config_logs (service_config_id, event_type, event_description, new_values, user_id)
      VALUES ($1, 'updated', 'Configuración de servicio actualizada', $2, $3)
    `, [result.rows[0].id, config_data, userId])

    return NextResponse.json({
      success: true,
      message: `Configuración de ${service_display_name} guardada exitosamente`,
      service: result.rows[0]
    })

  } catch (error) {
    console.error('Error saving service config:', error)

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// PUT - Actualizar configuración específica
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')

    if (!service) {
      return NextResponse.json({
        success: false,
        message: 'Parámetro "service" es requerido'
      }, { status: 400 })
    }

    const { config_data, is_active } = await request.json()

    if (config_data === undefined && is_active === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Se requiere config_data o is_active para actualizar'
      }, { status: 400 })
    }

    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'

    // Obtener configuración actual para el log
    const currentConfig = await pool.query(`
      SELECT id, config_data FROM webapp.service_config WHERE service_name = $1
    `, [service])

    if (currentConfig.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Servicio "${service}" no encontrado`
      }, { status: 404 })
    }

    // Construir query de actualización dinámicamente
    let updateQuery = `UPDATE webapp.service_config SET updated_at = CURRENT_TIMESTAMP, updated_by = $1`
    const params: any[] = [userId]
    let paramIndex = 2

    if (config_data !== undefined) {
      updateQuery += `, config_data = $${paramIndex}`
      params.push(config_data)
      paramIndex++
    }

    if (is_active !== undefined) {
      updateQuery += `, is_active = $${paramIndex}`
      params.push(is_active)
      paramIndex++
    }

    updateQuery += ` WHERE service_name = $${paramIndex} RETURNING *`
    params.push(service)

    const result = await pool.query(updateQuery, params)

    // Log del evento
    await pool.query(`
      INSERT INTO webapp.config_logs (service_config_id, event_type, event_description, old_values, new_values, user_id)
      VALUES ($1, 'updated', 'Configuración actualizada', $2, $3, $4)
    `, [currentConfig.rows[0].id, currentConfig.rows[0].config_data, config_data || currentConfig.rows[0].config_data, userId])

    return NextResponse.json({
      success: true,
      message: `Configuración de ${service} actualizada exitosamente`,
      service: result.rows[0]
    })

  } catch (error) {
    console.error('Error updating service config:', error)

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Desactivar servicio (soft delete)
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')

    if (!service) {
      return NextResponse.json({
        success: false,
        message: 'Parámetro "service" es requerido'
      }, { status: 400 })
    }

    // Usar el user_id del admin por defecto
    const userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'

    // Obtener configuración actual para el log
    const currentConfig = await pool.query(`
      SELECT id, service_display_name FROM webapp.service_config WHERE service_name = $1
    `, [service])

    if (currentConfig.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Servicio "${service}" no encontrado`
      }, { status: 404 })
    }

    // Desactivar servicio
    const result = await pool.query(`
      UPDATE webapp.service_config
      SET is_active = false, updated_at = CURRENT_TIMESTAMP, updated_by = $1
      WHERE service_name = $2
      RETURNING service_name, service_display_name
    `, [userId, service])

    // Log del evento
    await pool.query(`
      INSERT INTO webapp.config_logs (service_config_id, event_type, event_description, user_id)
      VALUES ($1, 'deleted', 'Servicio desactivado', $2)
    `, [currentConfig.rows[0].id, userId])

    return NextResponse.json({
      success: true,
      message: `Servicio ${currentConfig.rows[0].service_display_name} desactivado exitosamente`,
      service: result.rows[0]
    })

  } catch (error) {
    console.error('Error deactivating service:', error)

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
