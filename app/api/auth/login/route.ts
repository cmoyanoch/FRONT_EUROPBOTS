import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

// Esquema de validación para login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = loginSchema.parse(body)
    
    // Iniciar sesión
    const { user, token } = await AuthService.login(
      validatedData.email,
      validatedData.password
    )
    
    // Crear respuesta con cookie
    const response = NextResponse.json(
      { 
        success: true, 
        user,
        message: 'Sesión iniciada exitosamente' 
      },
      { status: 200 }
    )
    
    // Establecer cookie de autenticación
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    })
    
    return response
    
  } catch (error) {
    console.error('Error en login:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 401 }
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