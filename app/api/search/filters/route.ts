import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'n8n_postgres',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
})

// Datos de ejemplo para cuando la base de datos no esté disponible
const fallbackFilters = {
  sectors: [
    { name: 'Technologie', code: 'tech', description: 'Secteur technologique', order_index: 1 },
    { name: 'Finance', code: 'finance', description: 'Secteur financier', order_index: 2 },
    { name: 'Santé', code: 'health', description: 'Secteur de la santé', order_index: 3 },
    { name: 'Éducation', code: 'education', description: 'Secteur éducatif', order_index: 4 },
    { name: 'Commerce', code: 'retail', description: 'Commerce de détail', order_index: 5 }
  ],
  roles: [
    { name: 'CEO', code: 'ceo', description: 'Directeur Général', order_index: 1 },
    { name: 'CTO', code: 'cto', description: 'Directeur Technique', order_index: 2 },
    { name: 'Director de Operaciones', code: 'operations', description: 'Directeur des Opérations', order_index: 3 },
    { name: 'VP de Ventas', code: 'sales', description: 'VP des Ventes', order_index: 4 },
    { name: 'Manager', code: 'manager', description: 'Gestionnaire', order_index: 5 }
  ],
  countries: [
    { name: 'France', code: 'fr', description: 'France', order_index: 1 },
    { name: 'Allemagne', code: 'de', description: 'Allemagne', order_index: 2 },
    { name: 'Espagne', code: 'es', description: 'Espagne', order_index: 3 },
    { name: 'Italie', code: 'it', description: 'Italie', order_index: 4 },
    { name: 'Pays-Bas', code: 'nl', description: 'Pays-Bas', order_index: 5 }
  ],
  companySizes: [
    { name: '1-10 employés', code: '1-10', description: 'Très petite entreprise', order_index: 1 },
    { name: '11-50 employés', code: '11-50', description: 'Petite entreprise', order_index: 2 },
    { name: '51-200 employés', code: '51-200', description: 'Moyenne entreprise', order_index: 3 },
    { name: '201-1000 employés', code: '201-1000', description: 'Grande entreprise', order_index: 4 },
    { name: '1000+ employés', code: '1000+', description: 'Très grande entreprise', order_index: 5 }
  ]
}

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      // Obtener todos los filtros activos usando la función que creamos
      const result = await client.query(`
        SELECT * FROM webapp.get_active_search_filters()
        ORDER BY filter_type, order_index
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
        companySizes: FilterItem[]
      } = {
        sectors: [],
        roles: [],
        countries: [],
        companySizes: []
      }

      result.rows.forEach(row => {
        const filterItem = {
          name: row.name,
          code: row.code,
          description: row.description,
          order_index: row.order_index
        }

        switch (row.filter_type) {
          case 'industry':
            filters.sectors.push(filterItem)
            break
          case 'job_title':
            filters.roles.push(filterItem)
            break
          case 'location':
            filters.countries.push(filterItem)
            break
          case 'company_size':
            filters.companySizes.push(filterItem)
            break
        }
      })

      return NextResponse.json({
        success: true,
        ...filters
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error obteniendo filtros de la base de datos, usando datos de ejemplo:', error)
    
    // Devolver datos de ejemplo cuando la base de datos no esté disponible
    return NextResponse.json({
      success: true,
      ...fallbackFilters
    })
  }
} 