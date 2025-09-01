import { CRMProvider, ConnectionTestResponse } from '../interfaces/crm-provider';
import { AxonautProvider } from '../providers/axonaut-provider';

export type CRMProviderType = 'axonaut' | 'salesforce' | 'hubspot' | 'pipedrive';

export class CRMService {
  private provider: CRMProvider;
  private currentProviderType: CRMProviderType;

  constructor(providerType: CRMProviderType = 'axonaut', apiKey?: string) {
    this.currentProviderType = providerType;
    this.provider = this.createProvider(providerType, apiKey);
  }

  private createProvider(providerType: CRMProviderType, apiKey?: string): CRMProvider {
    switch (providerType) {
      case 'axonaut':
        if (!apiKey) {
          throw new Error('API Key es requerida para Axonaut');
        }
        return new AxonautProvider(apiKey);

      case 'salesforce':
        // TODO: Implementar SalesforceProvider
        throw new Error('Proveedor Salesforce no implementado aún');

      case 'hubspot':
        // TODO: Implementar HubSpotProvider
        throw new Error('Proveedor HubSpot no implementado aún');

      case 'pipedrive':
        // TODO: Implementar PipedriveProvider
        throw new Error('Proveedor Pipedrive no implementado aún');

      default:
        throw new Error(`Proveedor CRM no soportado: ${providerType}`);
    }
  }

  // Método para cambiar de proveedor dinámicamente
  public switchProvider(providerType: CRMProviderType, apiKey?: string): void {
    this.currentProviderType = providerType;
    this.provider = this.createProvider(providerType, apiKey);
  }

  // Método para obtener el proveedor actual
  public getCurrentProvider(): CRMProvider {
    return this.provider;
  }

  // Método para obtener el tipo de proveedor actual
  public getCurrentProviderType(): CRMProviderType {
    return this.currentProviderType;
  }

  // Método para verificar la conexión del proveedor actual
  public async testConnection(): Promise<ConnectionTestResponse> {
    return await this.provider.testConnection();
  }

  // Métodos delegados al proveedor actual
  public async createCompany(companyData: any) {
    return await this.provider.createCompany(companyData);
  }

  public async getCompany(companyId: string) {
    return await this.provider.getCompany(companyId);
  }

  public async updateCompany(companyId: string, companyData: any) {
    return await this.provider.updateCompany(companyId, companyData);
  }

  public async listCompanies() {
    return await this.provider.listCompanies();
  }

  public async createEmployee(employeeData: any) {
    return await this.provider.createEmployee(employeeData);
  }

  public async getEmployee(employeeId: string) {
    return await this.provider.getEmployee(employeeId);
  }

  public async updateEmployee(employeeId: string, employeeData: any) {
    return await this.provider.updateEmployee(employeeId, employeeData);
  }

  public async listEmployees() {
    return await this.provider.listEmployees();
  }

  public async createOpportunity(opportunityData: any) {
    return await this.provider.createOpportunity(opportunityData);
  }

  public async getOpportunity(opportunityId: string) {
    return await this.provider.getOpportunity(opportunityId);
  }

  public async updateOpportunity(opportunityId: string, opportunityData: any) {
    return await this.provider.updateOpportunity(opportunityId, opportunityData);
  }

  public async updateOpportunityStage(opportunityId: string, stageStep: string) {
    return await this.provider.updateOpportunityStage(opportunityId, stageStep);
  }

  public async listOpportunities() {
    return await this.provider.listOpportunities();
  }
}

// Singleton para el servicio de CRM
let crmServiceInstance: CRMService | null = null;

export function getCRMService(providerType?: CRMProviderType, apiKey?: string): CRMService {
  if (!crmServiceInstance) {
    crmServiceInstance = new CRMService(providerType || 'axonaut', apiKey);
  }
  return crmServiceInstance;
}

export function resetCRMService(): void {
  crmServiceInstance = null;
}
