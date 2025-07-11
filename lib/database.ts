import { Pool } from 'pg'

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configuraciones adicionales para mejor rendimiento
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo máximo que una conexión puede estar inactiva
  connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
})

// Verificar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL')
})

pool.on('error', (err: Error) => {
  console.error('❌ Error en la conexión de PostgreSQL:', err)
})

export default pool

// Tipos para TypeScript
export interface User {
  id: string
  email: string
  password_hash: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin'
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}

export interface Profile {
  id: string
  bio?: string
  website?: string
  location?: string
  company?: string
  role?: string
  preferences?: Record<string, any>
  created_at: Date
  updated_at: Date
} 