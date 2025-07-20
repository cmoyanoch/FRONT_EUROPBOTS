import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener token de la cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autenticado' 
        },
        { status: 401 }
      )
    }
    
    // Verificar token y obtener usuario
    const user = await AuthService.verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token inválido o expirado' 
        },
        { status: 401 }
      )
    }
    
    // Verificar si el usuario es administrador
    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Acceso denegado. Se requieren permisos de administrador.' 
        },
        { status: 403 }
      )
    }

    const userId = params.id
    const body = await request.json()
    const { role, is_active } = body

    let updatedUser

    // Actualizar rol si se proporciona
    if (role) {
      updatedUser = await AuthService.updateUserRole(userId, role)
    }
    
    // Actualizar estado si se proporciona
    if (typeof is_active === 'boolean') {
      updatedUser = await AuthService.toggleUserStatus(userId)
    }

    if (!updatedUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        user: updatedUser 
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 