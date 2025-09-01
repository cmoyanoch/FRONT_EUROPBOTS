import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'n8n_user',
  host: process.env.DB_HOST || 'server_europbot-n8n_postgres-1',
  database: process.env.DB_NAME || 'n8n_db',
  password: process.env.DB_PASSWORD || '3Lchunch0',
  port: parseInt(process.env.DB_PORT || '5432'),
})

// Función para convertir roles a perfiles
async function convertRolesToProfiles(roles: string[]): Promise<{roles: any[], profiles: number[]}> {
  if (!roles || roles.length === 0) return { roles: [], profiles: [] }

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT DISTINCT id_profiles, name
        FROM webapp.roles
        WHERE name = ANY($1) AND is_active = true
        ORDER BY id_profiles, name
      `, [roles])

      const profiles = result.rows.map(row => row.id_profiles).filter(id => id !== null)
      const uniqueProfiles = Array.from(new Set(profiles))

      return {
        roles: result.rows,
        profiles: uniqueProfiles
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error convirtiendo roles a perfiles:', error)
    throw error
  }
}

// Función para obtener estadísticas de la tabla
async function getTableStats() {
  try {
    const client = await pool.connect()
    try {
      // Estadísticas básicas
      const stats = await client.query(`
        SELECT
          COUNT(*) as total_roles,
          COUNT(DISTINCT id_profiles) as unique_profiles,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_roles
        FROM webapp.roles
      `)

      // Ejemplos de roles por perfil
      const examples = await client.query(`
        SELECT
          r.id_profiles,
          p.key_profiles as profile_name,
          array_agg(r.name ORDER BY r.name) as roles
        FROM webapp.roles r
        LEFT JOIN webapp.profiles p ON r.id_profiles = p.id
        WHERE r.is_active = true
        GROUP BY r.id_profiles, p.key_profiles
        ORDER BY r.id_profiles
        LIMIT 10
      `)

      return {
        stats: stats.rows[0],
        examples: examples.rows
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== VALIDACIÓN DE CONVERSIÓN ROLES → PERFILES ===')

    // Obtener estadísticas
    const tableInfo = await getTableStats()

    // Pruebas de conversión
    const testCases = [
      ['CEO', 'CTO', 'CFO'],
      ['CEO'],
      ['Operations Director', 'Sales Director'],
      ['Managing Director', 'Operations Director'],
      ['Country Manager', 'Regional Sales Manager'],
      ['Sales Manager', 'Operations Manager'],
      ['Rol Inexistente'], // Para probar rol que no existe
    ]

    const testResults = []

    for (const testRoles of testCases) {
      try {
        const result = await convertRolesToProfiles(testRoles)
        testResults.push({
          input: testRoles,
          output: result,
          success: true
        })

        console.log(`Prueba: ${JSON.stringify(testRoles)}`)
        console.log(`Resultado: perfiles ${JSON.stringify(result.profiles)}`)
        result.roles.forEach(role => {
          console.log(`  - "${role.name}" → Perfil ${role.id_profiles}`)
        })
      } catch (error) {
        testResults.push({
          input: testRoles,
          error: error instanceof Error ? error.message : 'Error desconocido',
          success: false
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Validación de conversión roles → perfiles',
      data: {
        tableInfo,
        testResults
      }
    })

  } catch (error) {
    console.error('Error en validación:', error)
    return NextResponse.json({
      success: false,
      message: 'Error en la validación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roles } = body

    if (!roles || !Array.isArray(roles)) {
      return NextResponse.json({
        success: false,
        message: 'Se requiere un array de roles'
      }, { status: 400 })
    }

    console.log('=== CONVERSIÓN PERSONALIZADA ===')
    console.log('Roles recibidos:', roles)

    const result = await convertRolesToProfiles(roles)

    console.log('Roles encontrados:')
    result.roles.forEach(role => {
      console.log(`  - "${role.name}" → Perfil ${role.id_profiles}`)
    })
    console.log('Perfiles únicos:', result.profiles)

    return NextResponse.json({
      success: true,
      message: 'Conversión realizada',
      input: roles,
      output: {
        rolesFound: result.roles,
        profileIds: result.profiles,
        conversionMapping: result.roles.map(role => ({
          role: role.name,
          profileId: role.id_profiles
        }))
      }
    })

  } catch (error) {
    console.error('Error en conversión personalizada:', error)
    return NextResponse.json({
      success: false,
      message: 'Error en la conversión',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
