-- =====================================================
-- EJEMPLO DE USO DE LAS FUNCIONES DE MAPEO DE FILTROS
-- =====================================================

-- Ejemplo 1: Mapear una industria por nombre
SELECT * FROM webapp.map_industry_by_name('Commercial Real Estate');

-- Ejemplo 2: Mapear un job title por nombre
SELECT * FROM webapp.map_job_title_by_name('Procurement Manager');

-- Ejemplo 3: Mapear una ubicación por nombre
SELECT * FROM webapp.map_location_by_name('Italia');

-- Ejemplo 4: Mapear un tamaño de empresa por nombre
SELECT * FROM webapp.map_company_size_by_name('51-200 empleados');

-- Ejemplo 5: Obtener todos los filtros activos organizados por tipo
SELECT * FROM webapp.get_active_search_filters();

-- Ejemplo 6: Obtener solo industrias activas
SELECT 
    code,
    name,
    linkedin_code,
    description
FROM webapp.search_industries 
WHERE is_active = true 
ORDER BY order_index;

-- Ejemplo 7: Obtener solo job titles activos
SELECT 
    code,
    name,
    keywords,
    description
FROM webapp.search_job_titles 
WHERE is_active = true 
ORDER BY order_index;

-- Ejemplo 8: Obtener solo ubicaciones activas
SELECT 
    code,
    name,
    linkedin_code,
    description
FROM webapp.search_locations 
WHERE is_active = true 
ORDER BY order_index;

-- Ejemplo 9: Obtener solo tamaños de empresa activos
SELECT 
    code,
    name,
    linkedin_code,
    description
FROM webapp.search_company_sizes 
WHERE is_active = true 
ORDER BY order_index;

-- Ejemplo 10: Búsqueda por código
SELECT * FROM webapp.search_industries WHERE code = 'HORECA';
SELECT * FROM webapp.search_job_titles WHERE code = 'C_LEVEL';
SELECT * FROM webapp.search_locations WHERE code = 'ITALY';
SELECT * FROM webapp.search_company_sizes WHERE code = 'MEDIUM_51_200';

-- Ejemplo 11: Búsqueda por código LinkedIn
SELECT * FROM webapp.search_industries WHERE linkedin_code = '47';
SELECT * FROM webapp.search_locations WHERE linkedin_code = '103350119';
SELECT * FROM webapp.search_company_sizes WHERE linkedin_code = 'B';

-- Ejemplo 12: Actualizar un filtro (ejemplo para administradores)
-- UPDATE webapp.search_industries 
-- SET linkedin_code = '48', updated_at = CURRENT_TIMESTAMP 
-- WHERE code = 'COMMERCIAL_REAL_ESTATE';

-- Ejemplo 13: Desactivar un filtro
-- UPDATE webapp.search_job_titles 
-- SET is_active = false, updated_at = CURRENT_TIMESTAMP 
-- WHERE code = 'INNOVATION_MANAGER';

-- Ejemplo 14: Agregar un nuevo filtro
-- INSERT INTO webapp.search_industries (code, name, linkedin_code, description, order_index) 
-- VALUES ('NEW_INDUSTRY', 'Nueva Industria', '50', 'Descripción de la nueva industria', 8);

-- Ejemplo 15: Obtener estadísticas de filtros
SELECT 
    'Industries' as filter_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM webapp.search_industries
UNION ALL
SELECT 
    'Job Titles' as filter_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM webapp.search_job_titles
UNION ALL
SELECT 
    'Locations' as filter_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM webapp.search_locations
UNION ALL
SELECT 
    'Company Sizes' as filter_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM webapp.search_company_sizes; 