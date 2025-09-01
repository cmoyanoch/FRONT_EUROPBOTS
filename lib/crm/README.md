# Sistema de CRM Modular

Este sistema permite cambiar fácilmente entre diferentes proveedores de CRM sin modificar el código principal de la aplicación.

## 🏗️ Arquitectura

```
lib/crm/
├── interfaces/
│   └── crm-provider.ts          # Interfaz base para todos los proveedores
├── providers/
│   ├── axonaut-provider.ts      # Implementación para Axonaut
│   └── salesforce-provider.ts   # Implementación para Salesforce
├── services/
│   └── crm-service.ts           # Servicio principal que maneja el cambio de proveedores
├── examples/
│   └── crm-usage-example.ts     # Ejemplos de uso
└── README.md                    # Esta documentación
```

## 🚀 Uso Básico

### 1. Inicializar con Axonaut

```typescript
import { getCRMService } from '@/lib/crm/services/crm-service';

// Inicializar con Axonaut
const crmService = getCRMService('axonaut', 'tu-api-key-axonaut');

// Verificar conexión
const connection = await crmService.testConnection();
console.log(connection.message);
```

### 2. Crear una empresa

```typescript
const companyData = {
  name: 'TechCorp Solutions',
  email: 'contact@techcorp.com',
  phone: '+33 1 23 45 67 89',
  address: '123 Rue de la Tech',
  city: 'Paris',
  country: 'France'
};

const result = await crmService.createCompany(companyData);
if (result.success) {
  console.log(`Empresa creada con ID: ${result.data?.id}`);
}
```

### 3. Crear un empleado

```typescript
const employeeData = {
  first_name: 'Jean',
  last_name: 'Dupont',
  email: 'jean.dupont@techcorp.com',
  phone: '+33 6 12 34 56 78',
  position: 'Sales Manager',
  company_id: 'company-id'
};

const result = await crmService.createEmployee(employeeData);
if (result.success) {
  console.log(`Empleado creado con ID: ${result.data?.id}`);
}
```

### 4. Crear una oportunidad

```typescript
const opportunityData = {
  name: 'Implementación CRM Enterprise',
  company_id: 'company-id',
  employee_id: 'employee-id',
  amount: 50000,
  currency: 'EUR',
  stage_step: 'Qualification',
  description: 'Implementación completa de CRM'
};

const result = await crmService.createOpportunity(opportunityData);
if (result.success) {
  console.log(`Oportunidad creada con ID: ${result.data?.id}`);
}
```

### 5. Actualizar etapa de oportunidad

```typescript
const result = await crmService.updateOpportunityStage('opportunity-id', 'Proposal');
if (result.success) {
  console.log(`Etapa actualizada a: ${result.data?.stage_step}`);
}
```

## 🔄 Cambiar de Proveedor

### Cambiar de Axonaut a Salesforce

```typescript
// Cambiar dinámicamente el proveedor
crmService.switchProvider('salesforce', 'tu-access-token-salesforce');

// Verificar el cambio
console.log(`Proveedor actual: ${crmService.getCurrentProviderType()}`);

// El resto del código sigue funcionando igual
const companies = await crmService.listCompanies();
```

## 📋 Endpoints Implementados

### Axonaut
- `POST /api/v2/companies` - Crear empresa
- `GET /api/v2/companies` - Listar empresas
- `GET /api/v2/companies/{id}` - Obtener empresa
- `PUT /api/v2/companies/{id}` - Actualizar empresa
- `POST /api/v2/employees` - Crear empleado
- `GET /api/v2/employees` - Listar empleados
- `GET /api/v2/employees/{id}` - Obtener empleado
- `PUT /api/v2/employees/{id}` - Actualizar empleado
- `POST /api/v2/opportunities` - Crear oportunidad
- `GET /api/v2/opportunities` - Listar oportunidades
- `GET /api/v2/opportunities/{id}` - Obtener oportunidad
- `PUT /api/v2/opportunities/{id}` - Actualizar oportunidad

### Salesforce
- `POST /services/data/v58.0/sobjects/Account` - Crear empresa
- `GET /services/data/v58.0/sobjects/Account` - Listar empresas
- `POST /services/data/v58.0/sobjects/Contact` - Crear empleado
- `GET /services/data/v58.0/sobjects/Contact` - Listar empleados
- `POST /services/data/v58.0/sobjects/Opportunity` - Crear oportunidad
- `GET /services/data/v58.0/sobjects/Opportunity` - Listar oportunidades

## 🔧 Agregar un Nuevo Proveedor

Para agregar un nuevo proveedor de CRM:

1. **Crear la implementación** en `providers/nuevo-provider.ts`:

```typescript
import { CRMProvider, CompanyData, EmployeeData, OpportunityData } from '../interfaces/crm-provider';

export class NuevoProvider implements CRMProvider {
  constructor(apiKey: string) {
    // Configuración específica del proveedor
  }

  async createCompany(companyData: CompanyData) {
    // Implementación específica
  }

  // Implementar todos los métodos de la interfaz...
}
```

2. **Actualizar el servicio** en `services/crm-service.ts`:

```typescript
case 'nuevo':
  if (!apiKey) {
    throw new Error('API Key es requerida para Nuevo');
  }
  return new NuevoProvider(apiKey);
```

3. **Actualizar el tipo** en `services/crm-service.ts`:

```typescript
export type CRMProviderType = 'axonaut' | 'salesforce' | 'hubspot' | 'pipedrive' | 'nuevo';
```

## 🛡️ Manejo de Errores

Todos los métodos devuelven una respuesta estructurada:

```typescript
interface Response {
  success: boolean;
  data?: any;
  error?: string;
}
```

Ejemplo de uso:

```typescript
const result = await crmService.createCompany(companyData);

if (result.success) {
  // Operación exitosa
  console.log(result.data);
} else {
  // Manejar error
  console.error(result.error);
}
```

## 🔍 Verificación de Conexión

```typescript
const connection = await crmService.testConnection();

if (connection.success) {
  console.log(`✅ ${connection.message}`);
  console.log(`📊 Proveedor: ${connection.provider}`);
} else {
  console.error(`❌ ${connection.message}`);
}
```

## 📝 Variables de Entorno

```env
# Axonaut
AXONAUT_API_KEY=tu-api-key-axonaut

# Salesforce
SALESFORCE_ACCESS_TOKEN=tu-access-token
SALESFORCE_INSTANCE_URL=https://tu-instancia.salesforce.com
```

## 🎯 Beneficios de esta Arquitectura

1. **Desacoplamiento**: El código principal no depende de un proveedor específico
2. **Flexibilidad**: Cambio fácil entre proveedores
3. **Mantenibilidad**: Cada proveedor tiene su propia implementación
4. **Extensibilidad**: Fácil agregar nuevos proveedores
5. **Consistencia**: Interfaz unificada para todos los proveedores
6. **Testing**: Fácil crear mocks para testing

## 🚀 Ejemplo Completo

```typescript
import { CRMUsageExample } from '@/lib/crm/examples/crm-usage-example';

// Ejecutar ejemplo completo
const example = new CRMUsageExample('axonaut', process.env.AXONAUT_API_KEY);
await example.runCompleteExample();
```

Este ejemplo crea una empresa, un empleado, una oportunidad y actualiza las etapas automáticamente.
