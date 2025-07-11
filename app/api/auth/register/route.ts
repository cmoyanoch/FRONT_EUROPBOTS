import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

// Esquema de validación para registro
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = registerSchema.parse(body)
    
    // Registrar usuario
    const user = await AuthService.register(
      validatedData.email,
      validatedData.password,
      validatedData.fullName
    )
    
    // Generar token
    const token = await AuthService.login(validatedData.email, validatedData.password)
    
    // Crear respuesta con cookie
    const response = NextResponse.json(
      { 
        success: true, 
        user,
        message: 'Usuario registrado exitosamente' 
      },
      { status: 201 }
    )
    
    // Establecer cookie de autenticación
    response.cookies.set('auth-token', token.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    })
    
    return response
    
  } catch (error) {
    console.error('Error en registro:', error)
    
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