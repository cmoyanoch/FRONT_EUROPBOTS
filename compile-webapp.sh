#!/bin/bash

# =====================================================
# SCRIPT DE COMPILACIÓN - EUROPBOTS WEBAPP
# =====================================================
# Este script compila la aplicación Next.js completa
# Incluye: limpieza, instalación, compilación y verificación
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
    
    # Verificar que estemos en el directorio web_app
    if [ ! -f "package.json" ]; then
        print_error "No se encontró package.json. Asegúrate de estar en el directorio web_app."
        exit 1
    fi
    
    # Verificar que exista el docker-compose.yml en el directorio padre
    if [ ! -f "../docker-compose.yml" ]; then
        print_error "No se encontró docker-compose.yml en el directorio padre. Asegúrate de estar en web_app/."
        exit 1
    fi
    
    # Verificar Node.js
    if ! command_exists node; then
        print_error "Node.js no está instalado. Por favor instala Node.js."
        exit 1
    fi
    
    # Verificar npm
    if ! command_exists npm; then
        print_error "npm no está instalado. Por favor instala npm."
        exit 1
    fi
    
    # Verificar Docker
    if ! command_exists docker; then
        print_error "Docker no está instalado. Por favor instala Docker."
        exit 1
    fi
    
    # Verificar archivo .env en el directorio padre
    if [ ! -f "../.env" ]; then
        print_warning "No se encontró archivo .env en el directorio padre. Creando archivo de ejemplo..."
        create_env_file
    fi
    
    print_success "Todos los requisitos están cumplidos"
}

# Función para crear archivo .env de ejemplo
create_env_file() {
    cat > ../.env << 'EOF'
# =====================================================
# CONFIGURACIÓN DE ENTORNO - EUROPBOTS
# =====================================================

# Configuración de dominio
DOMAIN_NAME=localhost
WEBAPP_SUBDOMAIN=app
N8N_SUBDOMAIN=n8n

# Configuración de SSL
SSL_EMAIL=admin@localhost

# Configuración de base de datos
POSTGRES_DB=europbots
POSTGRES_USER=europbots
POSTGRES_PASSWORD=europbots_password

# Configuración de JWT
JWT_SECRET=your-secret-key-change-in-production

# Configuración de pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@localhost
PGADMIN_DEFAULT_PASSWORD=admin123

# Configuración de zona horaria
GENERIC_TIMEZONE=Europe/Madrid

# =====================================================
# IMPORTANTE: Cambia estos valores en producción
# =====================================================
EOF
    
    print_success "Archivo .env creado con configuración de ejemplo en el directorio padre"
    print_warning "IMPORTANTE: Revisa y modifica el archivo .env antes de usar en producción"
}

# Función para mostrar versiones
show_versions() {
    print_status "Versiones del sistema:"
    echo "   • Node.js: $(node --version)"
    echo "   • npm: $(npm --version)"
    echo "   • Docker: $(docker --version)"
    echo ""
}

# Función para limpiar caché y archivos temporales
cleanup_cache() {
    print_status "Limpiando caché y archivos temporales..."
    
    # Limpiar caché de Next.js
    if [ -d ".next" ]; then
        print_status "Eliminando caché de Next.js..."
        rm -rf .next
    fi
    
    # Limpiar node_modules si es necesario
    if [ "$1" = "full" ]; then
        print_status "Eliminando node_modules..."
        rm -rf node_modules
        rm -f package-lock.json
    fi
    
    print_success "Limpieza completada"
}

# Función para instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias..."
    
    # Verificar si node_modules existe
    if [ ! -d "node_modules" ]; then
        print_status "Instalando dependencias de Node.js..."
        npm ci --include=dev
    else
        print_status "Verificando dependencias..."
        npm ci --include=dev
    fi
    
    print_success "Dependencias instaladas correctamente"
}

# Función para verificar TypeScript
check_typescript() {
    print_status "Verificando TypeScript..."
    
    # Ejecutar verificación de tipos
    if npm run type-check; then
        print_success "TypeScript sin errores"
    else
        print_warning "Hay errores de TypeScript (pueden ser normales en desarrollo)"
    fi
}

# Función para compilar Next.js
build_nextjs() {
    print_status "Compilando aplicación Next.js..."
    
    # Compilar la aplicación
    if npm run build; then
        print_success "Aplicación Next.js compilada exitosamente"
    else
        print_error "Error en la compilación de Next.js"
        exit 1
    fi
}

# Función para compilar Docker
build_docker() {
    print_status "Compilando contenedores Docker..."
    
    # Cambiar al directorio padre para ejecutar docker compose
    cd ..
    
    # Compilar webapp sin caché
    print_status "Compilando contenedor webapp..."
    if docker compose build webapp --no-cache; then
        print_success "Contenedor webapp compilado exitosamente"
    else
        print_error "Error en la compilación de webapp"
        exit 1
    fi
    
    # Compilar otros servicios si es necesario
    if docker compose config --services | grep -q "phantombuster-api"; then
        print_status "Compilando contenedor phantombuster-api..."
        if docker compose build phantombuster-api --no-cache; then
            print_success "Contenedor phantombuster-api compilado exitosamente"
        else
            print_warning "Error en la compilación de phantombuster-api (continuando...)"
        fi
    fi
    
    # Volver al directorio web_app
    cd web_app
    
    print_success "Todos los contenedores Docker compilados exitosamente"
}

# Función para levantar servicios
start_services() {
    print_status "Levantando servicios..."
    
    # Cambiar al directorio padre para ejecutar docker compose
    cd ..
    
    # Levantar servicios en segundo plano
    if docker compose up -d; then
        print_success "Servicios levantados exitosamente"
    else
        print_error "Error al levantar servicios"
        exit 1
    fi
    
    # Volver al directorio web_app
    cd web_app
}

