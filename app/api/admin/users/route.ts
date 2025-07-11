import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
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
    
    // Obtener todos los usuarios
    const users = await AuthService.getAllUsers()
    
    return NextResponse.json(
      { 
        success: true, 
        users 
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 