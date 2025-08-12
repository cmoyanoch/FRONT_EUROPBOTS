#!/bin/bash

# =====================================================
# SCRIPT: INSTALACIÓN DE TABLA LINKEDIN_URLS
# =====================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}  INSTALACIÓN DE TABLA LINKEDIN_URLS${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Configuración de base de datos
DB_HOST="${DB_HOST:-n8n_postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-n8n_db}"
DB_USER="${DB_USER:-n8n}"
DB_PASSWORD="${DB_PASSWORD:-n8n}"

# Verificar si PostgreSQL está disponible
echo -e "${YELLOW}🔍 Verificando conexión a PostgreSQL...${NC}"

# Intentar conectar a la base de datos
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    echo -e "${RED}❌ No se puede conectar a PostgreSQL${NC}"
    echo -e "${YELLOW}📝 Verificando si el contenedor está ejecutándose...${NC}"
    
    # Verificar si el contenedor está ejecutándose
    if docker ps | grep -q "$DB_HOST"; then
        echo -e "${GREEN}✅ Contenedor PostgreSQL está ejecutándose${NC}"
    else
        echo -e "${RED}❌ Contenedor PostgreSQL no está ejecutándose${NC}"
        echo -e "${YELLOW}💡 Ejecuta: docker compose up -d n8n_postgres${NC}"
        exit 1
    fi
    
    # Esperar un poco más para que PostgreSQL esté listo
    echo -e "${YELLOW}⏳ Esperando que PostgreSQL esté listo...${NC}"
    sleep 10
    
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        echo -e "${RED}❌ No se puede conectar a PostgreSQL después del tiempo de espera${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Conexión a PostgreSQL establecida${NC}"

# Verificar si el esquema webapp existe
echo -e "${YELLOW}🔍 Verificando esquema webapp...${NC}"

SCHEMA_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'webapp');" 2>/dev/null | xargs)

if [ "$SCHEMA_EXISTS" = "f" ]; then
    echo -e "${YELLOW}📝 Creando esquema webapp...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE SCHEMA IF NOT EXISTS webapp;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Esquema webapp creado${NC}"
    else
        echo -e "${RED}❌ Error creando esquema webapp${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Esquema webapp ya existe${NC}"
fi

# Verificar si la función update_updated_at_column existe
echo -e "${YELLOW}🔍 Verificando función update_updated_at_column...${NC}"

FUNCTION_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_updated_at_column' AND routine_schema = 'webapp');" 2>/dev/null | xargs)

if [ "$FUNCTION_EXISTS" = "f" ]; then
    echo -e "${YELLOW}📝 Creando función update_updated_at_column...${NC}"
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    CREATE OR REPLACE FUNCTION webapp.update_updated_at_column()
    RETURNS TRIGGER AS \$\$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    \$\$ language 'plpgsql';" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Función update_updated_at_column creada${NC}"
    else
        echo -e "${RED}❌ Error creando función update_updated_at_column${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Función update_updated_at_column ya existe${NC}"
fi

# Ejecutar el script SQL de la tabla
echo -e "${YELLOW}📝 Ejecutando script de tabla linkedin_urls...${NC}"

if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "web_app/scripts/linkedin-urls-table.sql" 2>/dev/null; then
    echo -e "${GREEN}✅ Tabla linkedin_urls creada exitosamente${NC}"
else
    echo -e "${RED}❌ Error ejecutando script SQL${NC}"
    echo -e "${YELLOW}📝 Verificando si el archivo existe...${NC}"
    
    if [ -f "web_app/scripts/linkedin-urls-table.sql" ]; then
        echo -e "${GREEN}✅ Archivo SQL existe${NC}"
        echo -e "${YELLOW}📝 Intentando ejecutar manualmente...${NC}"
        
        # Ejecutar manualmente el contenido del archivo
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "web_app/scripts/linkedin-urls-table.sql"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Tabla linkedin_urls creada exitosamente${NC}"
        else
            echo -e "${RED}❌ Error ejecutando script SQL manualmente${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Archivo SQL no encontrado${NC}"
        exit 1
    fi
fi

# Verificar que la tabla se creó correctamente
echo -e "${YELLOW}🔍 Verificando tabla linkedin_urls...${NC}"

TABLE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'webapp' AND table_name = 'linkedin_urls');" 2>/dev/null | xargs)

if [ "$TABLE_EXISTS" = "t" ]; then
    echo -e "${GREEN}✅ Tabla linkedin_urls existe${NC}"
    
    # Contar registros
    RECORD_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM webapp.linkedin_urls;" 2>/dev/null | xargs)
    echo -e "${GREEN}📊 Registros en la tabla: $RECORD_COUNT${NC}"
    
    # Mostrar algunos registros de ejemplo
    echo -e "${YELLOW}📋 Registros de ejemplo:${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT profile_title, priority, is_active FROM webapp.linkedin_urls ORDER BY priority ASC LIMIT 5;" 2>/dev/null
    
else
    echo -e "${RED}❌ Tabla linkedin_urls no existe${NC}"
    exit 1
fi

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}  INSTALACIÓN COMPLETADA${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""
echo -e "${GREEN}✅ Tabla linkedin_urls instalada correctamente${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo -e "   • Ejecuta el script de prueba: ./api-phamthonbuster/test-table-endpoints.sh"
echo -e "   • Verifica que el API esté ejecutándose"
echo -e "   • Configura las variables de entorno necesarias"
echo "" 