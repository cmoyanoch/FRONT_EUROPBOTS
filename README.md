# Web App con Autenticación

Una aplicación web moderna construida con Next.js 14, Supabase para autenticación y base de datos PostgreSQL, contenedorizada con Docker e integrada con tu infraestructura existente.

## 🚀 Características

- **Autenticación completa**: Registro, inicio de sesión y gestión de usuarios
- **Base de datos PostgreSQL**: Almacenamiento seguro de datos
- **UI moderna**: Interfaz construida con Tailwind CSS y Radix UI
- **Contenedorización**: Docker y Docker Compose para despliegue fácil
- **TypeScript**: Tipado estático para mayor seguridad
- **Responsive**: Diseño adaptable a diferentes dispositivos
- **Integración completa**: Funciona junto con N8N, PgAdmin y otros servicios

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Shadcn UI
- **Backend**: Supabase (Auth, Database)
- **Base de datos**: PostgreSQL
- **Contenedores**: Docker, Docker Compose
- **Autenticación**: Supabase Auth
- **Proxy**: Traefik para enrutamiento

## 📋 Prerrequisitos

- Docker y Docker Compose instalados
- Node.js 18+ (para desarrollo local)
- Cuenta en Supabase (para producción)

## 🚀 Instalación y Despliegue

### Opción 1: Integración Completa (Recomendada)

Esta opción integra la Web App con tu infraestructura existente (N8N, PgAdmin, etc.):

```bash
# 1. Configurar la aplicación
cd web-app
npm install

# 2. Configurar variables de entorno
cp env.example ../.env
# Editar ../.env con tus credenciales

# 3. Ejecutar script SQL para crear tablas
psql -h localhost -U n8n -d n8n -f scripts/auth-schema.sql

# 4. Levantar todos los servicios
cd ..
docker-compose up -d
```

### Opción 2: Despliegue Independiente

Si prefieres ejecutar solo la Web App:

```bash
# Configurar variables de entorno
cp env.example .env
# Editar .env con tus credenciales de Supabase

# Desplegar con Docker Compose
docker-compose -f docker-compose.webapp.yml up -d
```

### Opción 3: Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env

# Ejecutar en modo desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp env.example ../.env
```

Variables principales:

```env
# Variables existentes del proyecto
GENERIC_TIMEZONE=America/Mexico_City
POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=n8n
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin

# JWT Secret para autenticación (¡cambiar en producción!)
JWT_SECRET=tu-clave-secreta-muy-segura-para-jwt
```

### Configuración de Base de Datos

1. **Ejecutar script SQL**: Para crear las tablas de autenticación
2. **Configurar variables**: JWT_SECRET y credenciales de PostgreSQL
3. **Verificar conexión**: La aplicación se conectará automáticamente

## 🌐 Servicios Disponibles

Después del despliegue, tendrás acceso a:

- **🌐 N8N**: http://n8n.localhost - Automatización de workflows
- **🗄️ PgAdmin**: http://pgadmin.localhost - Administración de bases de datos
- **🔐 Web App**: http://webapp.localhost - Aplicación principal con autenticación
- **📊 Traefik Dashboard**: http://localhost:8080 - Panel de control del proxy
- **🔌 API Secure**: http://localhost:3443 - API segura

## 🏗️ Estructura del Proyecto

```
web-app/
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Página del dashboard (protegida)
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   ├── globals.css       # Estilos globales
│   └── layout.tsx        # Layout principal
├── components/           # Componentes React
│   ├── auth/            # Componentes de autenticación
│   └── ui/              # Componentes de UI (Shadcn)
├── lib/                 # Utilidades y configuración
│   ├── database.ts      # Configuración de PostgreSQL
│   ├── auth.ts          # Servicio de autenticación
│   └── utils.ts         # Utilidades generales
├── scripts/             # Scripts de configuración
│   └── auth-schema.sql  # Script SQL para crear tablas de autenticación
├── Dockerfile           # Configuración de Docker
├── docker-compose.webapp.yml # Docker Compose independiente
└── package.json         # Dependencias del proyecto
```

## 🔐 Autenticación

La aplicación incluye:

- **Registro de usuarios**: Con validación de email
- **Inicio de sesión**: Con credenciales seguras
- **Protección de rutas**: Dashboard solo para usuarios autenticados
- **Cerrar sesión**: Función de logout segura
- **Gestión de sesiones**: Con JWT tokens y PostgreSQL

### Características de Autenticación

- ✅ **PostgreSQL Directo**: Usa tu base de datos existente
- ✅ **JWT Tokens**: Autenticación segura con tokens
- ✅ **bcrypt**: Contraseñas hasheadas de forma segura
- ✅ **Cookies HttpOnly**: Seguridad mejorada
- ✅ **Middleware**: Protección automática de rutas
- ✅ **Sin dependencias externas**: Todo funciona localmente

## 🗄️ Base de Datos

### Esquema

La aplicación utiliza las siguientes tablas en el esquema `webapp`:

- `webapp.users`: Usuarios autenticados
- `webapp.sessions`: Sesiones y tokens JWT
- `webapp.profiles`: Perfiles de usuario extendidos (opcional)

### Configuración

- **Base de datos compartida**: Usa la misma PostgreSQL de N8N
- **Esquema**: `webapp` (separado de N8N)
- **Puerto**: 5432 (compartido con N8N)
- **Script de inicialización**: `scripts/auth-schema.sql`

## 🐳 Docker

### Comandos útiles

```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f webapp

