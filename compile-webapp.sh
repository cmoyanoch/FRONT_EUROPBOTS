#!/bin/bash

# =====================================================
# SCRIPT DE COMPILACIÓN - WEBAPP EUROPBOTS
# =====================================================
# Este script compila y reinicia la WebApp de EUROPBOTS
# Incluye: compilación, reinicio y verificación
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

# Función para limpiar imágenes sin etiqueta al inicio
cleanup_docker_before() {
    print_status "🧹 Limpiando imágenes sin etiqueta al inicio..."

    # Verificar si estamos en un entorno Docker
    if [ -f "../docker-compose.yml" ]; then
        cd ..

        # Eliminar solo imágenes sin etiqueta (dangling images)
        local dangling_images=$(docker images -f "dangling=true" -q 2>/dev/null || echo "")
        if [ ! -z "$dangling_images" ] && [ "$dangling_images" != "" ]; then
            print_status "Eliminando imágenes sin etiqueta..."
            echo "$dangling_images" | xargs -r docker rmi 2>/dev/null || print_warning "⚠️ Algunas imágenes no se pudieron eliminar"
            print_success "✅ Imágenes sin etiqueta eliminadas"
        else
            print_status "No hay imágenes sin etiqueta para eliminar"
        fi

        cd web_app
    else
        print_warning "⚠️ No se encontró docker-compose.yml. Omitiendo limpieza de Docker."
    fi
}

# Función para verificar requisitos
check_requirements() {
    print_status "Verificando requisitos del sistema..."

    # Verificar que estemos en el directorio correcto
    if [ ! -f "package.json" ]; then
        print_error "No se encontró package.json. Asegúrate de estar en el directorio web_app."
        exit 1
    fi

    # Verificar Node.js
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js no está instalado. Por favor instala Node.js."
        exit 1
    fi

    # Verificar npm
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm no está instalado. Por favor instala npm."
        exit 1
    fi

    print_success "Todos los requisitos están cumplidos"
}

# Función para instalar dependencias
install_dependencies() {
    print_status "📦 Instalando dependencias..."

    if npm install; then
        print_success "✅ Dependencias instaladas exitosamente"
    else
        print_error "❌ Error al instalar dependencias"
        exit 1
    fi
}

# Función para compilar la aplicación
build_app() {
    print_status "🔨 Compilando aplicación Next.js..."

    if npm run build; then
        print_success "✅ Aplicación compilada exitosamente"
    else
        print_error "❌ Error en la compilación"
        exit 1
    fi
}

# Función para recompilar la imagen Docker
rebuild_docker() {
    print_status "🐳 Reconstruyendo imagen Docker de webapp..."

    # Verificar si estamos en un entorno Docker
    if [ -f "../docker-compose.yml" ]; then
        cd ..
        # Recompilar sin caché para asegurar que los cambios se reflejen
        if docker compose build webapp --no-cache; then
            print_success "✅ Imagen Docker reconstruida exitosamente"
        else
            print_error "❌ Error al reconstruir la imagen Docker"
            exit 1
        fi
        cd web_app
    else
        print_warning "⚠️ No se encontró docker-compose.yml. Omitiendo recompilación Docker."
    fi
}

# Función para reiniciar el servicio
restart_service() {
    print_status "🔄 Reiniciando servicio webapp con nueva imagen..."

    # Verificar si estamos en un entorno Docker
    if [ -f "../docker-compose.yml" ]; then
        cd ..
        # Primero detener el contenedor
        print_status "⏹️ Deteniendo contenedor existente..."
        docker compose down webapp 2>/dev/null || true
        
        # Luego iniciarlo con la nueva imagen
        print_status "🚀 Iniciando con nueva imagen..."
        if docker compose up webapp -d; then
            print_success "✅ Servicio reiniciado exitosamente con nueva imagen"
        else
            print_error "❌ Error al reiniciar el servicio"
            exit 1
        fi
        cd web_app
    else
        print_warning "⚠️ No se encontró docker-compose.yml. Reinicia manualmente el servicio."
    fi
}

