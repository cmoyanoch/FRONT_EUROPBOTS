# 🚀 EuropBots WebApp

**Copyright © 2025 RocketMonk.com**
**Desarrollado por Cristian Moyano**
**Versión: 2.0**

Aplicación web moderna para gestión de campañas de LinkedIn automatizadas con Phantombuster.

## 🎯 Resumen

EuropBots WebApp es el frontend del sistema integral de automatización de LinkedIn. Proporciona una interfaz moderna para:
- Gestión de campañas de leads
- Dashboard de métricas en tiempo real
- Administración de usuarios y permisos
- Configuración de plantillas de mensajes
- Monitoreo del sistema

## 🏗️ Arquitectura

### Stack Tecnológico
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS con componentes personalizados
- **Iconos**: Lucide React
- **Estado**: React Context API
- **Autenticación**: JWT con middleware personalizado
- **Base de datos**: PostgreSQL (esquema webapp)

### Estructura del Proyecto
```
web_app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── campaigns/    # Gestión de campañas
│   │   ├── leads/        # Gestión de leads
│   │   ├── admin/        # Panel administración
│   │   └── config/       # Configuración del sistema
│   ├── campaign/          # Página de campañas
│   ├── dashboard/         # Dashboard principal
│   ├── admin/             # Panel de administración
│   ├── alerts/            # Alertas del sistema
│   ├── leads/             # Gestión de leads
│   ├── search/            # Búsquedas de LinkedIn
│   ├── messages/          # Plantillas de mensajes
│   ├── config/            # Configuración
│   └── automation/        # Automatización
├── components/            # Componentes React
│   ├── ui/               # Componentes base reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   ├── theme/            # Temas y providers
│   ├── system-alerts.tsx # Alertas del sistema
│   └── region-display.tsx # Display de regiones
├── contexts/             # Contextos de React
│   ├── NotificationContext.tsx
│   └── PopupContext.tsx
├── hooks/               # Custom hooks
│   ├── useSystemStatus.ts
│   ├── useAxonautStatus.ts
│   ├── useLeadSimulation.ts
│   └── useClickOutside.ts
├── lib/                 # Utilidades y configuraciones
│   ├── auth.ts          # Autenticación JWT
│   ├── database.ts      # Conexión PostgreSQL
│   ├── utils.ts         # Utilidades generales
│   ├── webhook.ts       # Configuración webhooks
│   └── crm/             # Integración CRM
└── public/              # Archivos estáticos
```

## 🎨 **REGLAS DE MARCA - IMPORTANTE**

### **Principio Fundamental:**
**SIEMPRE reutilizar componentes y estilos existentes para mantener la consistencia de la marca del sitio.**

### **Reglas de Desarrollo:**
1. **✅ REUTILIZAR** componentes existentes antes de crear nuevos
2. **✅ USAR** colores de marca: `europbots-primary`, `europbots-secondary`
3. **✅ SEGUIR** patrones establecidos (acordeones, botones, tarjetas)
4. **❌ NO crear** nuevos estilos sin verificar existentes
5. **❌ NO romper** la consistencia visual

### **Componentes UI Principales**
- **Accordion** - Acordeón reutilizable con patrón estándar
- **AnimatedCard** - Tarjeta con animaciones
- **Button** - Botones con variantes de marca
- **Input/Textarea** - Campos de formulario consistentes
- **SystemAlerts** - Alertas de estado del sistema
- **NotificationContext** - Gestión de notificaciones
- **RegionDisplay** - Display de países y regiones
- **ThemeProvider/ThemeToggle** - Gestión de temas

## 🚀 Instalación y Desarrollo

### **Requisitos:**
- Node.js 18+
- Docker y Docker Compose
- PostgreSQL (contenedor n8n_postgres)

### **Para Desarrollo:**
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm run start

# Verificar tipos
npm run type-check

# Linter
npm run lint
```

### **Variables de Entorno:**
```env
# Base de datos
DATABASE_URL=postgresql://n8n_user:password@localhost:5432/n8n_db
DB_HOST=n8n_postgres
DB_PORT=5432
DB_NAME=n8n_db
DB_USER=n8n_user
DB_PASSWORD=your_password

# Autenticación JWT
JWT_SECRET=your-jwt-secret-key

# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://europbot.domain.com
```

## 📋 Funcionalidades Principales

### **1. Dashboard**
- Métricas en tiempo real
- Estadísticas de campañas
- Estado del sistema
- Alertas y notificaciones

### **2. Gestión de Campañas**
- Creación de campañas
- Configuración de búsquedas LinkedIn
- Seguimiento de progreso
- Gestión de estados

### **3. Leads**
- Visualización de leads extraídos
- Filtros y búsquedas
- Notas y seguimiento
- Exportación de datos

### **4. Automatización**
- Configuración de workflows N8N
- Plantillas de mensajes
- Programación de tareas
- Monitoreo de procesos

### **5. Administración**
- Gestión de usuarios
- Permisos por rol
- Configuración del sistema
- Logs de actividad

### **6. Configuración**
- API keys y servicios
- Webhooks
- Parámetros del sistema
- Integración con Phantombuster

## 🔒 Autenticación y Seguridad

### **Sistema JWT**
- Tokens con expiración configurable
- Middleware de autenticación
- Protección de rutas
- Gestión de sesiones

### **Permisos por Rol**
- Admin: Acceso completo
- Manager: Gestión de campañas y leads
- User: Visualización y operaciones básicas

### **Seguridad**
- Validación de entrada con Zod
- Sanitización de datos
- Headers de seguridad
- Rate limiting en APIs

## 🗄️ Base de Datos

### **Esquema webapp**
Tablas principales:
- `users` - Usuarios del sistema
- `campaigns` - Campañas de LinkedIn
- `leads` - Leads extraídos
- `message_templates` - Plantillas de mensajes
- `system_config` - Configuración del sistema
- `webhook_config` - Configuración de webhooks
- `user_activity_log` - Logs de actividad

### **Funciones PostgreSQL**
- `get_campaign_stats()` - Estadísticas de campañas
- `get_lead_statistics(days)` - Métricas de leads
- `log_user_activity()` - Registro de actividad
- `cleanup_expired_sessions()` - Limpieza de sesiones

## 🔄 Integración con API

### **Endpoints Principales**
- `/api/auth/*` - Autenticación y usuarios
- `/api/campaigns/*` - Gestión de campañas
- `/api/leads/*` - Gestión de leads
- `/api/config/*` - Configuración del sistema
- `/api/admin/*` - Funciones administrativas

### **Integración Phantombuster**
La webapp se comunica con la API de Phantombuster a través de:
- Configuración de agentes
- Lanzamiento de campañas
- Monitoreo de estado
- Recuperación de resultados

## 🚨 Troubleshooting

### **Errores Comunes**

1. **Error de conexión a base de datos**
   ```bash
   # Verificar contenedor PostgreSQL
   docker compose ps | grep n8n_postgres
   
   # Revisar logs
   docker compose logs n8n_postgres
   ```

2. **JWT Token inválido**
   - Verificar JWT_SECRET en variables de entorno
   - Revisar expiración de tokens

3. **Problemas de compilación**
   ```bash
   # Limpiar cache de Next.js
   rm -rf .next/
   
   # Reinstalar dependencias
   rm -rf node_modules/
   npm install
   ```

### **Logs y Debug**
```bash
# Ver logs de la webapp
docker compose logs webapp

# Ejecutar en modo debug
npm run dev
```

## 🔧 Scripts Útiles

### **Desarrollo**
```bash
# Modo desarrollo con hot reload
npm run dev

# Verificación de tipos en tiempo real
npm run type-check -- --watch

# Linter con corrección automática
npm run lint -- --fix
```

### **Producción**
```bash
# Build optimizado
npm run build

# Iniciar servidor de producción
npm run start

# Docker build
docker build -t europbots-webapp .
```

## 📊 Monitoreo y Métricas

### **Health Checks**
- `/api/health` - Estado de la aplicación
- Verificación de conexión DB
- Estado de servicios externos

### **Métricas Disponibles**
- Usuarios activos
- Campañas en progreso
- Leads procesados
- Errores del sistema
- Performance de APIs

## 🔄 Workflows de Desarrollo

### **Ciclo de Desarrollo**
1. Desarrollo local con `npm run dev`
2. Verificación de tipos con `npm run type-check`
3. Linting con `npm run lint`
4. Build de prueba con `npm run build`
5. Commit y deploy

### **Patrones de Código**
- Componentes funcionales con hooks
- TypeScript estricto
- Patrones de composición
- Context API para estado global
- Custom hooks para lógica reutilizable

---

**Desarrollado con ❤️ por el equipo EuropBots**

Para más información sobre el sistema completo, consultar la documentación de la API Phantombuster y los workflows N8N.