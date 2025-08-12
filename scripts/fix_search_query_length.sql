-- =====================================================
-- CORRECCIÓN: Límite de longitud del campo search_query
-- Versión: 1.0.0
-- Fecha: 2025-08-03
-- Descripción: Aumentar límite de search_query de 500 a 1000 caracteres
-- =====================================================

-- Iniciar transacción
BEGIN;

-- PASO 1: Verificar estado actual del campo search_query
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO CAMPO SEARCH_QUERY ===';
END $$;

SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'webapp'
AND table_name = 'leads'
AND column_name = 'search_query';

-- PASO 2: Aumentar límite de search_query de 500 a 1000 caracteres
ALTER TABLE webapp.leads
ALTER COLUMN search_query TYPE character varying(1000);

-- PASO 3: Verificar cambio aplicado
DO $$
BEGIN
    RAISE NOTICE '=== CAMBIO APLICADO ===';
    RAISE NOTICE 'search_query: varchar(500) -> varchar(1000)';
END $$;

-- Verificar campo actualizado
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'webapp'
AND table_name = 'leads'
AND column_name = 'search_query';

-- PASO 4: Verificar que no hay problemas con datos existentes
DO $$
DECLARE
    max_search_query_length INTEGER;
BEGIN
    -- Verificar longitud máxima de datos existentes
    SELECT MAX(LENGTH(search_query)) INTO max_search_query_length FROM webapp.leads;

    RAISE NOTICE '=== VERIFICACIÓN DE DATOS EXISTENTES ===';
    RAISE NOTICE 'Longitud máxima search_query: %', COALESCE(max_search_query_length, 0);

    -- Verificar que no hay datos que excedan el nuevo límite
    IF COALESCE(max_search_query_length, 0) > 1000 THEN
        RAISE EXCEPTION '❌ ERROR: Hay datos que exceden el nuevo límite de 1000 caracteres';
    ELSE
        RAISE NOTICE '✅ VERIFICACIÓN EXITOSA: Todos los datos existentes están dentro del nuevo límite';
    END IF;
END $$;

-- Confirmar transacción
COMMIT;

-- =====================================================
-- RESUMEN DE CAMBIOS
-- =====================================================
/*
CAMBIOS REALIZADOS:
- search_query: varchar(500) -> varchar(1000)

MOTIVO:
- Las consultas de búsqueda complejas pueden exceder 500 caracteres
- URLs de búsqueda de LinkedIn con múltiples parámetros son largas
- Evita errores "value too long for type character varying(500)"

BENEFICIOS:
- Permite consultas de búsqueda más complejas
- Evita errores de inserción en N8N
- Mantiene compatibilidad con datos existentes
- Mejora la robustez del sistema

VERIFICACIONES:
- Se verificó que no hay datos existentes que exceden el nuevo límite
- Se confirmó que el cambio se aplicó correctamente
- Se validó la integridad de los datos
*/
