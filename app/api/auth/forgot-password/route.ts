import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import crypto from 'crypto'

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
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // Verificar si el usuario existe
      const userResult = await client.query(
        'SELECT id, email, full_name FROM webapp.users WHERE email = $1 AND is_active = true',
        [email]
      )

      if (userResult.rows.length === 0) {
        // Por seguridad, no revelamos si el email existe o no
        return NextResponse.json(
          { success: true, message: 'Si el email existe, recibirás un enlace de recuperación' },
          { status: 200 }
        )
      }

      const user = userResult.rows[0]

      // Generar token único
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      // Eliminar tokens anteriores para este usuario
      await client.query(
        'DELETE FROM webapp.password_reset_tokens WHERE user_id = $1',
        [user.id]
      )

      // Insertar nuevo token
      await client.query(
        'INSERT INTO webapp.password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, expiresAt]
      )

      // Generar URL de reset
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/forgot-password?token=${token}`

      // TODO: Enviar email con el enlace de reset
      // Por ahora, solo logueamos la URL para desarrollo
      console.log('🔗 URL de reset de contraseña:', resetUrl)
      console.log('📧 Para usuario:', user.email)
      console.log('⏰ Expira en:', expiresAt)

      // En producción, aquí se enviaría el email usando un servicio como SendGrid, AWS SES, etc.
      // Ejemplo con nodemailer:
      /*
      const transporter = nodemailer.createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Recuperación de contraseña - EUROPBOTS',
        html: `
          <h2>Recuperación de contraseña</h2>
          <p>Hola ${user.full_name || 'Usuario'},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <a href="${resetUrl}" style="background: #00ff88; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Restablecer Contraseña
          </a>
          <p>Este enlace expira en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        `
      })
      */

      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error en forgot-password:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 