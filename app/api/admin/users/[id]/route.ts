import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

// Esquema de validación para actualizar rol
const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
})

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
    
    const body = await request.json()
    const validatedData = updateRoleSchema.parse(body)
    
    // Actualizar rol del usuario
    const updatedUser = await AuthService.updateUserRole(params.id, validatedData.role)
    
    return NextResponse.json(
      { 
        success: true, 
        user: updatedUser,
        message: 'Rol actualizado exitosamente' 
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error al actualizar rol:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos' 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    
    // No permitir que el administrador se elimine a sí mismo
    if (user.id === params.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No puedes eliminar tu propia cuenta' 
        },
        { status: 400 }
      )
    }
    
    // Eliminar usuario
    await AuthService.deleteUser(params.id)
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Usuario eliminado exitosamente' 
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 