import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'n8n_user',
  host: process.env.DB_HOST || 'n8n_postgres', // Corregido: usar el nombre del servicio Docker
  database: process.env.DB_NAME || 'n8n_db',
  password: process.env.DB_PASSWORD || '3Lchunch0',
  port: parseInt(process.env.DB_PORT || '5432'),
})

// Datos estáticos para países (fallback)
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

      // Obtener roles desde la tabla webapp.roles con el nombre del perfil
      const rolesResult = await client.query(`
        SELECT
          r.id,
          r.name,
          r.order_index,
          r.sector_id,
          r.id_profiles,
          p.key_profiles as profile_name
        FROM webapp.roles r
        LEFT JOIN webapp.profiles p ON r.id_profiles = p.id
        WHERE r.is_active = true
        ORDER BY r.id_profiles, r.order_index
      `)

      // Obtener países europeos agrupados por prioridad de mercado
      const countriesResult = await client.query(`
        SELECT
          pais_nombre_es as name,
          codigo_linkedin as code,
          pais_nombre_es as description,
          prioridad_mercado as order_index,
          prioridad_mercado as priority_group,
          notas as notes
        FROM phantombuster.linkedin_codigos_paises_europa
        WHERE prioridad_mercado != 99
          AND activo = true
        ORDER BY prioridad_mercado ASC, pais_nombre_es ASC
      `)

      // Definir tipos para los filtros
      interface FilterItem {
        name: string
        code: string
        description: string | null
        order_index: number
      }

      interface CountryGroup {
        priority: number
        title: string
        description: string
        countries: FilterItem[]
      }

      // Agrupar países por prioridad de mercado
      const countriesByPriority: { [key: number]: FilterItem[] } = {}

      countriesResult.rows.forEach((country: any) => {
        const priority = country.priority_group
        if (!countriesByPriority[priority]) {
          countriesByPriority[priority] = []
        }
        countriesByPriority[priority].push({
          name: country.name,
          code: country.code,
          description: country.description,
          order_index: country.order_index
        })
      })

      // Crear grupos de países con títulos descriptivos
      const countryGroups: CountryGroup[] = Object.keys(countriesByPriority).map(priority => {
        const priorityNum = parseInt(priority)
        const countries = countriesByPriority[priorityNum]

        // Definir título y descripción según la prioridad
        let title = ''
        let description = ''

        switch (priorityNum) {
          case 1:
            title = 'Principales'
            description = 'Países prioritarios - mercados principales'
            break
          case 2:
            title = 'Secundarios Prio.'
            description = 'Países prioritarios - mercados secundarios'
            break
          case 3:
            title = 'Secundarios'
            description = 'Mercados secundarios desarrollados'
            break
          case 4:
            title = 'Nórdicos & Bálticos'
            description = 'Mercados nórdicos y bálticos desarrollados'
            break
          case 5:
            title = 'Emergente Import.'
            description = 'Mercado emergente importante'
            break
          case 6:
            title = 'Emergentes'
            description = 'Mercados emergentes en desarrollo'
            break
          case 7:
            title = 'En Desarrollo'
            description = 'Mercados en desarrollo'
            break
          case 8:
            title = 'Especializados'
            description = 'Mercados especializados y mediterráneos'
            break
          case 9:
            title = 'Pequeños'
            description = 'Mercados pequeños especializados'
            break
          case 10:
            title = 'Entidades Esp.'
            description = 'Entidades especiales'
            break
          default:
            title = `Prio. ${priorityNum}`
            description = 'Otros mercados'
        }

        return {
          priority: priorityNum,
          title,
          description,
          countries
        }
      })

      // Ordenar grupos por prioridad
      countryGroups.sort((a, b) => a.priority - b.priority)

      return NextResponse.json({
        success: true,
        sectors: sectorsResult.rows,
        roles: rolesResult.rows,
        countryGroups: countryGroups, // Nueva estructura agrupada
        countries: countriesResult.rows, // Mantener compatibilidad con código existente
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error obteniendo filtros de la base de datos:', error)

    // Retornar datos estáticos en caso de error
    return NextResponse.json({
      success: false,
      message: 'Error obteniendo filtros',
      sectors: [],
      roles: [],
      countryGroups: [
        {
          priority: 1,
          title: 'Mercados Principales',
          description: 'Países prioritarios - mercados principales',
          countries: staticData.countries
        }
      ],
      countries: staticData.countries,
    })
  }
}
