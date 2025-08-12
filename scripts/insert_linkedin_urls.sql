-- =====================================================
-- INSERCIÓN: URLs de LinkedIn para búsquedas
-- Versión: 1.0.0
-- Fecha: 2025-08-03
-- Descripción: Insertar URLs de búsqueda de LinkedIn para diferentes perfiles
-- =====================================================

-- Iniciar transacción
BEGIN;

-- PASO 1: Limpiar registros existentes (opcional - descomentar si es necesario)
-- DELETE FROM webapp.linkedin_urls WHERE profile_keyword IN ('CEO', 'Founder', 'General Manager', 'Managing Director', 'Sales Director', 'Business Development Director', 'Operations Director', 'Technical Director', 'Facility Manager', 'Purchasing Manager', 'Innovation Director');

-- PASO 2: Insertar URLs de LinkedIn
INSERT INTO webapp.linkedin_urls (
    id,
    profile_title,
    profile_keyword,
    linkedin_url,
    description,
    priority,
    is_active,
    created_at,
    updated_at
) VALUES
-- CEO - Prioridad 1
(
    'd37c03c6-b462-4dc9-92f9-16dd0a9c1965',
    'CEO',
    'CEO',
    'https://www.linkedin.com/search/results/people/?keywords=CEO&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Chief Executive Officer - Europa completa',
    1,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Founder - Prioridad 1
(
    'c261c088-c308-495d-981c-851e41dc79f0',
    'Founder',
    'Founder',
    'https://www.linkedin.com/search/results/people/?keywords=Founder&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Fundador - Europa completa',
    1,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- General Manager - Prioridad 1
(
    'fa917ed6-64b4-4b53-9a1b-23e74cbc1768',
    'General Manager',
    'General Manager',
    'https://www.linkedin.com/search/results/people/?keywords=%22General%20Manager%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Gerente General - Europa completa',
    1,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Managing Director - Prioridad 1
(
    'da4d55f3-d283-4d07-8894-fda87bee8937',
    'Managing Director',
    'Managing Director',
    'https://www.linkedin.com/search/results/people/?keywords=%22Managing%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Director Gerente - Europa completa',
    1,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Sales Director - Prioridad 2
(
    '32506f93-d5fc-409b-b9b6-225d9e95f32b',
    'Sales Director',
    'Sales Director',
    'https://www.linkedin.com/search/results/people/?keywords=%22Sales%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Director de Ventas - Europa completa',
    2,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Business Development Director - Prioridad 2
(
    'e9084512-740c-4746-8307-8381b907ca29',
    'Business Development Director',
    'Business Development Director',
    'https://www.linkedin.com/search/results/people/?keywords=%22Business%20Development%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Director de Desarrollo de Negocio - Europa completa',
    2,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Operations Director - Prioridad 2
(
    '43848dd6-6320-47d2-a01c-81657568667e',
    'Operations Director',
    'Operations Director',
    'https://www.linkedin.com/search/results/people/?keywords=%22Operations%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Director de Operaciones - Europa completa',
    2,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Technical Director - Prioridad 2
(
    '484a3e77-9516-49d4-963f-dd98aa2eb6c5',
    'Technical Director',
    'Technical Director',
    'https://www.linkedin.com/search/results/people/?keywords=%22Technical%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Director Técnico - Europa completa',
    2,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Facility Manager - Prioridad 3
(
    '8f36e194-11c2-4eba-886f-5aa3db14ac19',
    'Facility Manager',
    'Facility Manager',
    'https://www.linkedin.com/search/results/people/?keywords=%22Facility%20Manager%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Gerente de Instalaciones - Europa completa',
    3,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Purchasing Manager - Prioridad 3
(
    '3add1a0d-e7fb-4b57-8d19-62485d3c1bb2',
    'Purchasing Manager',
    'Purchasing Manager',
    'https://www.linkedin.com/search/results/people/?keywords=%22Purchasing%20Manager%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%22110%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Gerente de Compras - Europa completa',
    3,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
),

-- Innovation Director - Prioridad 3
(
    '2cb3febd-a190-4438-a381-402dcac494e9',
    'Innovation Director',
    'Innovation Director',
    'https://www.linkedin.com/search/results/people/?keywords=%22Innovation%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%2C%22103350119%22%2C%22101282230%22%2C%22102257491%22%2C%22100364837%22%2C%22100565514%22%2C%22105646813%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%2C%22107%22%2C%22108%22%2C%22109%22%2C%2210%22%2C%22111%22%2C%22112%22%2C%22113%22%2C%22114%22%2C%22115%22%2C%22116%22%2C%22117%22%2C%22118%22%2C%22119%22%2C%22120%22%2C%22121%22%2C%22122%22%2C%22123%22%2C%22124%22%2C%22125%22%2C%22126%22%2C%22127%22%2C%22128%22%2C%22129%22%2C%22130%22%2C%22131%22%2C%22132%22%2C%22133%22%2C%22134%22%2C%22135%22%2C%22136%22%2C%22137%22%2C%22138%22%2C%22139%22%2C%22140%22%2C%22141%22%2C%22142%22%2C%22143%22%2C%22144%22%2C%22145%22%2C%22146%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%2C%22H%22%5D',
    'Director de Innovación - Europa completa',
    3,
    true,
    '2025-08-01T05:55:15.800Z'::timestamp,
    '2025-08-01T05:55:15.800Z'::timestamp
);

-- PASO 3: Verificar inserción
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO INSERCIÓN ===';
END $$;

-- Contar registros insertados
SELECT
    COUNT(*) as total_registros,
    COUNT(CASE WHEN priority = 1 THEN 1 END) as prioridad_1,
    COUNT(CASE WHEN priority = 2 THEN 1 END) as prioridad_2,
    COUNT(CASE WHEN priority = 3 THEN 1 END) as prioridad_3
FROM webapp.linkedin_urls
WHERE profile_keyword IN ('CEO', 'Founder', 'General Manager', 'Managing Director', 'Sales Director', 'Business Development Director', 'Operations Director', 'Technical Director', 'Facility Manager', 'Purchasing Manager', 'Innovation Director');

-- Mostrar registros insertados
SELECT
    profile_title,
    profile_keyword,
    priority,
    is_active,
    created_at
FROM webapp.linkedin_urls
WHERE profile_keyword IN ('CEO', 'Founder', 'General Manager', 'Managing Director', 'Sales Director', 'Business Development Director', 'Operations Director', 'Technical Director', 'Facility Manager', 'Purchasing Manager', 'Innovation Director')
ORDER BY priority, profile_title;

-- Confirmar transacción
COMMIT;

-- =====================================================
-- RESUMEN DE INSERCIÓN
-- =====================================================
/*
REGISTROS INSERTADOS: 11 URLs de LinkedIn

PRIORIDAD 1 (Alta):
- CEO
- Founder
- General Manager
- Managing Director

PRIORIDAD 2 (Media):
- Sales Director
- Business Development Director
- Operations Director
- Technical Director

PRIORIDAD 3 (Baja):
- Facility Manager
- Purchasing Manager
- Innovation Director

CARACTERÍSTICAS:
- Todas las URLs incluyen filtros para Europa completa
- Incluyen filtros de industria y tamaño de empresa
- Todas están marcadas como activas (is_active = true)
- Fechas de creación: 2025-08-01T05:55:15.800Z

BENEFICIOS:
- Sistema de distribución automática de perfiles
- Priorización por importancia del cargo
- Cobertura completa de Europa
- URLs optimizadas para Phantombuster
*/
