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
    
    return NextResponse.json(
      { 
        success: true, 
        user 
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 