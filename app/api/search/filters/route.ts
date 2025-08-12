import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'n8n_user',
  host: process.env.DB_HOST || 'server_europbot-n8n_postgres-1',
  database: process.env.DB_NAME || 'n8n_db',
  password: process.env.DB_PASSWORD || '3Lchunch0',
  port: parseInt(process.env.DB_PORT || '5432'),
})

// Datos estáticos para países
const staticData = {
  countries: [
    { name: 'France', code: 'fr', description: 'France', order_index: 1 },
  ]
}

export async function GET() {
  try {
    const client = await pool.connect()

    try {
      // Obtener sectores desde la tabla webapp.sectors
      const sectorsResult = await client.query(`
        SELECT
          id,
          name,
          code,
          description,
          order_index
        FROM webapp.sectors
        WHERE is_active = true
        ORDER BY order_index
      `)

      // Obtener roles desde la tabla webapp.roles
      const rolesResult = await client.query(`
        SELECT
          r.name,
          r.order_index,
          r.sector_id
        FROM webapp.roles r
        WHERE r.is_active = true
        ORDER BY r.order_index
      `)

      // Definir tipos para los filtros
      interface FilterItem {
        name: string
        code: string
        description: string | null
        order_index: number
      }

      // Organizar los datos por tipo de filtro
      const filters: {
        sectors: FilterItem[]
        roles: FilterItem[]
        countries: FilterItem[]
      } = {
        sectors: sectorsResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          code: row.code,
          description: row.description,
          order_index: row.order_index
        })),
        roles: rolesResult.rows.map(row => ({
          name: row.name,
          code: row.name.toLowerCase().replace(/\s+/g, '_'),
          description: null,
          order_index: row.order_index,
          sector_id: row.sector_id
        })),
        countries: staticData.countries
      }

      return NextResponse.json({
        success: true,
        ...filters
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error obteniendo filtros de la base de datos:', error)

    // Devolver error cuando la base de datos no esté disponible
    return NextResponse.json({
      success: false,
      error: 'Error de conexión a la base de datos',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
