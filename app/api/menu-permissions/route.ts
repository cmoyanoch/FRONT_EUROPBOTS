import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import pool from '@/lib/database'

// GET: Obtener permisos del menú para el usuario autenticado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener permisos del menú para el rol del usuario
    const query = `
      SELECT 
        mo.id,
        mo.name,
        mo.label,
        mo.href,
        mo.icon,
        mo.badge,
        mo.order_index,
        COALESCE(rp.can_access, false) as can_access
      FROM webapp.menu_options mo
      LEFT JOIN webapp.role_permissions rp ON mo.id = rp.menu_option_id AND rp.role = $1
      WHERE mo.is_active = true
      ORDER BY mo.order_index
    `

    const result = await pool.query(query, [user.role])
    
    // Filtrar solo las opciones a las que tiene acceso
    const menuItems = result.rows
      .filter((item: any) => item.can_access)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        label: item.label,
        href: item.href,
        icon: item.icon,
        badge: item.badge
      }))

    return NextResponse.json({ menuItems })

  } catch (error) {
    console.error('Error al obtener permisos del menú:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 