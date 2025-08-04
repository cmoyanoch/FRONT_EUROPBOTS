#!/bin/bash

# Script para importar backup de la base de datos webapp
# Uso: ./import_webapp_backup.sh [archivo_backup]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}🗄️  IMPORTADOR DE BACKUP WEBBAPP${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Verificar si se proporcionó un archivo de backup
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}[INFO] No se especificó archivo de backup, buscando el más reciente...${NC}"

    # Buscar el backup más reciente
    LATEST_BACKUP=$(ls -t backup_webapp_complete_*.sql 2>/dev/null | head -1)

    if [ -z "$LATEST_BACKUP" ]; then
        echo -e "${RED}[ERROR] No se encontraron archivos de backup en el directorio actual${NC}"
        echo -e "${YELLOW}[INFO] Archivos disponibles:${NC}"
        ls -la backup_webapp_*.sql 2>/dev/null || echo "No hay archivos de backup"
        exit 1
    fi

    BACKUP_FILE="$LATEST_BACKUP"
    echo -e "${GREEN}[INFO] Usando backup más reciente: $BACKUP_FILE${NC}"
else
    BACKUP_FILE="$1"
fi

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}[ERROR] El archivo de backup '$BACKUP_FILE' no existe${NC}"
    exit 1
fi

echo -e "${BLUE}[INFO] Archivo de backup: $BACKUP_FILE${NC}"
echo -e "${BLUE}[INFO] Tamaño del archivo: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"

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

# Crear backup de seguridad antes de importar
echo -e "${YELLOW}[INFO] Creando backup de seguridad antes de importar...${NC}"
SAFETY_BACKUP="safety_backup_$(date +%Y%m%d_%H%M%S).sql"
docker exec server_europbot-n8n_postgres-1 pg_dump -U n8n_user -d n8n_db --schema=webapp > "$SAFETY_BACKUP"
echo -e "${GREEN}[SUCCESS] Backup de seguridad creado: $SAFETY_BACKUP${NC}"

# Preguntar confirmación
echo -e "${YELLOW}[WARNING] ¿Estás seguro de que quieres importar el backup?${NC}"
echo -e "${YELLOW}[WARNING] Esto sobrescribirá los datos existentes en el esquema webapp${NC}"
read -p "Escribe 'SI' para confirmar: " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo -e "${YELLOW}[INFO] Importación cancelada${NC}"
    exit 0
fi

# Eliminar esquema webapp existente (si existe)
echo -e "${YELLOW}[INFO] Eliminando esquema webapp existente...${NC}"
docker exec server_europbot-n8n_postgres-1 psql -U n8n_user -d n8n_db -c "DROP SCHEMA IF EXISTS webapp CASCADE;" || true

# Importar el backup
echo -e "${YELLOW}[INFO] Importando backup...${NC}"
echo -e "${BLUE}[INFO] Esto puede tomar varios minutos...${NC}"

if docker exec -i server_europbot-n8n_postgres-1 psql -U n8n_user -d n8n_db < "$BACKUP_FILE"; then
    echo -e "${GREEN}[SUCCESS] Backup importado exitosamente${NC}"
else
    echo -e "${RED}[ERROR] Error al importar el backup${NC}"
    echo -e "${YELLOW}[INFO] Restaurando backup de seguridad...${NC}"
    docker exec -i server_europbot-n8n_postgres-1 psql -U n8n_user -d n8n_db < "$SAFETY_BACKUP"
    echo -e "${GREEN}[SUCCESS] Backup de seguridad restaurado${NC}"
    exit 1
fi

# Verificar la importación
echo -e "${YELLOW}[INFO] Verificando la importación...${NC}"
TABLE_COUNT=$(docker exec server_europbot-n8n_postgres-1 psql -U n8n_user -d n8n_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'webapp';" | tr -d ' ')
echo -e "${GREEN}[SUCCESS] Se importaron $TABLE_COUNT tablas en el esquema webapp${NC}"

# Mostrar tablas importadas
echo -e "${BLUE}[INFO] Tablas importadas:${NC}"
docker exec server_europbot-n8n_postgres-1 psql -U n8n_user -d n8n_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'webapp' ORDER BY table_name;" || true

echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}🎉 IMPORTACIÓN COMPLETADA EXITOSAMENTE${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "${BLUE}[INFO] Backup de seguridad: $SAFETY_BACKUP${NC}"
echo -e "${BLUE}[INFO] Archivo importado: $BACKUP_FILE${NC}"
