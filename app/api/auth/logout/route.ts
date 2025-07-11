import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Obtener token de la cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (token) {
      // Cerrar sesión en la base de datos
      await AuthService.logout(token)
    }
    
    // Crear respuesta
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Sesión cerrada exitosamente' 
      },
      { status: 200 }
    )
    
    // Eliminar cookie de autenticación
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expirar inmediatamente
      path: '/',
    })
    
    return response
    
  } catch (error) {
    console.error('Error en logout:', error)
    
    // Aún así, eliminar la cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Sesión cerrada' 
      },
      { status: 200 }
    )
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    
    return response
  }
} 