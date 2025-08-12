-- =====================================================
-- AGREGAR OPCIÓN "CAMPAÑA" AL MENÚ
-- =====================================================

-- Insertar la nueva opción del menú
INSERT INTO webapp.menu_options (name, label, href, icon, badge, order_index) VALUES 
('campaign', 'Campaña', '/campaign', 'Target', NULL, 3)
ON CONFLICT (name) DO NOTHING;

-- Actualizar el orden de las opciones existentes
UPDATE webapp.menu_options SET order_index = 4 WHERE name = 'leads';
UPDATE webapp.menu_options SET order_index = 5 WHERE name = 'messages';
UPDATE webapp.menu_options SET order_index = 6 WHERE name = 'automation';
UPDATE webapp.menu_options SET order_index = 7 WHERE name = 'analytics';
UPDATE webapp.menu_options SET order_index = 8 WHERE name = 'alerts';
UPDATE webapp.menu_options SET order_index = 9 WHERE name = 'config';

-- Insertar permisos para usuarios
INSERT INTO webapp.role_permissions (role, menu_option_id, can_access) 
SELECT 'user', id, true FROM webapp.menu_options WHERE name = 'campaign'
ON CONFLICT (role, menu_option_id) DO NOTHING;

-- Insertar permisos para administradores
INSERT INTO webapp.role_permissions (role, menu_option_id, can_access) 
SELECT 'admin', id, true FROM webapp.menu_options WHERE name = 'campaign'
ON CONFLICT (role, menu_option_id) DO NOTHING;

-- Verificar que se insertó correctamente
SELECT 
    mo.name,
    mo.label,
    mo.href,
    mo.icon,
    mo.order_index,
    rp.role,
    rp.can_access
FROM webapp.menu_options mo
LEFT JOIN webapp.role_permissions rp ON mo.id = rp.menu_option_id
WHERE mo.name = 'campaign'
ORDER BY mo.order_index, rp.role; 




pg_dump -h host -U usuario -d base_datos -t nombre_tabla --data-only --column-inserts > inserts.sql