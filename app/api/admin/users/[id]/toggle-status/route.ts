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
    
    // No permitir que el administrador se desactive a sí mismo
    if (user.id === params.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No puedes desactivar tu propia cuenta' 
        },
        { status: 400 }
      )
    }
    
    // Cambiar estado del usuario
    const updatedUser = await AuthService.toggleUserStatus(params.id)
    
    const status = updatedUser.is_active ? 'activado' : 'desactivado'
    
    return NextResponse.json(
      { 
        success: true, 
        user: updatedUser,
        message: `Usuario ${status} exitosamente` 
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 