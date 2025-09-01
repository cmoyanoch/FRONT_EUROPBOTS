import { CompanyData, EmployeeData, OpportunityData } from '../interfaces/crm-provider';
import { CRMService, getCRMService } from '../services/crm-service';

// Ejemplo de uso del sistema de CRM
export class CRMUsageExample {
  private crmService: CRMService;

  constructor(providerType: 'axonaut' | 'salesforce' = 'axonaut', apiKey?: string) {
    this.crmService = getCRMService(providerType, apiKey);
  }

  // Ejemplo: Cambiar de Axonaut a Salesforce
  async switchToSalesforce(accessToken: string, instanceUrl: string): Promise<void> {
    console.log('🔄 Cambiando de Axonaut a Salesforce...');

    // Nota: Para Salesforce necesitarías modificar el servicio para aceptar parámetros adicionales
    // this.crmService.switchProvider('salesforce', accessToken);

    console.log('✅ Cambio completado');
  }

  // Ejemplo: Crear una empresa
  async createCompanyExample(): Promise<void> {
    console.log('🏢 Creando empresa...');

    const companyData: CompanyData = {
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de la Tech',
      city: 'Paris',
      country: 'France',
      postal_code: '75001',
      website: 'https://techcorp.com',
      industry: 'Technology'
    };

    try {
      const result = await this.crmService.createCompany(companyData);

      if (result.success && result.data) {
        console.log(`✅ Empresa creada con ID: ${result.data.id}`);
        console.log(`📋 Nombre: ${result.data.name}`);
      } else {
        console.error(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error al crear empresa:', error);
    }
  }

  // Ejemplo: Crear un empleado
  async createEmployeeExample(companyId: string): Promise<void> {
    console.log('👤 Creando empleado...');

    const employeeData: EmployeeData = {
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean.dupont@techcorp.com',
      phone: '+33 6 12 34 56 78',
      position: 'Sales Manager',
      company_id: companyId
    };

    try {
      const result = await this.crmService.createEmployee(employeeData);

      if (result.success && result.data) {
        console.log(`✅ Empleado creado con ID: ${result.data.id}`);
        console.log(`📋 Nombre: ${result.data.first_name} ${result.data.last_name}`);
        console.log(`📧 Email: ${result.data.email}`);
      } else {
        console.error(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error al crear empleado:', error);
    }
  }

  // Ejemplo: Crear una oportunidad
  async createOpportunityExample(companyId: string, employeeId: string): Promise<void> {
    console.log('💼 Creando oportunidad...');

    const opportunityData: OpportunityData = {
      name: 'Implementación CRM Enterprise',
      company_id: companyId,
      employee_id: employeeId,
      amount: 50000,
      currency: 'EUR',
      stage_step: 'Qualification',
      description: 'Implementación completa de CRM para empresa de 500 empleados',
      expected_close_date: '2024-12-31'
    };

    try {
      const result = await this.crmService.createOpportunity(opportunityData);

      if (result.success && result.data) {
        console.log(`✅ Oportunidad creada con ID: ${result.data.id}`);
        console.log(`📋 Nombre: ${result.data.name}`);
        console.log(`💰 Monto: ${opportunityData.amount} ${opportunityData.currency}`);
        console.log(`📊 Etapa: ${result.data.stage_step}`);
      } else {
        console.error(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error al crear oportunidad:', error);
    }
  }

  // Ejemplo: Actualizar etapa de oportunidad
  async updateOpportunityStageExample(opportunityId: string): Promise<void> {
    console.log('🔄 Actualizando etapa de oportunidad...');

    const stages = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won'];

    for (const stage of stages) {
      try {
        const result = await this.crmService.updateOpportunityStage(opportunityId, stage);

        if (result.success && result.data) {
          console.log(`✅ Etapa actualizada a: ${result.data.stage_step}`);
        } else {
          console.error(`❌ Error: ${result.error}`);
        }

        // Esperar un poco entre actualizaciones
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('❌ Error al actualizar etapa:', error);
      }
    }
  }

  // Ejemplo: Verificar conexión
  async testConnectionExample(): Promise<void> {
    console.log('🔍 Verificando conexión...');

    try {
      const result = await this.crmService.testConnection();

      if (result.success) {
        console.log(`✅ ${result.message}`);
        console.log(`📊 Proveedor: ${result.provider}`);
        console.log(`⏰ Timestamp: ${result.timestamp}`);
      } else {
        console.error(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error al verificar conexión:', error);
    }
  }

  // Ejemplo: Flujo completo
  async runCompleteExample(): Promise<void> {
    console.log('🚀 Iniciando ejemplo completo de CRM...');

    // 1. Verificar conexión
    await this.testConnectionExample();

    // 2. Crear empresa
    await this.createCompanyExample();

        // 3. Listar empresas para obtener ID
    console.log('📋 Listando empresas...');
    try {
      const companies = await this.crmService.listCompanies();
      if (companies.success && companies.data && companies.data.length > 0) {
        const firstCompany = companies.data[0];
        if (firstCompany) {
          const companyId = firstCompany.id;
          console.log(`🏢 Usando empresa: ${firstCompany.name} (ID: ${companyId})`);

          // 4. Crear empleado
          await this.createEmployeeExample(companyId);

          // 5. Listar empleados para obtener ID
          console.log('📋 Listando empleados...');
          const employees = await this.crmService.listEmployees();
          if (employees.success && employees.data && employees.data.length > 0) {
            const firstEmployee = employees.data[0];
            if (firstEmployee) {
              const employeeId = firstEmployee.id;
              console.log(`👤 Usando empleado: ${firstEmployee.first_name} ${firstEmployee.last_name} (ID: ${employeeId})`);

              // 6. Crear oportunidad
              await this.createOpportunityExample(companyId, employeeId);

              // 7. Listar oportunidades para obtener ID
              console.log('📋 Listando oportunidades...');
              const opportunities = await this.crmService.listOpportunities();
              if (opportunities.success && opportunities.data && opportunities.data.length > 0) {
                const firstOpportunity = opportunities.data[0];
                if (firstOpportunity) {
                  const opportunityId = firstOpportunity.id;
                  console.log(`💼 Usando oportunidad: ${firstOpportunity.name} (ID: ${opportunityId})`);

                  // 8. Actualizar etapas
                  await this.updateOpportunityStageExample(opportunityId);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error en el flujo completo:', error);
    }

    console.log('✅ Ejemplo completo finalizado');
  }
}

// Función de utilidad para ejecutar el ejemplo
export async function runCRMExample(): Promise<void> {
  const example = new CRMUsageExample('axonaut', process.env.AXONAUT_API_KEY);
  await example.runCompleteExample();
}
