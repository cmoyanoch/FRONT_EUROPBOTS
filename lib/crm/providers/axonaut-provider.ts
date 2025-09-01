import {
    CRMProvider,
    CompanyData,
    CompanyListResponse,
    CompanyResponse,
    ConnectionTestResponse,
    EmployeeData,
    EmployeeListResponse,
    EmployeeResponse,
    OpportunityData,
    OpportunityListResponse,
    OpportunityResponse
} from '../interfaces/crm-provider';

export class AxonautProvider implements CRMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://axonaut.com/api/v2';
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

      const config: RequestInit = {
        method,
        headers,
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en Axonaut API (${endpoint}):`, error);
      throw error;
    }
  }

  // Métodos para empresas
  async createCompany(companyData: CompanyData): Promise<CompanyResponse> {
    try {
      const response = await this.makeRequest('/companies', 'POST', companyData);
      return {
        success: true,
        data: {
          id: response.id,
          name: response.name,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getCompany(companyId: string): Promise<CompanyResponse> {
    try {
      const response = await this.makeRequest(`/companies/${companyId}`);
      return {
        success: true,
        data: {
          id: response.id,
          name: response.name,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateCompany(companyId: string, companyData: Partial<CompanyData>): Promise<CompanyResponse> {
    try {
      const response = await this.makeRequest(`/companies/${companyId}`, 'PUT', companyData);
      return {
        success: true,
        data: {
          id: response.id,
          name: response.name,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async listCompanies(): Promise<CompanyListResponse> {
    try {
      const response = await this.makeRequest('/companies');
      return {
        success: true,
        data: response.map((company: any) => ({
          id: company.id,
          name: company.name,
          ...company
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Métodos para empleados
  async createEmployee(employeeData: EmployeeData): Promise<EmployeeResponse> {
    try {
      const response = await this.makeRequest('/employees', 'POST', employeeData);
      return {
        success: true,
        data: {
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          email: response.email,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getEmployee(employeeId: string): Promise<EmployeeResponse> {
    try {
      const response = await this.makeRequest(`/employees/${employeeId}`);
      return {
        success: true,
        data: {
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          email: response.email,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateEmployee(employeeId: string, employeeData: Partial<EmployeeData>): Promise<EmployeeResponse> {
    try {
      const response = await this.makeRequest(`/employees/${employeeId}`, 'PUT', employeeData);
      return {
        success: true,
        data: {
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          email: response.email,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async listEmployees(): Promise<EmployeeListResponse> {
    try {
      const response = await this.makeRequest('/employees');
      return {
        success: true,
        data: response.map((employee: any) => ({
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          ...employee
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Métodos para oportunidades
  async createOpportunity(opportunityData: OpportunityData): Promise<OpportunityResponse> {
    try {
      const response = await this.makeRequest('/opportunities', 'POST', opportunityData);
      return {
        success: true,
        data: {
          id: response.id,
          name: response.name,
          stage_step: response.stage_step,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getOpportunity(opportunityId: string): Promise<OpportunityResponse> {
    try {
      const response = await this.makeRequest(`/opportunities/${opportunityId}`);
      return {
        success: true,
        data: {
          id: response.id,
          name: response.name,
          stage_step: response.stage_step,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateOpportunity(opportunityId: string, opportunityData: Partial<OpportunityData>): Promise<OpportunityResponse> {
    try {
      const response = await this.makeRequest(`/opportunities/${opportunityId}`, 'PUT', opportunityData);
      return {
        success: true,
        data: {
          id: response.id,
          name: response.name,
          stage_step: response.stage_step,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateOpportunityStage(opportunityId: string, stageStep: string): Promise<OpportunityResponse> {
    try {
      const response = await this.makeRequest(`/opportunities/${opportunityId}`, 'PUT', { stage_step: stageStep });
      return {
        success: true,
        data: {
          id: response.id,
          name: response.name,
          stage_step: response.stage_step,
          ...response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async listOpportunities(): Promise<OpportunityListResponse> {
    try {
      const response = await this.makeRequest('/opportunities');
      return {
        success: true,
        data: response.map((opportunity: any) => ({
          id: opportunity.id,
          name: opportunity.name,
          stage_step: opportunity.stage_step,
          ...opportunity
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Método para verificar conectividad
  async testConnection(): Promise<ConnectionTestResponse> {
    try {
      await this.makeRequest('/companies');
      return {
        success: true,
        message: 'Conexión exitosa con Axonaut CRM',
        provider: 'Axonaut',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión con Axonaut: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        provider: 'Axonaut',
        timestamp: new Date().toISOString()
      };
    }
  }
}