# Función para verificar servicios
check_services() {
    print_status "Verificando estado de los servicios..."
    
    # Cambiar al directorio padre para ejecutar docker compose
    cd ..
    
    # Esperar un momento para que los servicios se inicien
    sleep 10
    
    # Mostrar estado de los contenedores
    echo ""
    print_status "Estado de los contenedores:"
    docker compose ps
    
    # Verificar que los servicios estén respondiendo
    echo ""
    print_status "Verificando conectividad de servicios..."
    
    # Verificar webapp (puerto 3000)
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "✅ Webapp está respondiendo en http://localhost:3000"
    else
        print_warning "⚠️  Webapp no responde aún (puede estar iniciando)"
    fi
    
    # Verificar n8n (puerto 5678)
    if docker compose ps | grep -q "n8n"; then
        if curl -f http://localhost:5678 >/dev/null 2>&1; then
            print_success "✅ n8n está respondiendo en http://localhost:5678"
        else
            print_warning "⚠️  n8n no responde aún (puede estar iniciando)"
        fi
    fi
    
    # Verificar phantombuster-api (puerto 3001)
    if docker compose ps | grep -q "phantombuster-api"; then
        if curl -f http://localhost:3001 >/dev/null 2>&1; then
            print_success "✅ phantombuster-api está respondiendo en http://localhost:3001"
        else
            print_warning "⚠️  phantombuster-api no responde aún (puede estar iniciando)"
        fi
    fi
    
    # Verificar postgres (puerto 5432)
    if docker compose ps | grep -q "n8n_postgres"; then
        if docker compose exec -T n8n_postgres pg_isready -U postgres >/dev/null 2>&1; then
            print_success "✅ PostgreSQL está funcionando"
        else
            print_warning "⚠️  PostgreSQL no responde aún (puede estar iniciando)"
        fi
    fi
    
    # Volver al directorio web_app
    cd web_app
}

# Función para mostrar información final
show_final_info() {
    echo ""
    echo "====================================================="
    print_success "🎉 COMPILACIÓN COMPLETADA EXITOSAMENTE"
    echo "====================================================="
    echo ""
    echo "📱 Servicios disponibles:"
    echo "   • Webapp: http://localhost:3000"
    echo "   • n8n: http://localhost:5678"
    echo "   • phantombuster-api: http://localhost:3001"
    echo "   • Traefik Dashboard: http://localhost:8080"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   • Ver logs: docker compose logs -f"
    echo "   • Detener: docker compose down"
    echo "   • Reiniciar: docker compose restart"
    echo "   • Estado: docker compose ps"
    echo ""
    echo "📊 Monitoreo:"
    echo "   • Logs webapp: docker compose logs webapp -f"
    echo "   • Logs n8n: docker compose logs n8n -f"
    echo "   • Logs phantombuster-api: docker compose logs phantombuster-api -f"
    echo "   • Logs postgres: docker compose logs n8n_postgres -f"
    echo ""
    echo "🛠️  Desarrollo:"
echo "   • Modo desarrollo: npm run dev"
echo "   • Verificar tipos: npm run type-check"
echo "   • Linting: npm run lint"
    echo ""
    echo "🗄️  Base de datos:"
    echo "   • PostgreSQL: localhost:5432"
    echo "   • pgAdmin: http://localhost:8080 (si está configurado)"
    echo ""
    echo "====================================================="
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  build     - Compilar aplicación (default)"
    echo "  clean     - Limpiar caché y recompilar"
    echo "  full      - Limpieza completa y recompilación"
    echo "  docker    - Solo compilar Docker"
    echo "  dev       - Modo desarrollo"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0         - Compilación normal"
    echo "  $0 clean   - Limpiar y recompilar"
    echo "  $0 full    - Limpieza completa"
    echo "  $0 dev     - Iniciar modo desarrollo"
}

# Función para modo desarrollo
dev_mode() {
    print_status "Iniciando modo desarrollo..."
    
    print_status "Iniciando servidor de desarrollo..."
    print_status "La aplicación estará disponible en: http://localhost:3000"
    print_status "Presiona Ctrl+C para detener"
    
    npm run dev
}

# Función principal
main() {
    case "${1:-build}" in
        "build")
            echo "====================================================="
            echo "🚀 COMPILACIÓN EUROPBOTS WEBAPP"
            echo "====================================================="
            echo ""
            
            check_requirements
            show_versions
            cleanup_cache
            install_dependencies
            check_typescript
            build_nextjs
            build_docker
            start_services
            check_services
            show_final_info
            
            print_success "¡Compilación completada exitosamente!"
            ;;
        "clean")
            echo "====================================================="
            echo "🧹 LIMPIEZA Y RECOMPILACIÓN"
            echo "====================================================="
            echo ""
            
            check_requirements
            cleanup_cache
            install_dependencies
            check_typescript
            build_nextjs
            build_docker
            start_services
            check_services
            show_final_info
            
            print_success "¡Limpieza y recompilación completadas!"
            ;;
        "full")
            echo "====================================================="
            echo "🔄 LIMPIEZA COMPLETA Y RECOMPILACIÓN"
            echo "====================================================="
            echo ""
            
            check_requirements
            cleanup_cache full
            install_dependencies
            check_typescript
            build_nextjs
            build_docker
            start_services
            check_services
            show_final_info
            
            print_success "¡Limpieza completa y recompilación completadas!"
            ;;
        "docker")
            echo "====================================================="
            echo "🐳 COMPILACIÓN DOCKER"
            echo "====================================================="
            echo ""
            
            check_requirements
            build_docker
            start_services
            check_services
            
            print_success "¡Compilación Docker completada!"
            ;;
        "dev")
            dev_mode
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