# Reconstruir después de cambios
docker-compose up --build -d

# Detener todos los servicios
docker-compose down

# Limpiar volúmenes (¡cuidado, borra datos!)
docker-compose down -v
```

### Volúmenes

- `webapp_postgres_data`: Datos de PostgreSQL de la Web App
- `webapp_supabase_data`: Datos de Supabase local (opcional)

## 🔧 Desarrollo

### Modo desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

### Estructura de componentes

Los componentes siguen las mejores prácticas de Shadcn UI:

```typescript
// Ejemplo de uso de componentes
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
```

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con Supabase
- **Validación de entrada**: Sanitización de datos
- **HTTPS**: Configuración para producción
- **Variables de entorno**: Credenciales seguras
- **CORS**: Configuración de seguridad
- **Protección de rutas**: Middleware de autenticación

## 🚀 Despliegue en Producción

### Opciones de despliegue

1. **Vercel**: Despliegue automático desde GitHub
2. **Netlify**: Despliegue con funciones serverless
3. **AWS/GCP**: Contenedores en la nube
4. **Servidor propio**: Con Docker Compose

### Configuración para producción

1. Configura variables de entorno de producción
2. Usa una base de datos PostgreSQL en la nube
3. Configura HTTPS y dominio personalizado
4. Implementa monitoreo y logs

## 🤝 Integración con N8N

La Web App puede integrarse con N8N para:

- **Webhooks**: Recibir notificaciones de workflows
- **API calls**: Llamadas a la API de N8N
- **Base de datos compartida**: Acceso a datos de N8N
- **Autenticación unificada**: Sistema de usuarios compartido

## 🆘 Solución de Problemas

### Problemas comunes

1. **Error de conexión a Supabase**:

   - Verifica las variables de entorno
   - Confirma que el proyecto de Supabase esté activo

2. **Error de puertos**:

   - Verifica que los puertos 3000, 5434 no estén en uso
   - Cambia los puertos en docker-compose.yml si es necesario

3. **Error de construcción de Docker**:
   - Limpia las imágenes: `docker system prune`
   - Reconstruye: `docker-compose up --build`

### Logs y debugging

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs webapp

# Ver logs en tiempo real
docker-compose logs -f
```

## 🔄 Actualizaciones

Para mantener el proyecto actualizado:

```bash
# Actualizar dependencias
npm update

# Reconstruir contenedores
docker-compose up --build -d

# Actualizar imágenes de Docker
docker-compose pull
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de [Next.js](https://nextjs.org/docs)
2. Consulta la documentación de [Supabase](https://supabase.com/docs)
3. Revisa los logs de Docker: `docker-compose logs`
4. Abre un issue en el repositorio
