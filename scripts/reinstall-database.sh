#!/bin/bash

# =====================================================
# SCRIPT DE REINSTALACIÓN DE BASE DE DATOS - EUROPBOTS
# =====================================================
# Este script reinstala el esquema de la base de datos
# Incluye: limpieza, reinstalación y verificación
# =====================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar requisitos
check_requirements() {
    print_status "Verificando requisitos del sistema..."
    
    # Cambiar al directorio raíz del proyecto
    cd ../..
    
    # Verificar que estemos en el directorio correcto
    if [ ! -f "docker-compose.yml" ]; then
        print_error "No se encontró docker-compose.yml. Asegúrate de estar en la raíz del proyecto."
        exit 1
    fi
    
    # Verificar que exista el archivo auth-schema.sql
    if [ ! -f "web_app/scripts/auth-schema.sql" ]; then
        print_error "No se encontró auth-schema.sql. Verifica la ruta: web_app/scripts/auth-schema.sql"
        exit 1
    fi
    
    # Verificar Docker
    if ! command_exists docker; then
        print_error "Docker no está instalado. Por favor instala Docker."
        exit 1
    fi
    
    # Verificar docker compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose no está disponible."
        exit 1
    fi
    
    print_success "Todos los requisitos están cumplidos"
}

# Función para detener servicios
stop_services() {
    print_status "Deteniendo servicios..."
    
    if docker compose down; then
        print_success "Servicios detenidos exitosamente"
    else
        print_warning "Error al detener servicios (puede ser normal si no estaban corriendo)"
    fi
}

# Función para limpiar volúmenes de base de datos
cleanup_database() {
    print_status "Limpiando volúmenes de base de datos..."
    
    # Detener servicios primero
    stop_services
    
    # Eliminar volumen de postgres
    if docker volume ls | grep -q "server_europbot_postgres_data"; then
        print_status "Eliminando volumen de PostgreSQL..."
        docker volume rm server_europbot_postgres_data
        print_success "Volumen de PostgreSQL eliminado"
    else
        print_warning "No se encontró volumen de PostgreSQL para eliminar"
    fi
    
    # Eliminar volumen de n8n si existe
    if docker volume ls | grep -q "server_europbot_n8n_data"; then
        print_status "Eliminando volumen de n8n..."
        docker volume rm server_europbot_n8n_data
        print_success "Volumen de n8n eliminado"
    fi
}

# Función para reinstalar esquema
reinstall_schema() {
    print_status "Reinstalando esquema de base de datos..."
    
    # Levantar solo PostgreSQL
    print_status "Levantando PostgreSQL..."
    if docker compose up -d n8n_postgres; then
        print_success "PostgreSQL levantado exitosamente"
    else
        print_error "Error al levantar PostgreSQL"
        exit 1
    fi
    
    # Esperar a que PostgreSQL esté listo
    print_status "Esperando a que PostgreSQL esté listo..."
    sleep 15
    
    # Verificar que PostgreSQL esté funcionando
    if docker compose exec -T n8n_postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "PostgreSQL está funcionando"
    else
        print_error "PostgreSQL no está respondiendo"
        exit 1
    fi
    
    # Ejecutar el script de esquema
    print_status "Ejecutando script auth-schema.sql..."
    if docker compose exec -T n8n_postgres psql -U postgres -d europbots -f /docker-entrypoint-initdb.d/01-auth-schema.sql; then
        print_success "Esquema instalado exitosamente"
    else
        print_error "Error al ejecutar el script de esquema"
        exit 1
    fi
}

