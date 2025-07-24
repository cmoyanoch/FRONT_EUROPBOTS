-- =====================================================
-- MIGRACIÓN: Esquema de Autenticación EUROPBOTS
-- Versión: 1.0.1
-- Fecha: 2024
-- Descripción: Creación inicial del esquema de autenticación + Gestión de Permisos del Menú
-- =====================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear esquema para la aplicación web
CREATE SCHEMA IF NOT EXISTS webapp;

-- =====================================================
-- TABLA: users
-- Descripción: Tabla principal de usuarios del sistema
-- =====================================================
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

-- =====================================================
-- TABLA: menu_options
-- Descripción: Opciones disponibles en el menú
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.menu_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  href VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  badge VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: role_permissions
-- Descripción: Permisos de cada rol para las opciones del menú
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  menu_option_id UUID REFERENCES webapp.menu_options(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, menu_option_id)
);

-- =====================================================
-- TABLA: sessions
-- Descripción: Tabla para manejar tokens JWT y sesiones
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES webapp.users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: profiles
-- Descripción: Tabla para información extendida de perfiles
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.profiles (
  id UUID PRIMARY KEY REFERENCES webapp.users(id) ON DELETE CASCADE,
  bio TEXT,
  website VARCHAR(255),
  location VARCHAR(255),
  company VARCHAR(255),
  job_title VARCHAR(255),
  phone VARCHAR(50),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: user_activity_log
-- Descripción: Log de actividades de usuarios para auditoría
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES webapp.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: password_reset_tokens
-- Descripción: Tokens para restablecimiento de contraseñas
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES webapp.users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLAS DE MAPEO DE FILTROS PARA PHANTOMBUSTER
-- Descripción: Mapeo de filtros de búsqueda para LinkedIn
-- =====================================================

-- =====================================================
-- TABLA: search_industries
-- Descripción: Mapeo de industrias para búsquedas de LinkedIn
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.search_industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  linkedin_code VARCHAR(20) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: search_job_titles
-- Descripción: Mapeo de títulos de trabajo para búsquedas de LinkedIn
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.search_job_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: search_locations
-- Descripción: Mapeo de ubicaciones para búsquedas de LinkedIn
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.search_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  linkedin_code VARCHAR(20) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: search_company_sizes
-- Descripción: Mapeo de tamaños de empresa para búsquedas de LinkedIn
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.search_company_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  linkedin_code VARCHAR(10) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para la tabla users
CREATE INDEX IF NOT EXISTS idx_users_email ON webapp.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON webapp.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON webapp.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON webapp.users(created_at);

-- Índices para la tabla menu_options
CREATE INDEX IF NOT EXISTS idx_menu_options_name ON webapp.menu_options(name);
CREATE INDEX IF NOT EXISTS idx_menu_options_is_active ON webapp.menu_options(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_options_order_index ON webapp.menu_options(order_index);

-- Índices para la tabla role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON webapp.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_menu_option_id ON webapp.role_permissions(menu_option_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_can_access ON webapp.role_permissions(can_access);

-- Índices para la tabla sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON webapp.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON webapp.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON webapp.sessions(expires_at);

-- Índices para la tabla user_activity_log
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON webapp.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON webapp.user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON webapp.user_activity_log(created_at);

-- Índices para la tabla password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON webapp.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON webapp.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON webapp.password_reset_tokens(expires_at);

-- Índices para las tablas de mapeo de filtros
-- Índices para search_industries
CREATE INDEX IF NOT EXISTS idx_search_industries_code ON webapp.search_industries(code);
CREATE INDEX IF NOT EXISTS idx_search_industries_name ON webapp.search_industries(name);
CREATE INDEX IF NOT EXISTS idx_search_industries_linkedin_code ON webapp.search_industries(linkedin_code);
CREATE INDEX IF NOT EXISTS idx_search_industries_is_active ON webapp.search_industries(is_active);
CREATE INDEX IF NOT EXISTS idx_search_industries_order_index ON webapp.search_industries(order_index);

-- Índices para search_job_titles
CREATE INDEX IF NOT EXISTS idx_search_job_titles_code ON webapp.search_job_titles(code);
CREATE INDEX IF NOT EXISTS idx_search_job_titles_name ON webapp.search_job_titles(name);
CREATE INDEX IF NOT EXISTS idx_search_job_titles_is_active ON webapp.search_job_titles(is_active);
CREATE INDEX IF NOT EXISTS idx_search_job_titles_order_index ON webapp.search_job_titles(order_index);

-- Índices para search_locations
CREATE INDEX IF NOT EXISTS idx_search_locations_code ON webapp.search_locations(code);
CREATE INDEX IF NOT EXISTS idx_search_locations_name ON webapp.search_locations(name);
CREATE INDEX IF NOT EXISTS idx_search_locations_linkedin_code ON webapp.search_locations(linkedin_code);
CREATE INDEX IF NOT EXISTS idx_search_locations_is_active ON webapp.search_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_search_locations_order_index ON webapp.search_locations(order_index);

-- Índices para search_company_sizes
CREATE INDEX IF NOT EXISTS idx_search_company_sizes_code ON webapp.search_company_sizes(code);
CREATE INDEX IF NOT EXISTS idx_search_company_sizes_name ON webapp.search_company_sizes(name);
CREATE INDEX IF NOT EXISTS idx_search_company_sizes_linkedin_code ON webapp.search_company_sizes(linkedin_code);
CREATE INDEX IF NOT EXISTS idx_search_company_sizes_is_active ON webapp.search_company_sizes(is_active);
CREATE INDEX IF NOT EXISTS idx_search_company_sizes_order_index ON webapp.search_company_sizes(order_index);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION webapp.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Función para limpiar tokens de reset expirados
CREATE OR REPLACE FUNCTION webapp.cleanup_expired_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webapp.password_reset_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar actividad de usuario
CREATE OR REPLACE FUNCTION webapp.log_user_activity(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO webapp.user_activity_log (user_id, action, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener permisos del menú por rol
CREATE OR REPLACE FUNCTION webapp.get_menu_permissions(p_role VARCHAR(50))
RETURNS TABLE (
    menu_option_id UUID,
    name VARCHAR(100),
    label VARCHAR(255),
    href VARCHAR(255),
    icon VARCHAR(100),
    badge VARCHAR(50),
    order_index INTEGER,
    can_access BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mo.id,
        mo.name,
        mo.label,
        mo.href,
        mo.icon,
        mo.badge,
        mo.order_index,
        COALESCE(rp.can_access, false) as can_access
    FROM webapp.menu_options mo
    LEFT JOIN webapp.role_permissions rp ON mo.id = rp.menu_option_id AND rp.role = p_role
    WHERE mo.is_active = true
    ORDER BY mo.order_index;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar permisos de rol
CREATE OR REPLACE FUNCTION webapp.update_role_permissions(
    p_role VARCHAR(50),
    p_permissions JSONB
)
RETURNS INTEGER AS $$
DECLARE
    permission_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Eliminar permisos existentes para el rol
    DELETE FROM webapp.role_permissions WHERE role = p_role;
    
    -- Insertar nuevos permisos
    FOR permission_record IN 
        SELECT * FROM jsonb_array_elements(p_permissions)
    LOOP
        INSERT INTO webapp.role_permissions (role, menu_option_id, can_access)
        VALUES (
            p_role,
            (permission_record->>'menu_option_id')::UUID,
            (permission_record->>'can_access')::BOOLEAN
        );
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_users_updated_at ON webapp.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON webapp.users 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON webapp.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON webapp.profiles 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_options_updated_at ON webapp.menu_options;
CREATE TRIGGER update_menu_options_updated_at 
    BEFORE UPDATE ON webapp.menu_options 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON webapp.role_permissions;
CREATE TRIGGER update_role_permissions_updated_at 
    BEFORE UPDATE ON webapp.role_permissions 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

-- Triggers para las tablas de mapeo de filtros
DROP TRIGGER IF EXISTS update_search_industries_updated_at ON webapp.search_industries;
CREATE TRIGGER update_search_industries_updated_at 
    BEFORE UPDATE ON webapp.search_industries 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_job_titles_updated_at ON webapp.search_job_titles;
CREATE TRIGGER update_search_job_titles_updated_at 
    BEFORE UPDATE ON webapp.search_job_titles 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_locations_updated_at ON webapp.search_locations;
CREATE TRIGGER update_search_locations_updated_at 
    BEFORE UPDATE ON webapp.search_locations 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_company_sizes_updated_at ON webapp.search_company_sizes;
CREATE TRIGGER update_search_company_sizes_updated_at 
    BEFORE UPDATE ON webapp.search_company_sizes 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para usuarios activos con información básica
CREATE OR REPLACE VIEW webapp.active_users AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.avatar_url,
    u.created_at,
    u.updated_at,
    p.company,
    p.job_title,
    p.location
FROM webapp.users u
LEFT JOIN webapp.profiles p ON u.id = p.id
WHERE u.is_active = true;

-- Vista para sesiones activas con información del usuario
CREATE OR REPLACE VIEW webapp.active_sessions AS
SELECT 
    s.id as session_id,
    s.token,
    s.expires_at,
    s.created_at as session_created_at,
    u.id as user_id,
    u.email,
    u.full_name,
    u.role
FROM webapp.sessions s
JOIN webapp.users u ON s.user_id = u.id
WHERE s.expires_at > CURRENT_TIMESTAMP;

-- Vista para permisos del menú por rol
CREATE OR REPLACE VIEW webapp.menu_permissions_view AS
SELECT 
    rp.role,
    mo.name,
    mo.label,
    mo.href,
    mo.icon,
    mo.badge,
    mo.order_index,
    rp.can_access
FROM webapp.menu_options mo
JOIN webapp.role_permissions rp ON mo.id = rp.menu_option_id
WHERE mo.is_active = true
ORDER BY mo.order_index, rp.role;

-- =====================================================
-- PERMISOS Y SEGURIDAD
-- =====================================================

-- Crear usuario específico para la aplicación web (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'webapp_user') THEN
        CREATE USER webapp_user WITH PASSWORD 'webapp_password';
    END IF;
END
$$;

-- Dar permisos al usuario webapp_user
GRANT USAGE ON SCHEMA webapp TO webapp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA webapp TO webapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA webapp TO webapp_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA webapp TO webapp_user;
GRANT ALL PRIVILEGES ON SCHEMA webapp TO webapp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA webapp GRANT ALL ON TABLES TO webapp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA webapp GRANT ALL ON SEQUENCES TO webapp_user;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Crear usuario administrador por defecto (password: admin123)
INSERT INTO webapp.users (email, password_hash, full_name, role) VALUES 
('admin@europbots.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ8Kj1G', 'Administrador Europbots', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Crear perfil para el administrador
INSERT INTO webapp.profiles (id, company, job_title, bio) 
SELECT 
    u.id,
    'EUROPBOTS',
    'Administrador del Sistema',
    'Administrador principal de la plataforma EUROPBOTS'
FROM webapp.users u 
WHERE u.email = 'admin@europbots.com'
ON CONFLICT (id) DO NOTHING;

-- Insertar opciones del menú por defecto
INSERT INTO webapp.menu_options (name, label, href, icon, badge, order_index) VALUES 
('dashboard', 'Dashboard', '/dashboard', 'LayoutDashboard', NULL, 1),
('search', 'Búsqueda', '/search', 'Search', NULL, 2),
('leads', 'Leads', '/leads', 'Users', '12', 3),
('messages', 'Mensajes', '/messages', 'MessageSquare', '5', 4),
('automation', 'Automatización', '/automation', 'Zap', NULL, 5),
('analytics', 'Analytics', '/analytics', 'BarChart3', NULL, 6),
('alerts', 'Alertas', '/alerts', 'Bell', '3', 7),
('config', 'Configuración', '/config', 'Settings', NULL, 8)
ON CONFLICT (name) DO NOTHING;

-- Insertar permisos por defecto
-- Usuarios: acceso básico
INSERT INTO webapp.role_permissions (role, menu_option_id, can_access) 
SELECT 'user', id, true FROM webapp.menu_options WHERE name IN ('dashboard', 'search', 'leads', 'messages', 'alerts')
ON CONFLICT (role, menu_option_id) DO NOTHING;

-- Administradores: acceso completo
INSERT INTO webapp.role_permissions (role, menu_option_id, can_access) 
SELECT 'admin', id, true FROM webapp.menu_options
ON CONFLICT (role, menu_option_id) DO NOTHING;

-- =====================================================
-- DATOS INICIALES PARA MAPEO DE FILTROS
-- =====================================================

-- Insertar industrias
INSERT INTO webapp.search_industries (code, name, linkedin_code, description, order_index) VALUES 
('HORECA', 'HoReCa (Hoteles/Restaurantes)', '4', 'Hoteles, Restaurantes y Cafeterías', 1),
('LOGISTICS_WAREHOUSING', 'Logistics & Warehousing', '47', 'Logística y Almacenamiento', 2),
('CLEANING_SERVICES', 'Cleaning Services', '48', 'Servicios de Limpieza', 3),
('HEALTHCARE_INSTITUTIONS', 'Healthcare Institutions', '4', 'Instituciones de Salud', 4),
('COMMERCIAL_REAL_ESTATE', 'Commercial Real Estate', '47', 'Bienes Raíces Comerciales', 5),
('EVENTS_EXHIBITIONS', 'Events & Exhibitions', '49', 'Eventos y Exposiciones', 6),
('CONSTRUCTION', 'Construction', '6', 'Construcción', 7)
ON CONFLICT (code) DO NOTHING;

-- Insertar job titles
INSERT INTO webapp.search_job_titles (code, name, keywords, description, order_index) VALUES 
('C_LEVEL', 'C-Level (CEO, COO, CTO, CMO)', '["CEO", "COO", "CTO", "CMO", "CFO", "Chief Executive Officer", "Chief Operating Officer", "Chief Technology Officer", "Chief Marketing Officer", "Chief Financial Officer"]', 'Nivel Ejecutivo C-Level', 1),
('VP_DIRECTOR', 'VP/Director Level', '["VP", "Vice President", "Director", "Vicepresidente", "Director General"]', 'Nivel Vicepresidente/Director', 2),
('OPERATIONS_MANAGER', 'Operations Manager', '["Operations Manager", "Gerente de Operaciones", "Operations Director"]', 'Gerente de Operaciones', 3),
('FACILITIES_MANAGER', 'Facilities Manager', '["Facilities Manager", "Gerente de Instalaciones", "Facility Manager"]', 'Gerente de Instalaciones', 4),
('PROCUREMENT_MANAGER', 'Procurement Manager', '["Procurement Manager", "Gerente de Compras", "Purchasing Manager", "Supply Chain Manager"]', 'Gerente de Compras', 5),
('INNOVATION_MANAGER', 'Innovation Manager', '["Innovation Manager", "Gerente de Innovación", "Innovation Director"]', 'Gerente de Innovación', 6),
('GENERAL_MANAGER', 'General Manager', '["General Manager", "Gerente General", "Managing Director"]', 'Gerente General', 7)
ON CONFLICT (code) DO NOTHING;

-- Insertar ubicaciones
INSERT INTO webapp.search_locations (code, name, linkedin_code, description, order_index) VALUES 
('FRANCE', 'Francia', '105015875', 'France', 1),
('GERMANY', 'Alemania', '101282230', 'Germany', 2),
('UK', 'Reino Unido', '101165590', 'United Kingdom', 3),
('SPAIN', 'España', '105646813', 'Spain', 4),
('ITALY', 'Italia', '103350119', 'Italy', 5),
('NETHERLANDS', 'Países Bajos', '102890719', 'Netherlands', 6),
('BELGIUM', 'Bélgica', '100565514', 'Belgium', 7)
ON CONFLICT (code) DO NOTHING;

-- Insertar tamaños de empresa
INSERT INTO webapp.search_company_sizes (code, name, linkedin_code, description, order_index) VALUES 
('SMALL_11_50', '11-50 empleados', 'A', 'Pequeña empresa (11-50 empleados)', 1),
('MEDIUM_51_200', '51-200 empleados', 'B', 'Empresa mediana (51-200 empleados)', 2),
('MEDIUM_LARGE_201_500', '201-500 empleados', 'C', 'Empresa mediana-grande (201-500 empleados)', 3),
('LARGE_501_1000', '501-1000 empleados', 'D', 'Empresa grande (501-1000 empleados)', 4),
('ENTERPRISE_1000_PLUS', '1000+ empleados', 'E', 'Empresa enterprise (1000+ empleados)', 5)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DOCUMENTACIÓN Y COMENTARIOS
-- =====================================================

COMMENT ON SCHEMA webapp IS 'Esquema para la aplicación web de autenticación EUROPBOTS';
COMMENT ON TABLE webapp.users IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE webapp.menu_options IS 'Opciones disponibles en el menú de navegación';
COMMENT ON TABLE webapp.role_permissions IS 'Permisos de cada rol para las opciones del menú';
COMMENT ON TABLE webapp.sessions IS 'Tabla para manejar sesiones y tokens JWT';
COMMENT ON TABLE webapp.profiles IS 'Tabla para información extendida de perfiles de usuario';
COMMENT ON TABLE webapp.user_activity_log IS 'Log de actividades de usuarios para auditoría';
COMMENT ON TABLE webapp.password_reset_tokens IS 'Tokens para restablecimiento de contraseñas';

-- Comentarios para las tablas de mapeo de filtros
COMMENT ON TABLE webapp.search_industries IS 'Mapeo de industrias para búsquedas de LinkedIn en Phantombuster';
COMMENT ON TABLE webapp.search_job_titles IS 'Mapeo de títulos de trabajo para búsquedas de LinkedIn en Phantombuster';
COMMENT ON TABLE webapp.search_locations IS 'Mapeo de ubicaciones para búsquedas de LinkedIn en Phantombuster';
COMMENT ON TABLE webapp.search_company_sizes IS 'Mapeo de tamaños de empresa para búsquedas de LinkedIn en Phantombuster';

COMMENT ON FUNCTION webapp.cleanup_expired_sessions() IS 'Limpia sesiones expiradas y retorna el número de sesiones eliminadas';
COMMENT ON FUNCTION webapp.cleanup_expired_reset_tokens() IS 'Limpia tokens de reset expirados y retorna el número eliminado';
COMMENT ON FUNCTION webapp.log_user_activity(UUID, VARCHAR, JSONB, INET, TEXT) IS 'Registra una actividad de usuario en el log';
COMMENT ON FUNCTION webapp.get_menu_permissions(VARCHAR) IS 'Obtiene los permisos del menú para un rol específico';
COMMENT ON FUNCTION webapp.update_role_permissions(VARCHAR, JSONB) IS 'Actualiza los permisos de un rol para las opciones del menú';

-- Comentarios para las funciones de mapeo de filtros
COMMENT ON FUNCTION webapp.map_industry_by_name(VARCHAR) IS 'Mapea una industria por nombre a su código LinkedIn';
COMMENT ON FUNCTION webapp.map_job_title_by_name(VARCHAR) IS 'Mapea un job title por nombre a sus palabras clave';
COMMENT ON FUNCTION webapp.map_location_by_name(VARCHAR) IS 'Mapea una ubicación por nombre a su código LinkedIn';
COMMENT ON FUNCTION webapp.map_company_size_by_name(VARCHAR) IS 'Mapea un tamaño de empresa por nombre a su código LinkedIn';
COMMENT ON FUNCTION webapp.get_active_search_filters() IS 'Obtiene todos los filtros de búsqueda activos organizados por tipo';

-- =====================================================
-- FUNCIONES PARA MAPEO DE FILTROS
-- =====================================================

-- Función para mapear industria por nombre
CREATE OR REPLACE FUNCTION webapp.map_industry_by_name(p_industry_name VARCHAR(255))
RETURNS TABLE (
    code VARCHAR(50),
    linkedin_code VARCHAR(20),
    name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        si.code,
        si.linkedin_code,
        si.name
    FROM webapp.search_industries si
    WHERE LOWER(si.name) = LOWER(p_industry_name)
    AND si.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para mapear job title por nombre
CREATE OR REPLACE FUNCTION webapp.map_job_title_by_name(p_job_title_name VARCHAR(255))
RETURNS TABLE (
    code VARCHAR(50),
    keywords JSONB,
    name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sjt.code,
        sjt.keywords,
        sjt.name
    FROM webapp.search_job_titles sjt
    WHERE LOWER(sjt.name) = LOWER(p_job_title_name)
    AND sjt.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para mapear ubicación por nombre
CREATE OR REPLACE FUNCTION webapp.map_location_by_name(p_location_name VARCHAR(255))
RETURNS TABLE (
    code VARCHAR(50),
    linkedin_code VARCHAR(20),
    name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.code,
        sl.linkedin_code,
        sl.name
    FROM webapp.search_locations sl
    WHERE LOWER(sl.name) = LOWER(p_location_name)
    AND sl.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para mapear company size por nombre
CREATE OR REPLACE FUNCTION webapp.map_company_size_by_name(p_size_name VARCHAR(255))
RETURNS TABLE (
    code VARCHAR(50),
    linkedin_code VARCHAR(10),
    name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        scs.code,
        scs.linkedin_code,
        scs.name
    FROM webapp.search_company_sizes scs
    WHERE LOWER(scs.name) = LOWER(p_size_name)
    AND scs.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener todos los filtros activos
CREATE OR REPLACE FUNCTION webapp.get_active_search_filters()
RETURNS TABLE (
    filter_type VARCHAR(20),
    code VARCHAR(50),
    name VARCHAR(255),
    linkedin_code VARCHAR(20),
    keywords JSONB,
    description TEXT,
    order_index INTEGER
) AS $$
BEGIN
    -- Industrias
    RETURN QUERY
    SELECT 
        'industry'::VARCHAR(20) as filter_type,
        si.code,
        si.name,
        si.linkedin_code,
        '[]'::JSONB as keywords,
        si.description,
        si.order_index
    FROM webapp.search_industries si
    WHERE si.is_active = true
    ORDER BY si.order_index;
    
    -- Job Titles
    RETURN QUERY
    SELECT 
        'job_title'::VARCHAR(20) as filter_type,
        sjt.code,
        sjt.name,
        ''::VARCHAR(20) as linkedin_code,
        sjt.keywords,
        sjt.description,
        sjt.order_index
    FROM webapp.search_job_titles sjt
    WHERE sjt.is_active = true
    ORDER BY sjt.order_index;
    
    -- Locations
    RETURN QUERY
    SELECT 
        'location'::VARCHAR(20) as filter_type,
        sl.code,
        sl.name,
        sl.linkedin_code,
        '[]'::JSONB as keywords,
        sl.description,
        sl.order_index
    FROM webapp.search_locations sl
    WHERE sl.is_active = true
    ORDER BY sl.order_index;
    
    -- Company Sizes
    RETURN QUERY
    SELECT 
        'company_size'::VARCHAR(20) as filter_type,
        scs.code,
        scs.name,
        scs.linkedin_code,
        '[]'::JSONB as keywords,
        scs.description,
        scs.order_index
    FROM webapp.search_company_sizes scs
    WHERE scs.is_active = true
    ORDER BY scs.order_index;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICACIÓN DE LA MIGRACIÓN
-- =====================================================

-- Verificar que las tablas se crearon correctamente
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    menu_options_count INTEGER;
    permissions_count INTEGER;
    industries_count INTEGER;
    job_titles_count INTEGER;
    locations_count INTEGER;
    company_sizes_count INTEGER;
BEGIN
    -- Contar tablas creadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'webapp';
    
    -- Contar funciones creadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'webapp';
    
    -- Contar opciones del menú
    SELECT COUNT(*) INTO menu_options_count
    FROM webapp.menu_options;
    
    -- Contar permisos
    SELECT COUNT(*) INTO permissions_count
    FROM webapp.role_permissions;
    
    -- Contar filtros de búsqueda
    SELECT COUNT(*) INTO industries_count
    FROM webapp.search_industries;
    
    SELECT COUNT(*) INTO job_titles_count
    FROM webapp.search_job_titles;
    
    SELECT COUNT(*) INTO locations_count
    FROM webapp.search_locations;
    
    SELECT COUNT(*) INTO company_sizes_count
    FROM webapp.search_company_sizes;
    
    RAISE NOTICE 'Migración completada: % tablas, % funciones, % opciones de menú, % permisos creados en el esquema webapp', 
        table_count, function_count, menu_options_count, permissions_count;
    RAISE NOTICE 'Filtros de búsqueda: % industrias, % job titles, % ubicaciones, % tamaños de empresa', 
        industries_count, job_titles_count, locations_count, company_sizes_count;
END
$$;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- ===================================================== 

-- ============================================================================
-- ESQUEMA DE LEADS PARA POSTGRESQL - COMPATIBLE CON AUTH-SCHEMA.SQL
-- ============================================================================

-- =====================================================
-- TABLA PRINCIPAL DE LEADS
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Información básica del perfil
    profile_url VARCHAR(500) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    job_title VARCHAR(255),
    additional_info TEXT,
    location VARCHAR(255),
    connection_degree VARCHAR(10) DEFAULT '2nd' CHECK (connection_degree IN ('1st', '2nd', '3rd+')),
    profile_image_url TEXT,
    vmid VARCHAR(255) UNIQUE,
    
    -- Información de búsqueda
    search_query VARCHAR(500),
    category VARCHAR(100) DEFAULT 'People',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shared_connections VARCHAR(255),
    
    -- Información de la empresa principal
    company VARCHAR(255),
    company_url VARCHAR(500),
    industry VARCHAR(255),
    
    -- Información de la segunda empresa
    company2 VARCHAR(255),
    company_url2 VARCHAR(500),
    job_title2 VARCHAR(255),
    job_date_range VARCHAR(100),
    job_date_range2 VARCHAR(100),
    
    -- Información educativa
    school VARCHAR(255),
    school_degree VARCHAR(255),
    school_date_range VARCHAR(100),
    school2 VARCHAR(255),
    school_degree2 VARCHAR(255),
    school_date_range2 VARCHAR(100),
    
    -- Metadatos del sistema
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'contacted', 'qualified', 'converted')),
    source VARCHAR(100) DEFAULT 'phantombuster',
    
    -- Campos adicionales para integración
    user_id UUID REFERENCES webapp.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES webapp.users(id) ON DELETE SET NULL,
    tags JSONB DEFAULT '[]',
    notes JSONB DEFAULT '[]',
    contact_history JSONB DEFAULT '[]',
    
    -- Campos CRM y proceso
    id_crm INTEGER,
    process VARCHAR(255)
);

-- =====================================================
-- TABLA DE HISTORIAL DE BÚSQUEDAS
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id VARCHAR(255) UNIQUE NOT NULL,
    search_query VARCHAR(500) NOT NULL,
    search_type VARCHAR(20) DEFAULT 'simple' CHECK (search_type IN ('simple', 'advanced')),
    search_params JSONB,
    total_results INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES webapp.users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA DE RELACIÓN LEADS-BÚSQUEDAS
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.lead_search_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES webapp.leads(id) ON DELETE CASCADE,
    search_id VARCHAR(255) NOT NULL REFERENCES webapp.search_history(search_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(lead_id, search_id)
);

-- =====================================================
-- TABLA DE NOTAS Y COMENTARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES webapp.leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES webapp.users(id) ON DELETE SET NULL,
    note_type VARCHAR(20) DEFAULT 'general' CHECK (note_type IN ('general', 'contact', 'qualification', 'follow_up')),
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE ESTADÍSTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.lead_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_leads INTEGER DEFAULT 0,
    new_leads INTEGER DEFAULT 0,
    contacted_leads INTEGER DEFAULT 0,
    qualified_leads INTEGER DEFAULT 0,
    converted_leads INTEGER DEFAULT 0,
    search_queries_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para la tabla leads
CREATE INDEX IF NOT EXISTS idx_leads_profile_url ON webapp.leads(profile_url);
CREATE INDEX IF NOT EXISTS idx_leads_full_name ON webapp.leads(full_name);
CREATE INDEX IF NOT EXISTS idx_leads_company ON webapp.leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_location ON webapp.leads(location);
CREATE INDEX IF NOT EXISTS idx_leads_job_title ON webapp.leads(job_title);
CREATE INDEX IF NOT EXISTS idx_leads_connection_degree ON webapp.leads(connection_degree);
CREATE INDEX IF NOT EXISTS idx_leads_status ON webapp.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON webapp.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_search_query ON webapp.leads(search_query);
CREATE INDEX IF NOT EXISTS idx_leads_vmid ON webapp.leads(vmid);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON webapp.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON webapp.leads(assigned_to);

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_leads_company_location ON webapp.leads(company, location);
CREATE INDEX IF NOT EXISTS idx_leads_job_title_location ON webapp.leads(job_title, location);
CREATE INDEX IF NOT EXISTS idx_leads_status_created_at ON webapp.leads(status, created_at);

-- Índice de texto completo para búsquedas
CREATE INDEX IF NOT EXISTS idx_leads_fulltext ON webapp.leads USING gin(to_tsvector('english', full_name || ' ' || COALESCE(job_title, '') || ' ' || COALESCE(company, '') || ' ' || COALESCE(location, '') || ' ' || COALESCE(additional_info, '')));

-- Índices para search_history
CREATE INDEX IF NOT EXISTS idx_search_history_search_id ON webapp.search_history(search_id);
CREATE INDEX IF NOT EXISTS idx_search_history_search_query ON webapp.search_history(search_query);
CREATE INDEX IF NOT EXISTS idx_search_history_status ON webapp.search_history(status);
CREATE INDEX IF NOT EXISTS idx_search_history_started_at ON webapp.search_history(started_at);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON webapp.search_history(user_id);

-- Índices para lead_search_mapping
CREATE INDEX IF NOT EXISTS idx_lead_search_mapping_lead_id ON webapp.lead_search_mapping(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_search_mapping_search_id ON webapp.lead_search_mapping(search_id);

-- Índices para lead_notes
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON webapp.lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_note_type ON webapp.lead_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON webapp.lead_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_notes_user_id ON webapp.lead_notes(user_id);

-- Índices para lead_statistics
CREATE INDEX IF NOT EXISTS idx_lead_statistics_date ON webapp.lead_statistics(date);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de leads con información completa
CREATE OR REPLACE VIEW webapp.leads_complete AS
SELECT 
    l.*,
    COUNT(ln.id) as notes_count,
    STRING_AGG(DISTINCT s.search_query, ', ') as search_queries,
    u.email as created_by_email,
    u.full_name as created_by_name,
    au.email as assigned_to_email,
    au.full_name as assigned_to_name
FROM webapp.leads l
LEFT JOIN webapp.lead_notes ln ON l.id = ln.lead_id
LEFT JOIN webapp.lead_search_mapping lsm ON l.id = lsm.lead_id
LEFT JOIN webapp.search_history s ON lsm.search_id = s.search_id
LEFT JOIN webapp.users u ON l.user_id = u.id
LEFT JOIN webapp.users au ON l.assigned_to = au.id
GROUP BY l.id, u.email, u.full_name, au.email, au.full_name;

-- Vista de estadísticas diarias
CREATE OR REPLACE VIEW webapp.daily_lead_statistics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_leads,
    COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_leads,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
    COUNT(DISTINCT company) as unique_companies,
    COUNT(DISTINCT location) as unique_locations
FROM webapp.leads
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- =====================================================
-- FUNCIONES
-- =====================================================

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION webapp.update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para insertar un nuevo lead
CREATE OR REPLACE FUNCTION webapp.insert_lead(
    p_profile_url VARCHAR(500),
    p_full_name VARCHAR(255),
    p_first_name VARCHAR(100) DEFAULT NULL,
    p_last_name VARCHAR(100) DEFAULT NULL,
    p_job_title VARCHAR(255) DEFAULT NULL,
    p_additional_info TEXT DEFAULT NULL,
    p_location VARCHAR(255) DEFAULT NULL,
    p_connection_degree VARCHAR(10) DEFAULT '2nd',
    p_profile_image_url TEXT DEFAULT NULL,
    p_vmid VARCHAR(255) DEFAULT NULL,
    p_search_query VARCHAR(500) DEFAULT NULL,
    p_category VARCHAR(100) DEFAULT 'People',
    p_shared_connections VARCHAR(255) DEFAULT NULL,
    p_company VARCHAR(255) DEFAULT NULL,
    p_company_url VARCHAR(500) DEFAULT NULL,
    p_industry VARCHAR(255) DEFAULT NULL,
    p_company2 VARCHAR(255) DEFAULT NULL,
    p_company_url2 VARCHAR(500) DEFAULT NULL,
    p_job_title2 VARCHAR(255) DEFAULT NULL,
    p_job_date_range VARCHAR(100) DEFAULT NULL,
    p_job_date_range2 VARCHAR(100) DEFAULT NULL,
    p_school VARCHAR(255) DEFAULT NULL,
    p_school_degree VARCHAR(255) DEFAULT NULL,
    p_school_date_range VARCHAR(100) DEFAULT NULL,
    p_school2 VARCHAR(255) DEFAULT NULL,
    p_school_degree2 VARCHAR(255) DEFAULT NULL,
    p_school_date_range2 VARCHAR(100) DEFAULT NULL,
    p_search_id VARCHAR(255) DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    lead_id UUID;
BEGIN
    -- Insertar o actualizar el lead
    INSERT INTO webapp.leads (
        profile_url, full_name, first_name, last_name, job_title, 
        additional_info, location, connection_degree, profile_image_url, 
        vmid, search_query, category, shared_connections, company, 
        company_url, industry, company2, company_url2, job_title2, 
        job_date_range, job_date_range2, school, school_degree, 
        school_date_range, school2, school_degree2, school_date_range2,
        user_id, id_crm, process
    ) VALUES (
        p_profile_url, p_full_name, p_first_name, p_last_name, p_job_title,
        p_additional_info, p_location, p_connection_degree, p_profile_image_url,
        p_vmid, p_search_query, p_category, p_shared_connections, p_company,
        p_company_url, p_industry, p_company2, p_company_url2, p_job_title2,
        p_job_date_range, p_job_date_range2, p_school, p_school_degree,
        p_school_date_range, p_school2, p_school_degree2, p_school_date_range2,
        p_user_id, 1, 'initial'
    ) ON CONFLICT (profile_url) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        job_title = EXCLUDED.job_title,
        additional_info = EXCLUDED.additional_info,
        location = EXCLUDED.location,
        company = EXCLUDED.company,
        industry = EXCLUDED.industry,
        updated_at = CURRENT_TIMESTAMP,
        id_crm = EXCLUDED.id_crm,
        process = EXCLUDED.process;
    
    -- Asociar con la búsqueda si se proporciona
    IF p_search_id IS NOT NULL THEN
        INSERT INTO webapp.lead_search_mapping (lead_id, search_id) 
        VALUES (lead_id, p_search_id)
        ON CONFLICT (lead_id, search_id) DO NOTHING;
    END IF;
    
    RETURN lead_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de leads
CREATE OR REPLACE FUNCTION webapp.get_lead_statistics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_leads BIGINT,
    active_leads BIGINT,
    contacted_leads BIGINT,
    qualified_leads BIGINT,
    converted_leads BIGINT,
    unique_companies BIGINT,
    unique_locations BIGINT,
    avg_connection_degree NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_leads,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::BIGINT as active_leads,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END)::BIGINT as contacted_leads,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END)::BIGINT as qualified_leads,
        COUNT(CASE WHEN status = 'converted' THEN 1 END)::BIGINT as converted_leads,
        COUNT(DISTINCT company)::BIGINT as unique_companies,
        COUNT(DISTINCT location)::BIGINT as unique_locations,
        AVG(CASE 
            WHEN connection_degree = '1st' THEN 1 
            WHEN connection_degree = '2nd' THEN 2 
            ELSE 3 
        END) as avg_connection_degree
    FROM webapp.leads 
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_leads_updated_at ON webapp.leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON webapp.leads 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_leads_updated_at();

DROP TRIGGER IF EXISTS update_lead_notes_updated_at ON webapp.lead_notes;
CREATE TRIGGER update_lead_notes_updated_at 
    BEFORE UPDATE ON webapp.lead_notes 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

-- Trigger para actualizar estadísticas automáticamente
CREATE OR REPLACE FUNCTION webapp.update_lead_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO webapp.lead_statistics (date, total_leads, new_leads)
    VALUES (DATE(NEW.created_at), 1, 1)
    ON CONFLICT (date) DO UPDATE SET
        total_leads = webapp.lead_statistics.total_leads + 1,
        new_leads = webapp.lead_statistics.new_leads + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_lead_insert ON webapp.leads;
CREATE TRIGGER after_lead_insert
    AFTER INSERT ON webapp.leads
    FOR EACH ROW EXECUTE FUNCTION webapp.update_lead_statistics();

-- =====================================================
-- INSERCIÓN DE DATOS DE EJEMPLO
-- =====================================================

-- Insertar lead de ejemplo
INSERT INTO webapp.leads (
    profile_url, full_name, first_name, last_name, job_title,
    additional_info, location, connection_degree, profile_image_url,
    vmid, search_query, category, shared_connections, company,
    company_url, industry, company2, company_url2, job_title2,
    job_date_range, job_date_range2, school, school_degree,
    school_date_range, school2, school_degree2, school_date_range2
) VALUES (
    'https://www.linkedin.com/in/marta-del-castillo-0166618/',
    'Marta del Castillo',
    'Marta',
    'del Castillo',
    'Chief Executive Officer',
    'Current: Lider WITH (Women In Tech Spain) - Sustainability & Impact at WITH',
    'Greater Madrid Metropolitan Area',
    '2nd',
    'https://media.licdn.com/dms/image/v2/D4D03AQGK5raqqtMOvg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1706787897612?e=1755734400&v=beta&t=EwVOXK7eHD8-DOzN4YYedSBKJR3RZHEaxrENut60OpE',
    'ACoAAAGFNNIBG6NSY7r0eTDVs50qb0dAND-9o2k',
    'CEO tech startup Madrid',
    'People',
    '1 mutual connection',
    'Social Nest Foundation',
    'https://linkedin.com/company/3508813',
    'Civic & Social Organization',
    'Danone Ecosystem 🌍',
    'https://linkedin.com/company/74009523',
    'Member Board of Directors',
    'May 2022 - Present',
    'Sep 2022 - Present',
    'Stanford University',
    'Executive Program Social Entrepreneurship',
    '2018 - 2018',
    'Harvard Business School',
    'Sustainable Business Strategy',
    'Feb 2022 - Mar 2022'
) ON CONFLICT (profile_url) DO NOTHING;

-- =====================================================
-- PERMISOS Y SEGURIDAD
-- =====================================================

-- Dar permisos al usuario webapp_user para las nuevas tablas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA webapp TO webapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA webapp TO webapp_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA webapp TO webapp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA webapp GRANT ALL ON TABLES TO webapp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA webapp GRANT ALL ON SEQUENCES TO webapp_user;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE webapp.leads IS 'Tabla principal de leads de LinkedIn obtenidos de Phantombuster';
COMMENT ON TABLE webapp.search_history IS 'Historial de búsquedas realizadas en Phantombuster';
COMMENT ON TABLE webapp.lead_search_mapping IS 'Relación entre leads y búsquedas';
COMMENT ON TABLE webapp.lead_notes IS 'Notas y comentarios sobre leads';
COMMENT ON TABLE webapp.lead_statistics IS 'Estadísticas diarias de leads';

COMMENT ON FUNCTION webapp.insert_lead(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID) IS 'Inserta o actualiza un lead con toda su información';
COMMENT ON FUNCTION webapp.get_lead_statistics(INTEGER) IS 'Obtiene estadísticas de leads para un período específico';

-- =====================================================
-- CONSULTAS DE EJEMPLO
-- =====================================================

/*
-- Consultar todos los leads
SELECT * FROM webapp.leads ORDER BY created_at DESC;

-- Consultar leads por empresa
SELECT * FROM webapp.leads WHERE company ILIKE '%tech%' OR company2 ILIKE '%tech%';

-- Consultar leads por ubicación
SELECT * FROM webapp.leads WHERE location ILIKE '%Madrid%';

-- Consultar leads por título de trabajo
SELECT * FROM webapp.leads WHERE job_title ILIKE '%CEO%' OR job_title ILIKE '%Director%';

-- Consultar estadísticas
SELECT * FROM webapp.get_lead_statistics(30);

-- Búsqueda de texto completo
SELECT * FROM webapp.leads 
WHERE to_tsvector('english', full_name || ' ' || COALESCE(job_title, '') || ' ' || COALESCE(company, '')) 
@@ plainto_tsquery('english', 'CEO tech');
*/

-- ============================================================================
-- ESQUEMA DE CONFIGURACIÓN DE WEBHOOKS
-- ============================================================================

-- ============================================================================
-- ESQUEMA DE CONFIGURACIÓN DE WEBHOOKS - AGREGAR AL AUTH-SCHEMA.SQL
-- ============================================================================

-- =====================================================
-- TABLA: webhook_config
-- Descripción: Configuración de webhooks por usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.webhook_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES webapp.users(id) ON DELETE CASCADE,
  webhook_url VARCHAR(500) NOT NULL,
  webhook_type VARCHAR(50) DEFAULT 'search_bot' CHECK (webhook_type IN ('search_bot', 'lead_notification', 'automation', 'general')),
  is_active BOOLEAN DEFAULT true,
  last_test_at TIMESTAMP,
  last_test_status VARCHAR(20) CHECK (last_test_status IN ('success', 'failed', 'timeout', 'error')),
  test_response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, webhook_type)
);

-- =====================================================
-- TABLA: webhook_logs
-- Descripción: Log de eventos de webhooks para auditoría
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID REFERENCES webapp.webhook_config(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA WEBHOOKS
-- =====================================================

-- Índices para webhook_config
CREATE INDEX IF NOT EXISTS idx_webhook_config_user_id ON webapp.webhook_config(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_config_webhook_type ON webapp.webhook_config(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_config_is_active ON webapp.webhook_config(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_config_last_test_at ON webapp.webhook_config(last_test_at);

-- Índices para webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_config_id ON webapp.webhook_logs(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webapp.webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webapp.webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_response_status ON webapp.webhook_logs(response_status);

-- =====================================================
-- FUNCIONES PARA WEBHOOKS
-- =====================================================

-- Función para guardar o actualizar configuración de webhook
CREATE OR REPLACE FUNCTION webapp.save_webhook_config(
    p_user_id UUID,
    p_webhook_url VARCHAR(500),
    p_webhook_type VARCHAR(50) DEFAULT 'search_bot'
)
RETURNS UUID AS $$
DECLARE
    config_id UUID;
BEGIN
    INSERT INTO webapp.webhook_config (user_id, webhook_url, webhook_type)
    VALUES (p_user_id, p_webhook_url, p_webhook_type)
    ON CONFLICT (user_id, webhook_type) DO UPDATE SET
        webhook_url = EXCLUDED.webhook_url,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO config_id;
    
    RETURN config_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener configuración de webhook por usuario
CREATE OR REPLACE FUNCTION webapp.get_webhook_config(p_user_id UUID, p_webhook_type VARCHAR(50) DEFAULT 'search_bot')
RETURNS TABLE (
    id UUID,
    webhook_url VARCHAR(500),
    is_active BOOLEAN,
    last_test_at TIMESTAMP,
    last_test_status VARCHAR(20),
    test_response_time_ms INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wc.id,
        wc.webhook_url,
        wc.is_active,
        wc.last_test_at,
        wc.last_test_status,
        wc.test_response_time_ms,
        wc.created_at,
        wc.updated_at
    FROM webapp.webhook_config wc
    WHERE wc.user_id = p_user_id 
    AND wc.webhook_type = p_webhook_type
    AND wc.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar log de webhook
CREATE OR REPLACE FUNCTION webapp.log_webhook_event(
    p_webhook_config_id UUID,
    p_event_type VARCHAR(50),
    p_payload JSONB DEFAULT NULL,
    p_response_status INTEGER DEFAULT NULL,
    p_response_body TEXT DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO webapp.webhook_logs (
        webhook_config_id, 
        event_type, 
        payload, 
        response_status, 
        response_body, 
        response_time_ms, 
        error_message
    )
    VALUES (
        p_webhook_config_id,
        p_event_type,
        p_payload,
        p_response_status,
        p_response_body,
        p_response_time_ms,
        p_error_message
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estado de prueba de webhook
CREATE OR REPLACE FUNCTION webapp.update_webhook_test_status(
    p_webhook_config_id UUID,
    p_test_status VARCHAR(20),
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE webapp.webhook_config 
    SET 
        last_test_at = CURRENT_TIMESTAMP,
        last_test_status = p_test_status,
        test_response_time_ms = p_response_time_ms,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_webhook_config_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA WEBHOOKS
-- =====================================================

-- Trigger para actualizar updated_at automáticamente en webhook_config
DROP TRIGGER IF EXISTS update_webhook_config_updated_at ON webapp.webhook_config;
CREATE TRIGGER update_webhook_config_updated_at 
    BEFORE UPDATE ON webapp.webhook_config 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

-- =====================================================
-- VISTAS PARA WEBHOOKS
-- =====================================================

-- Vista de configuraciones de webhook activas
CREATE OR REPLACE VIEW webapp.active_webhook_configs AS
SELECT 
    wc.id,
    wc.user_id,
    u.email as user_email,
    u.full_name as user_name,
    wc.webhook_url,
    wc.webhook_type,
    wc.is_active,
    wc.last_test_at,
    wc.last_test_status,
    wc.test_response_time_ms,
    wc.created_at,
    wc.updated_at
FROM webapp.webhook_config wc
JOIN webapp.users u ON wc.user_id = u.id
WHERE wc.is_active = true;

-- Vista de logs de webhook recientes
CREATE OR REPLACE VIEW webapp.recent_webhook_logs AS
SELECT 
    wl.id,
    wl.webhook_config_id,
    wc.webhook_url,
    wc.webhook_type,
    u.email as user_email,
    wl.event_type,
    wl.response_status,
    wl.response_time_ms,
    wl.error_message,
    wl.created_at
FROM webapp.webhook_logs wl
JOIN webapp.webhook_config wc ON wl.webhook_config_id = wc.id
JOIN webapp.users u ON wc.user_id = u.id
WHERE wl.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY wl.created_at DESC;

-- =====================================================
-- COMENTARIOS PARA WEBHOOKS
-- =====================================================

COMMENT ON TABLE webapp.webhook_config IS 'Configuración de webhooks por usuario y tipo';
COMMENT ON TABLE webapp.webhook_logs IS 'Log de eventos de webhooks para auditoría';

COMMENT ON FUNCTION webapp.save_webhook_config(UUID, VARCHAR, VARCHAR) IS 'Guarda o actualiza la configuración de webhook de un usuario';
COMMENT ON FUNCTION webapp.get_webhook_config(UUID, VARCHAR) IS 'Obtiene la configuración de webhook de un usuario';
COMMENT ON FUNCTION webapp.log_webhook_event(UUID, VARCHAR, JSONB, INTEGER, TEXT, INTEGER, TEXT) IS 'Registra un evento de webhook en el log';
COMMENT ON FUNCTION webapp.update_webhook_test_status(UUID, VARCHAR, INTEGER) IS 'Actualiza el estado de la última prueba de webhook';

-- =====================================================
-- CONSULTAS DE EJEMPLO PARA WEBHOOKS
-- =====================================================

/*
-- Obtener configuración de webhook de un usuario
SELECT * FROM webapp.get_webhook_config('user-uuid-here', 'search_bot');

-- Guardar configuración de webhook
SELECT webapp.save_webhook_config('user-uuid-here', 'https://mi-bot.com/webhook', 'search_bot');

-- Ver configuraciones activas
SELECT * FROM webapp.active_webhook_configs;

-- Ver logs recientes
SELECT * FROM webapp.recent_webhook_logs;

-- Registrar evento de prueba
SELECT webapp.log_webhook_event(
    'webhook-config-uuid-here',
    'test_connection',
    '{"test": true}'::jsonb,
    200,
    'OK',
    150,
    NULL
);

-- Actualizar estado de prueba
SELECT webapp.update_webhook_test_status(
    'webhook-config-uuid-here',
    'success',
    150
);
*/


-- =====================================================
-- TABLA: webhook_config
-- Descripción: Configuración de webhooks por usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.webhook_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES webapp.users(id) ON DELETE CASCADE,
  webhook_url VARCHAR(500) NOT NULL,
  webhook_type VARCHAR(50) DEFAULT 'search_bot' CHECK (webhook_type IN ('search_bot', 'lead_notification', 'automation', 'general')),
  is_active BOOLEAN DEFAULT true,
  last_test_at TIMESTAMP,
  last_test_status VARCHAR(20) CHECK (last_test_status IN ('success', 'failed', 'timeout', 'error')),
  test_response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, webhook_type)
);

-- =====================================================
-- TABLA: webhook_logs
-- Descripción: Log de eventos de webhooks para auditoría
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID REFERENCES webapp.webhook_config(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA WEBHOOKS
-- =====================================================

-- Índices para webhook_config
CREATE INDEX IF NOT EXISTS idx_webhook_config_user_id ON webapp.webhook_config(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_config_webhook_type ON webapp.webhook_config(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_config_is_active ON webapp.webhook_config(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_config_last_test_at ON webapp.webhook_config(last_test_at);

-- Índices para webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_config_id ON webapp.webhook_logs(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webapp.webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webapp.webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_response_status ON webapp.webhook_logs(response_status);

-- =====================================================
-- FUNCIONES PARA WEBHOOKS
-- =====================================================

-- Función para guardar o actualizar configuración de webhook
CREATE OR REPLACE FUNCTION webapp.save_webhook_config(
    p_user_id UUID,
    p_webhook_url VARCHAR(500),
    p_webhook_type VARCHAR(50) DEFAULT 'search_bot'
)
RETURNS UUID AS $$
DECLARE
    config_id UUID;
BEGIN
    INSERT INTO webapp.webhook_config (user_id, webhook_url, webhook_type)
    VALUES (p_user_id, p_webhook_url, p_webhook_type)
    ON CONFLICT (user_id, webhook_type) DO UPDATE SET
        webhook_url = EXCLUDED.webhook_url,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO config_id;
    
    RETURN config_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener configuración de webhook por usuario
CREATE OR REPLACE FUNCTION webapp.get_webhook_config(p_user_id UUID, p_webhook_type VARCHAR(50) DEFAULT 'search_bot')
RETURNS TABLE (
    id UUID,
    webhook_url VARCHAR(500),
    is_active BOOLEAN,
    last_test_at TIMESTAMP,
    last_test_status VARCHAR(20),
    test_response_time_ms INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wc.id,
        wc.webhook_url,
        wc.is_active,
        wc.last_test_at,
        wc.last_test_status,
        wc.test_response_time_ms,
        wc.created_at,
        wc.updated_at
    FROM webapp.webhook_config wc
    WHERE wc.user_id = p_user_id 
    AND wc.webhook_type = p_webhook_type
    AND wc.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar log de webhook
CREATE OR REPLACE FUNCTION webapp.log_webhook_event(
    p_webhook_config_id UUID,
    p_event_type VARCHAR(50),
    p_payload JSONB DEFAULT NULL,
    p_response_status INTEGER DEFAULT NULL,
    p_response_body TEXT DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO webapp.webhook_logs (
        webhook_config_id, 
        event_type, 
        payload, 
        response_status, 
        response_body, 
        response_time_ms, 
        error_message
    )
    VALUES (
        p_webhook_config_id,
        p_event_type,
        p_payload,
        p_response_status,
        p_response_body,
        p_response_time_ms,
        p_error_message
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estado de prueba de webhook
CREATE OR REPLACE FUNCTION webapp.update_webhook_test_status(
    p_webhook_config_id UUID,
    p_test_status VARCHAR(20),
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE webapp.webhook_config 
    SET 
        last_test_at = CURRENT_TIMESTAMP,
        last_test_status = p_test_status,
        test_response_time_ms = p_response_time_ms,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_webhook_config_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA WEBHOOKS
-- =====================================================

-- Trigger para actualizar updated_at automáticamente en webhook_config
DROP TRIGGER IF EXISTS update_webhook_config_updated_at ON webapp.webhook_config;
CREATE TRIGGER update_webhook_config_updated_at 
    BEFORE UPDATE ON webapp.webhook_config 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

-- =====================================================
-- VISTAS PARA WEBHOOKS
-- =====================================================

-- Vista de configuraciones de webhook activas
CREATE OR REPLACE VIEW webapp.active_webhook_configs AS
SELECT 
    wc.id,
    wc.user_id,
    u.email as user_email,
    u.full_name as user_name,
    wc.webhook_url,
    wc.webhook_type,
    wc.is_active,
    wc.last_test_at,
    wc.last_test_status,
    wc.test_response_time_ms,
    wc.created_at,
    wc.updated_at
FROM webapp.webhook_config wc
JOIN webapp.users u ON wc.user_id = u.id
WHERE wc.is_active = true;

-- Vista de logs de webhook recientes
CREATE OR REPLACE VIEW webapp.recent_webhook_logs AS
SELECT 
    wl.id,
    wl.webhook_config_id,
    wc.webhook_url,
    wc.webhook_type,
    u.email as user_email,
    wl.event_type,
    wl.response_status,
    wl.response_time_ms,
    wl.error_message,
    wl.created_at
FROM webapp.webhook_logs wl
JOIN webapp.webhook_config wc ON wl.webhook_config_id = wc.id
JOIN webapp.users u ON wc.user_id = u.id
WHERE wl.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY wl.created_at DESC;

-- =====================================================
-- COMENTARIOS PARA WEBHOOKS
-- =====================================================

COMMENT ON TABLE webapp.webhook_config IS 'Configuración de webhooks por usuario y tipo';
COMMENT ON TABLE webapp.webhook_logs IS 'Log de eventos de webhooks para auditoría';

COMMENT ON FUNCTION webapp.save_webhook_config(UUID, VARCHAR, VARCHAR) IS 'Guarda o actualiza la configuración de webhook de un usuario';
COMMENT ON FUNCTION webapp.get_webhook_config(UUID, VARCHAR) IS 'Obtiene la configuración de webhook de un usuario';
COMMENT ON FUNCTION webapp.log_webhook_event(UUID, VARCHAR, JSONB, INTEGER, TEXT, INTEGER, TEXT) IS 'Registra un evento de webhook en el log';
COMMENT ON FUNCTION webapp.update_webhook_test_status(UUID, VARCHAR, INTEGER) IS 'Actualiza el estado de la última prueba de webhook';

-- =====================================================
-- CONSULTAS DE EJEMPLO PARA WEBHOOKS
-- =====================================================

/*
-- Obtener configuración de webhook de un usuario
SELECT * FROM webapp.get_webhook_config('user-uuid-here', 'search_bot');

-- Guardar configuración de webhook
SELECT webapp.save_webhook_config('user-uuid-here', 'https://mi-bot.com/webhook', 'search_bot');

-- Ver configuraciones activas
SELECT * FROM webapp.active_webhook_configs;

-- Ver logs recientes
SELECT * FROM webapp.recent_webhook_logs;

-- Registrar evento de prueba
SELECT webapp.log_webhook_event(
    'webhook-config-uuid-here',
    'test_connection',
    '{"test": true}'::jsonb,
    200,
    'OK',
    150,
    NULL
);

-- Actualizar estado de prueba
SELECT webapp.update_webhook_test_status(
    'webhook-config-uuid-here',
    'success',
    150
);
*/

-- ============================================================================
-- ESQUEMA DE CONFIGURACIÓN DE WEBHOOKS
-- ============================================================================

-- =====================================================
-- TABLA: webhook_config
-- Descripción: Configuración de webhooks por usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.webhook_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES webapp.users(id) ON DELETE CASCADE,
  webhook_url VARCHAR(500) NOT NULL,
  webhook_type VARCHAR(50) DEFAULT 'search_bot' CHECK (webhook_type IN ('search_bot', 'lead_notification', 'automation', 'general')),
  is_active BOOLEAN DEFAULT true,
  last_test_at TIMESTAMP,
  last_test_status VARCHAR(20) CHECK (last_test_status IN ('success', 'failed', 'timeout', 'error')),
  test_response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, webhook_type)
);

-- =====================================================
-- TABLA: webhook_logs
-- Descripción: Log de eventos de webhooks para auditoría
-- =====================================================
CREATE TABLE IF NOT EXISTS webapp.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID REFERENCES webapp.webhook_config(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA WEBHOOKS
-- =====================================================

-- Índices para webhook_config
CREATE INDEX IF NOT EXISTS idx_webhook_config_user_id ON webapp.webhook_config(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_config_webhook_type ON webapp.webhook_config(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_config_is_active ON webapp.webhook_config(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_config_last_test_at ON webapp.webhook_config(last_test_at);

-- Índices para webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_config_id ON webapp.webhook_logs(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webapp.webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webapp.webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_response_status ON webapp.webhook_logs(response_status);

-- =====================================================
-- FUNCIONES PARA WEBHOOKS
-- =====================================================

-- Función para guardar o actualizar configuración de webhook
CREATE OR REPLACE FUNCTION webapp.save_webhook_config(
    p_user_id UUID,
    p_webhook_url VARCHAR(500),
    p_webhook_type VARCHAR(50) DEFAULT 'search_bot'
)
RETURNS UUID AS $$
DECLARE
    config_id UUID;
BEGIN
    INSERT INTO webapp.webhook_config (user_id, webhook_url, webhook_type)
    VALUES (p_user_id, p_webhook_url, p_webhook_type)
    ON CONFLICT (user_id, webhook_type) DO UPDATE SET
        webhook_url = EXCLUDED.webhook_url,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO config_id;
    
    RETURN config_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener configuración de webhook por usuario
CREATE OR REPLACE FUNCTION webapp.get_webhook_config(p_user_id UUID, p_webhook_type VARCHAR(50) DEFAULT 'search_bot')
RETURNS TABLE (
    id UUID,
    webhook_url VARCHAR(500),
    is_active BOOLEAN,
    last_test_at TIMESTAMP,
    last_test_status VARCHAR(20),
    test_response_time_ms INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wc.id,
        wc.webhook_url,
        wc.is_active,
        wc.last_test_at,
        wc.last_test_status,
        wc.test_response_time_ms,
        wc.created_at,
        wc.updated_at
    FROM webapp.webhook_config wc
    WHERE wc.user_id = p_user_id 
    AND wc.webhook_type = p_webhook_type
    AND wc.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar log de webhook
CREATE OR REPLACE FUNCTION webapp.log_webhook_event(
    p_webhook_config_id UUID,
    p_event_type VARCHAR(50),
    p_payload JSONB DEFAULT NULL,
    p_response_status INTEGER DEFAULT NULL,
    p_response_body TEXT DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO webapp.webhook_logs (
        webhook_config_id, 
        event_type, 
        payload, 
        response_status, 
        response_body, 
        response_time_ms, 
        error_message
    )
    VALUES (
        p_webhook_config_id,
        p_event_type,
        p_payload,
        p_response_status,
        p_response_body,
        p_response_time_ms,
        p_error_message
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estado de prueba de webhook
CREATE OR REPLACE FUNCTION webapp.update_webhook_test_status(
    p_webhook_config_id UUID,
    p_test_status VARCHAR(20),
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE webapp.webhook_config 
    SET 
        last_test_at = CURRENT_TIMESTAMP,
        last_test_status = p_test_status,
        test_response_time_ms = p_response_time_ms,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_webhook_config_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA WEBHOOKS
-- =====================================================

-- Trigger para actualizar updated_at automáticamente en webhook_config
DROP TRIGGER IF EXISTS update_webhook_config_updated_at ON webapp.webhook_config;
CREATE TRIGGER update_webhook_config_updated_at 
    BEFORE UPDATE ON webapp.webhook_config 
    FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();

-- =====================================================
-- VISTAS PARA WEBHOOKS
-- =====================================================

-- Vista de configuraciones de webhook activas
CREATE OR REPLACE VIEW webapp.active_webhook_configs AS
SELECT 
    wc.id,
    wc.user_id,
    u.email as user_email,
    u.full_name as user_name,
    wc.webhook_url,
    wc.webhook_type,
    wc.is_active,
    wc.last_test_at,
    wc.last_test_status,
    wc.test_response_time_ms,
    wc.created_at,
    wc.updated_at
FROM webapp.webhook_config wc
JOIN webapp.users u ON wc.user_id = u.id
WHERE wc.is_active = true;

-- Vista de logs de webhook recientes
CREATE OR REPLACE VIEW webapp.recent_webhook_logs AS
SELECT 
    wl.id,
    wl.webhook_config_id,
    wc.webhook_url,
    wc.webhook_type,
    u.email as user_email,
    wl.event_type,
    wl.response_status,
    wl.response_time_ms,
    wl.error_message,
    wl.created_at
FROM webapp.webhook_logs wl
JOIN webapp.webhook_config wc ON wl.webhook_config_id = wc.id
JOIN webapp.users u ON wc.user_id = u.id
WHERE wl.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY wl.created_at DESC;

-- =====================================================
-- COMENTARIOS PARA WEBHOOKS
-- =====================================================

COMMENT ON TABLE webapp.webhook_config IS 'Configuración de webhooks por usuario y tipo';
COMMENT ON TABLE webapp.webhook_logs IS 'Log de eventos de webhooks para auditoría';

COMMENT ON FUNCTION webapp.save_webhook_config(UUID, VARCHAR, VARCHAR) IS 'Guarda o actualiza la configuración de webhook de un usuario';
COMMENT ON FUNCTION webapp.get_webhook_config(UUID, VARCHAR) IS 'Obtiene la configuración de webhook de un usuario';
COMMENT ON FUNCTION webapp.log_webhook_event(UUID, VARCHAR, JSONB, INTEGER, TEXT, INTEGER, TEXT) IS 'Registra un evento de webhook en el log';
COMMENT ON FUNCTION webapp.update_webhook_test_status(UUID, VARCHAR, INTEGER) IS 'Actualiza el estado de la última prueba de webhook';

-- =====================================================
-- CONSULTAS DE EJEMPLO PARA WEBHOOKS
-- =====================================================

/*
-- Obtener configuración de webhook de un usuario
SELECT * FROM webapp.get_webhook_config('user-uuid-here', 'search_bot');

-- Guardar configuración de webhook
SELECT webapp.save_webhook_config('user-uuid-here', 'https://mi-bot.com/webhook', 'search_bot');

-- Ver configuraciones activas
SELECT * FROM webapp.active_webhook_configs;

-- Ver logs recientes
SELECT * FROM webapp.recent_webhook_logs;

-- Registrar evento de prueba
SELECT webapp.log_webhook_event(
    'webhook-config-uuid-here',
    'test_connection',
    '{"test": true}'::jsonb,
    200,
    'OK',
    150,
    NULL
);

-- Actualizar estado de prueba
SELECT webapp.update_webhook_test_status(
    'webhook-config-uuid-here',
    'success',
    150
);
*/

-- =====================================================
-- VERIFICACIÓN FINAL DE LA MIGRACIÓN COMPLETA
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    view_count INTEGER;
    leads_count INTEGER;
    webhook_config_count INTEGER;
    webhook_logs_count INTEGER;
BEGIN
    -- Contar tablas creadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'webapp';
    
    -- Contar funciones creadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'webapp';
    
    -- Contar vistas creadas
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'webapp';
    
    -- Contar leads de ejemplo
    SELECT COUNT(*) INTO leads_count
    FROM webapp.leads;
    
    -- Contar configuraciones de webhook
    SELECT COUNT(*) INTO webhook_config_count
    FROM webapp.webhook_config;
    
    -- Contar logs de webhook
    SELECT COUNT(*) INTO webhook_logs_count
    FROM webapp.webhook_logs;
    
    RAISE NOTICE '=== MIGRACIÓN COMPLETA EUROPBOTS ===';
    RAISE NOTICE 'Tablas creadas: %', table_count;
    RAISE NOTICE 'Funciones creadas: %', function_count;
    RAISE NOTICE 'Vistas creadas: %', view_count;
    RAISE NOTICE 'Leads de ejemplo: %', leads_count;
    RAISE NOTICE 'Configuraciones de webhook: %', webhook_config_count;
    RAISE NOTICE 'Logs de webhook: %', webhook_logs_count;
    RAISE NOTICE '=== ESQUEMA COMPLETO Y LISTO ===';
END
$$;

-- =====================================================
-- FIN DE LA MIGRACIÓN COMPLETA
-- =====================================================