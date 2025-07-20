import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import pool from '@/lib/database'

interface MenuOption {
  id: string
  name: string
  label: string
  href: string
  icon: string
  badge: string | null
  order_index: number
  is_active: boolean
}

interface Permission {
  role: string
  menu_option_id: string
  can_access: boolean
}

// GET: Obtener todos los permisos del menú
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener todas las opciones del menú
    const menuOptionsQuery = `
      SELECT id, name, label, href, icon, badge, order_index, is_active
      FROM webapp.menu_options 
      WHERE is_active = true 
      ORDER BY order_index
    `
    const menuOptions = await pool.query(menuOptionsQuery)

    // Obtener permisos por rol
    const permissionsQuery = `
      SELECT rp.role, rp.menu_option_id, rp.can_access
      FROM webapp.role_permissions rp
      JOIN webapp.menu_options mo ON rp.menu_option_id = mo.id
      WHERE mo.is_active = true
      ORDER BY mo.order_index, rp.role
    `
    const permissions = await pool.query(permissionsQuery)

    // Organizar los datos para la respuesta
    const roles = ['user', 'admin']
    const result = {
      menuOptions: menuOptions.rows,
      permissions: roles.map(role => ({
        role,
        permissions: menuOptions.rows.map((option: MenuOption) => {
          const permission = permissions.rows.find((p: Permission) => 
            p.role === role && p.menu_option_id === option.id
          )
          return {
            menu_option_id: option.id,
            name: option.name,
            label: option.label,
            can_access: permission ? permission.can_access : false
          }
        })
      }))
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error al obtener permisos del menú:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Actualizar permisos del menú
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { role, permissions } = body

    if (!role || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    // Iniciar transacción
    const client = await pool.connect()
    await client.query('BEGIN')

    try {
      // Eliminar permisos existentes para el rol
      await client.query(
        'DELETE FROM webapp.role_permissions WHERE role = $1',
        [role]
      )

      // Insertar nuevos permisos
      for (const permission of permissions) {
        if (permission.menu_option_id && typeof permission.can_access === 'boolean') {
          await client.query(
            `INSERT INTO webapp.role_permissions (role, menu_option_id, can_access)
             VALUES ($1, $2, $3)`,
            [role, permission.menu_option_id, permission.can_access]
          )
        }
      }

      // Confirmar transacción
      await client.query('COMMIT')

      // Registrar actividad
      await client.query(
        'SELECT webapp.log_user_activity($1, $2, $3)',
        [
          user.id,
          'update_menu_permissions',
          JSON.stringify({ role, permissions_count: permissions.length })
        ]
      )

      client.release()
      return NextResponse.json({ 
        success: true, 
        message: 'Permisos actualizados correctamente' 
      })

    } catch (error) {
      // Revertir transacción en caso de error
      await client.query('ROLLBACK')
      client.release()
      throw error
    }

  } catch (error) {
    console.error('Error al actualizar permisos del menú:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 