# Función para verificar la instalación
verify_installation() {
    print_status "Verificando la instalación..."
    
    # Verificar tablas creadas
    print_status "Verificando tablas creadas..."
    docker compose exec -T n8n_postgres psql -U postgres -d europbots -c "
    SELECT 
        schemaname,
        tablename,
        tableowner
    FROM pg_tables 
    WHERE schemaname = 'webapp' 
    ORDER BY tablename;
    "
    
    # Verificar funciones creadas
    print_status "Verificando funciones creadas..."
    docker compose exec -T n8n_postgres psql -U postgres -d europbots -c "
    SELECT 
        routine_name,
        routine_type
    FROM information_schema.routines 
    WHERE routine_schema = 'webapp' 
    ORDER BY routine_name;
    "
    
    # Verificar datos iniciales
    print_status "Verificando datos iniciales..."
    docker compose exec -T n8n_postgres psql -U postgres -d europbots -c "
    SELECT 'users' as table_name, COUNT(*) as count FROM webapp.users
    UNION ALL
    SELECT 'menu_options' as table_name, COUNT(*) as count FROM webapp.menu_options
    UNION ALL
    SELECT 'role_permissions' as table_name, COUNT(*) as count FROM webapp.role_permissions
    UNION ALL
    SELECT 'search_industries' as table_name, COUNT(*) as count FROM webapp.search_industries
    UNION ALL
    SELECT 'search_job_titles' as table_name, COUNT(*) as count FROM webapp.search_job_titles
    UNION ALL
    SELECT 'search_locations' as table_name, COUNT(*) as count FROM webapp.search_locations
    UNION ALL
    SELECT 'search_company_sizes' as table_name, COUNT(*) as count FROM webapp.search_company_sizes;
    "
}

# Función para levantar todos los servicios
start_all_services() {
    print_status "Levantando todos los servicios..."
    
    if docker compose up -d; then
        print_success "Todos los servicios levantados exitosamente"
    else
        print_error "Error al levantar servicios"
        exit 1
    fi
    
    # Esperar un momento para que los servicios se inicien
    sleep 15
    
    # Mostrar estado de los contenedores
    echo ""
    print_status "Estado de los contenedores:"
    docker compose ps
}

# Función para mostrar información final
show_final_info() {
    echo ""
    echo "====================================================="
    print_success "🎉 REINSTALACIÓN DE BASE DE DATOS COMPLETADA"
    echo "====================================================="
    echo ""
    echo "📊 Base de datos:"
    echo "   • PostgreSQL: localhost:5432"
    echo "   • Base de datos: europbots"
    echo "   • Usuario: postgres"
    echo ""
    echo "👤 Usuario administrador:"
    echo "   • Email: admin@europbots.com"
    echo "   • Password: admin123"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   • Conectar a DB: docker compose exec n8n_postgres psql -U postgres -d europbots"
    echo "   • Ver logs: docker compose logs n8n_postgres -f"
    echo "   • Backup: docker compose exec n8n_postgres pg_dump -U postgres europbots > backup.sql"
    echo ""
    echo "📱 Servicios disponibles:"
    echo "   • Webapp: http://localhost:3000"
    echo "   • n8n: http://localhost:5678"
    echo "   • phantombuster-api: http://localhost:3001"
    echo ""
    echo "====================================================="
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  reinstall  - Reinstalar esquema completo (default)"
    echo "  clean      - Limpiar volúmenes y reinstalar"
    echo "  verify     - Solo verificar instalación actual"
    echo "  schema     - Solo reinstalar esquema (sin limpiar)"
    echo "  help       - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0         - Reinstalación normal"
    echo "  $0 clean   - Limpieza completa y reinstalación"
    echo "  $0 verify  - Verificar instalación actual"
}

# Función principal
main() {
    case "${1:-reinstall}" in
        "reinstall")
            echo "====================================================="
            echo "🔄 REINSTALACIÓN DE BASE DE DATOS EUROPBOTS"
            echo "====================================================="
            echo ""
            
            check_requirements
            stop_services
            reinstall_schema
            verify_installation
            start_all_services
            show_final_info
            
            print_success "¡Reinstalación completada exitosamente!"
            ;;
        "clean")
            echo "====================================================="
            echo "🧹 LIMPIEZA COMPLETA Y REINSTALACIÓN"
            echo "====================================================="
            echo ""
            
            check_requirements
            cleanup_database
            reinstall_schema
            verify_installation
            start_all_services
            show_final_info
            
            print_success "¡Limpieza completa y reinstalación completadas!"
            ;;
        "verify")
            echo "====================================================="
            echo "🔍 VERIFICACIÓN DE INSTALACIÓN"
            echo "====================================================="
            echo ""
            
            check_requirements
            verify_installation
            
            print_success "¡Verificación completada!"
            ;;
        "schema")
            echo "====================================================="
            echo "📋 REINSTALACIÓN DE ESQUEMA"
            echo "====================================================="
            echo ""
            
            check_requirements
            reinstall_schema
            verify_installation
            show_final_info
            
            print_success "¡Reinstalación de esquema completada!"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Opción desconocida: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@" 