# Función para verificar el servicio
check_service() {
    print_status "🔍 Verificando estado del servicio..."

    # Esperar a que el servicio se inicie
    print_status "⏳ Esperando 10 segundos para que el servicio se inicie completamente..."
    sleep 10

    # Verificar si estamos en un entorno Docker
    if [ -f "../docker-compose.yml" ]; then
        cd ..
        echo ""
        print_status "📊 Estado del contenedor:"
        docker compose ps webapp
        cd web_app
    fi

    # Verificar health check
    echo ""
    print_status "🏥 Verificando health check..."

    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "✅ WebApp está respondiendo correctamente"

        # Mostrar información de la respuesta
        echo ""
        print_status "📄 Información de la respuesta:"
        curl -s -I http://localhost:3000 | head -5
    else
        print_warning "⚠️ WebApp no responde aún (puede estar iniciando)"
    fi
}

# Función para mostrar información final
show_final_info() {
    echo ""
    echo "====================================================="
    print_success "🎉 COMPILACIÓN WEBAPP EUROPBOTS COMPLETADA"
    echo "====================================================="
    echo ""
    echo "📱 Servicios disponibles:"
    echo "   • WebApp Next.js: http://localhost:3000"
    echo "   • API Phantombuster: http://localhost:3001"
    echo "   • n8n Workflows: http://localhost:5678"
    echo "   • PgAdmin: http://localhost:8080"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   • Ver logs: docker compose logs webapp -f"
    echo "   • Reiniciar: docker compose up webapp -d (con nueva imagen)"
    echo "   • Estado: docker compose ps webapp"
    echo "   • Health check: curl http://localhost:3000"
    echo ""
    echo "🌐 Caractéristiques:"
    echo "   • Interface en français"
    echo "   • Design futuriste"
    echo "   • Responsive design"
    echo "   • Animations fluides"
    echo ""
    echo "📊 Pages principales:"
    echo "   • Dashboard: /"
    echo "   • Leads: /leads"
    echo "   • Configuration: /config"
    echo "   • Analytics: /analytics"
    echo "   • Recherche: /search"
    echo ""
    echo "🔒 Authentification:"
    echo "   • Login: /login"
    echo "   • Register: /register"
    echo "   • Mot de passe oublié: /forgot-password"
    echo ""
    echo "====================================================="
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  build       - Compilar y reiniciar (default, incluye --no-cache)"
    echo "  deps        - Solo instalar dependencias"
    echo "  restart     - Solo reiniciar servicio (incluye recompilación Docker)"
    echo "  check       - Solo verificar estado"
    echo "  help        - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0         - Compilación completa"
    echo "  $0 deps    - Solo instalar dependencias"
    echo "  $0 restart - Solo reiniciar"
    echo "  $0 check   - Solo verificar"
}

# Función principal
main() {
    case "${1:-build}" in
        "build")
            echo "====================================================="
            echo "🚀 COMPILACIÓN WEBAPP EUROPBOTS"
            echo "====================================================="
            echo ""

            check_requirements
            cleanup_docker_before
            install_dependencies
            build_app
            rebuild_docker
            restart_service
            check_service
            show_final_info

            print_success "¡Compilación completada exitosamente!"
            ;;
        "deps")
            echo "====================================================="
            echo "📦 INSTALACIÓN DE DEPENDENCIAS"
            echo "====================================================="
            echo ""

            check_requirements
            install_dependencies
            print_success "¡Dependencias instaladas exitosamente!"
            ;;
        "restart")
            echo "====================================================="
            echo "🔄 REINICIO WEBAPP EUROPBOTS"
            echo "====================================================="
            echo ""

            check_requirements
            rebuild_docker
            restart_service
            check_service
            show_final_info

            print_success "¡Reinicio completado exitosamente!"
            ;;
        "check")
            echo "====================================================="
            echo "🔍 VERIFICACIÓN WEBAPP EUROPBOTS"
            echo "====================================================="
            echo ""

            check_requirements
            check_service
            show_final_info

            print_success "¡Verificación completada!"
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
