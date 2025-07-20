import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'n8n_postgres',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
})

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // Verificar si el token existe y no ha expirado
      const tokenResult = await client.query(
        `SELECT prt.user_id, prt.expires_at, u.email, u.full_name 
         FROM webapp.password_reset_tokens prt
         JOIN webapp.users u ON prt.user_id = u.id
         WHERE prt.token = $1 AND prt.expires_at > NOW()`,
        [token]
      )

      if (tokenResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Token inválido o expirado' },
          { status: 400 }
        )
      }

      const resetToken = tokenResult.rows[0]

      // Verificar que el usuario esté activo
      const userResult = await client.query(
        'SELECT id FROM webapp.users WHERE id = $1 AND is_active = true',
        [resetToken.user_id]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Usuario no encontrado o inactivo' },
          { status: 400 }
        )
      }

      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Actualizar la contraseña del usuario
      await client.query(
        'UPDATE webapp.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, resetToken.user_id]
      )

      // Eliminar el token usado
      await client.query(
        'DELETE FROM webapp.password_reset_tokens WHERE token = $1',
        [token]
      )

      // Registrar la actividad
      await client.query(
        'INSERT INTO webapp.user_activity_log (user_id, action, details) VALUES ($1, $2, $3)',
        [resetToken.user_id, 'password_reset', JSON.stringify({ message: 'Contraseña restablecida exitosamente' })]
      )

      console.log('✅ Contraseña restablecida para usuario:', resetToken.email)

      return NextResponse.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error en reset-password:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 