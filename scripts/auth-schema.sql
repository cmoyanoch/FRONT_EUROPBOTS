-- Script para crear el esquema de autenticación en PostgreSQL
-- Ejecutar en la base de datos n8n existente

-- Crear esquema para la aplicación web
CREATE SCHEMA IF NOT EXISTS webapp;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS webapp.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones para manejar tokens JWT
CREATE TABLE IF NOT EXISTS webapp.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES webapp.users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de perfiles extendidos (opcional)
CREATE TABLE IF NOT EXISTS webapp.profiles (
  id UUID PRIMARY KEY REFERENCES webapp.users(id) ON DELETE CASCADE,
  bio TEXT,
  website VARCHAR(255),
  location VARCHAR(255),
  company VARCHAR(255),
  role VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON webapp.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON webapp.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON webapp.users(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON webapp.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON webapp.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON webapp.sessions(expires_at);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION webapp.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON webapp.users 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON webapp.profiles 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION webapp.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webapp.sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON SCHEMA webapp IS 'Esquema para la aplicación web de autenticación';
COMMENT ON TABLE webapp.users IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE webapp.sessions IS 'Tabla para manejar sesiones y tokens JWT';
COMMENT ON TABLE webapp.profiles IS 'Tabla para información extendida de perfiles de usuario';

-- Permisos (ajustar según tu configuración de seguridad)
GRANT USAGE ON SCHEMA webapp TO n8n;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA webapp TO n8n;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA webapp TO n8n;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA webapp TO n8n;

-- Crear usuario administrador por defecto (password: admin123)
INSERT INTO webapp.users (email, password_hash, full_name, role) VALUES 
('admin@europbots.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ8Kj1G', 'Administrador Europbots', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Verificar que todo se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'webapp' 
ORDER BY table_name, ordinal_position; 