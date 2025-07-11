import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './database'
import type { User, Session } from './database'

export interface UserWithRole extends Omit<User, 'password_hash'> {
  role: 'user' | 'admin'
  is_active: boolean
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  private static readonly JWT_EXPIRES_IN = '7d'

  /**
   * Registrar un nuevo usuario
   */
  static async register(email: string, password: string, fullName?: string): Promise<UserWithRole> {
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM webapp.users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw new Error('El usuario ya existe con este email')
    }

    // Hashear la contraseña
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insertar el nuevo usuario
    const result = await pool.query(
      `INSERT INTO webapp.users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING id, email, full_name, avatar_url, role, is_active, created_at, updated_at`,
      [email, passwordHash, fullName]
    )

    return result.rows[0]
  }

  /**
   * Iniciar sesión de usuario
   */
  static async login(email: string, password: string): Promise<{ user: UserWithRole, token: string }> {
    // Buscar usuario por email
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, avatar_url, role, is_active, created_at, updated_at FROM webapp.users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      throw new Error('Credenciales inválidas')
    }

    const user = result.rows[0]

    // Verificar si el usuario está activo
    if (!user.is_active) {
      throw new Error('Cuenta desactivada')
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas')
    }

    // Generar token
    const token = this.generateToken(user.id)

    // Guardar sesión
    await this.saveSession(user.id, token)

    // Retornar usuario sin password_hash
    const { password_hash, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  /**
   * Verificar token y obtener usuario
   */
  static async verifyToken(token: string): Promise<UserWithRole | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string }
      
      // Verificar si la sesión existe en la base de datos
      const sessionResult = await pool.query(
        'SELECT user_id FROM webapp.sessions WHERE token = $1 AND expires_at > NOW()',
        [token]
      )

      if (sessionResult.rows.length === 0) {
        return null
      }

      // Obtener información del usuario
      const userResult = await pool.query(
        'SELECT id, email, full_name, avatar_url, role, is_active, created_at, updated_at FROM webapp.users WHERE id = $1',
        [decoded.userId]
      )

      return userResult.rows.length > 0 ? userResult.rows[0] : null
    } catch (error) {
      return null
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(userId: string): Promise<UserWithRole | null> {
    const result = await pool.query(
      'SELECT id, email, full_name, avatar_url, role, is_active, created_at, updated_at FROM webapp.users WHERE id = $1',
      [userId]
    )

    return result.rows.length > 0 ? result.rows[0] : null
  }

  /**
   * Obtener todos los usuarios (solo para administradores)
   */
  static async getAllUsers(): Promise<UserWithRole[]> {
    const result = await pool.query(
      'SELECT id, email, full_name, avatar_url, role, is_active, created_at, updated_at FROM webapp.users ORDER BY created_at DESC'
    )

    return result.rows
  }

  /**
   * Actualizar rol de usuario (solo para administradores)
   */
  static async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<UserWithRole> {
    const result = await pool.query(
      'UPDATE webapp.users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, avatar_url, role, is_active, created_at, updated_at',
      [role, userId]
    )

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    return result.rows[0]
  }

  /**
   * Activar/desactivar usuario (solo para administradores)
   */
  static async toggleUserStatus(userId: string): Promise<UserWithRole> {
    const result = await pool.query(
      'UPDATE webapp.users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, email, full_name, avatar_url, role, is_active, created_at, updated_at',
      [userId]
    )

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    return result.rows[0]
  }

  /**
   * Eliminar usuario (solo para administradores)
   */
  static async deleteUser(userId: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM webapp.users WHERE id = $1',
      [userId]
    )

    if (result.rowCount === 0) {
      throw new Error('Usuario no encontrado')
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(token: string): Promise<void> {
    await pool.query(
      'DELETE FROM webapp.sessions WHERE token = $1',
      [token]
    )
  }

  /**
   * Generar token JWT
   */
  private static generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    )
  }

  /**
   * Guardar sesión en la base de datos
   */
  private static async saveSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 días

    await pool.query(
      'INSERT INTO webapp.sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    )
  }

  /**
   * Limpiar sesiones expiradas
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await pool.query(
      'DELETE FROM webapp.sessions WHERE expires_at < NOW()'
    )
    return result.rowCount || 0
  }
} 