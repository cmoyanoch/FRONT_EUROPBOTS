#!/bin/bash

# Script para exportar backup de la base de datos webapp
# Uso: ./export_webapp_backup.sh [tipo_backup]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}🗄️  EXPORTADOR DE BACKUP WEBBAPP${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Verificar que el contenedor de PostgreSQL esté ejecutándose
echo -e "${YELLOW}[INFO] Verificando estado del contenedor PostgreSQL...${NC}"
if ! docker ps | grep -q "server_europbot-n8n_postgres-1"; then
    echo -e "${RED}[ERROR] El contenedor PostgreSQL no está ejecutándose${NC}"
    echo -e "${YELLOW}[INFO] Iniciando servicios...${NC}"
    docker compose up -d n8n_postgres
    sleep 5
fi

# Verificar conectividad a la base de datos
echo -e "${YELLOW}[INFO] Verificando conectividad a la base de datos...${NC}"
if ! docker exec server_europbot-n8n_postgres-1 pg_isready -U n8n_user -d n8n_db; then
    echo -e "${RED}[ERROR] No se puede conectar a la base de datos${NC}"
    exit 1
fi

echo -e "${GREEN}[SUCCESS] Conectividad a la base de datos verificada${NC}"

# Determinar tipo de backup
BACKUP_TYPE="${1:-complete}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

case $BACKUP_TYPE in
    "schema")
        echo -e "${YELLOW}[INFO] Exportando solo esquema (estructura)...${NC}"
        BACKUP_FILE="backup_webapp_schema_${TIMESTAMP}.sql"
        docker exec server_europbot-n8n_postgres-1 pg_dump -U n8n_user -d n8n_db --schema=webapp --schema-only > "$BACKUP_FILE"
        ;;
    "data")
        echo -e "${YELLOW}[INFO] Exportando solo datos...${NC}"
        BACKUP_FILE="backup_webapp_data_${TIMESTAMP}.sql"
        docker exec server_europbot-n8n_postgres-1 pg_dump -U n8n_user -d n8n_db --schema=webapp --data-only > "$BACKUP_FILE"
        ;;
    "complete"|*)
        echo -e "${YELLOW}[INFO] Exportando backup completo (esquema + datos)...${NC}"
        BACKUP_FILE="backup_webapp_complete_${TIMESTAMP}.sql"
        docker exec server_europbot-n8n_postgres-1 pg_dump -U n8n_user -d n8n_db --schema=webapp > "$BACKUP_FILE"
        ;;
esac

# Verificar que el backup se creó correctamente
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    echo -e "${GREEN}[SUCCESS] Backup creado exitosamente${NC}"
    echo -e "${BLUE}[INFO] Archivo: $BACKUP_FILE${NC}"
    echo -e "${BLUE}[INFO] Tamaño: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"
    echo -e "${BLUE}[INFO] Líneas: $(wc -l < "$BACKUP_FILE")${NC}"
else
    echo -e "${RED}[ERROR] Error al crear el backup${NC}"
    exit 1
fi

# Mostrar información del esquema webapp
echo -e "${YELLOW}[INFO] Información del esquema webapp:${NC}"
TABLE_COUNT=$(docker exec server_europbot-n8n_postgres-1 psql -U n8n_user -d n8n_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'webapp';" | tr -d ' ')
echo -e "${BLUE}[INFO] Tablas en esquema webapp: $TABLE_COUNT${NC}"

# Mostrar tablas
echo -e "${BLUE}[INFO] Tablas exportadas:${NC}"
docker exec server_europbot-n8n_postgres-1 psql -U n8n_user -d n8n_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'webapp' ORDER BY table_name;" || true

# Mostrar estadísticas de datos
echo -e "${BLUE}[INFO] Estadísticas de datos:${NC}"
docker exec server_europbot-n8n_postgres-1 psql -U n8n_user -d n8n_db -c "
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'webapp'
ORDER BY tablename, attname;
" || true

echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}🎉 EXPORTACIÓN COMPLETADA EXITOSAMENTE${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "${BLUE}[INFO] Archivo de backup: $BACKUP_FILE${NC}"
echo -e "${BLUE}[INFO] Para importar: ./scripts/import_webapp_backup.sh $BACKUP_FILE${NC}"
