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

export class SalesforceProvider implements CRMProvider {
  private accessToken: string;
  private instanceUrl: string;

  constructor(accessToken: string, instanceUrl: string) {
    this.accessToken = accessToken;
    this.instanceUrl = instanceUrl;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
    try {
      const url = `${this.instanceUrl}/services/data/v58.0${endpoint}`;
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.accessToken}`,
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
      console.error(`Error en Salesforce API (${endpoint}):`, error);
      throw error;
    }
  }

  // Métodos para empresas (Accounts en Salesforce)
  async createCompany(companyData: CompanyData): Promise<CompanyResponse> {
    try {
      const salesforceData = {
        Name: companyData.name,
        Phone: companyData.phone,
        Website: companyData.website,
        BillingStreet: companyData.address,
        BillingCity: companyData.city,
        BillingCountry: companyData.country,
        BillingPostalCode: companyData.postal_code,
        Industry: companyData.industry
      };

      const response = await this.makeRequest('/sobjects/Account', 'POST', salesforceData);
      return {
        success: true,
        data: {
          id: response.id,
          name: companyData.name,
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
      const response = await this.makeRequest(`/sobjects/Account/${companyId}`);
      return {
        success: true,
        data: {
          id: response.Id,
          name: response.Name,
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
      const salesforceData: any = {};
      if (companyData.name) salesforceData.Name = companyData.name;
      if (companyData.phone) salesforceData.Phone = companyData.phone;
      if (companyData.website) salesforceData.Website = companyData.website;
      if (companyData.address) salesforceData.BillingStreet = companyData.address;
      if (companyData.city) salesforceData.BillingCity = companyData.city;
      if (companyData.country) salesforceData.BillingCountry = companyData.country;
      if (companyData.postal_code) salesforceData.BillingPostalCode = companyData.postal_code;
      if (companyData.industry) salesforceData.Industry = companyData.industry;

      const response = await this.makeRequest(`/sobjects/Account/${companyId}`, 'PUT', salesforceData);
      return {
        success: true,
        data: {
          id: companyId,
          name: companyData.name || '',
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
      const query = 'SELECT Id, Name, Phone, Website, Industry FROM Account LIMIT 100';
      const response = await this.makeRequest(`/query?q=${encodeURIComponent(query)}`);
      return {
        success: true,
        data: response.records.map((record: any) => ({
          id: record.Id,
          name: record.Name,
          ...record
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Métodos para empleados (Contacts en Salesforce)
  async createEmployee(employeeData: EmployeeData): Promise<EmployeeResponse> {
    try {
      const salesforceData = {
        FirstName: employeeData.first_name,
        LastName: employeeData.last_name,
        Email: employeeData.email,
        Phone: employeeData.phone,
        Title: employeeData.position,
        AccountId: employeeData.company_id
      };

      const response = await this.makeRequest('/sobjects/Contact', 'POST', salesforceData);
      return {
        success: true,
        data: {
          id: response.id,
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          email: employeeData.email,
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
      const response = await this.makeRequest(`/sobjects/Contact/${employeeId}`);
      return {
        success: true,
        data: {
          id: response.Id,
          first_name: response.FirstName,
          last_name: response.LastName,
          email: response.Email,
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
      const salesforceData: any = {};
      if (employeeData.first_name) salesforceData.FirstName = employeeData.first_name;
      if (employeeData.last_name) salesforceData.LastName = employeeData.last_name;
      if (employeeData.email) salesforceData.Email = employeeData.email;
      if (employeeData.phone) salesforceData.Phone = employeeData.phone;
      if (employeeData.position) salesforceData.Title = employeeData.position;
      if (employeeData.company_id) salesforceData.AccountId = employeeData.company_id;

      const response = await this.makeRequest(`/sobjects/Contact/${employeeId}`, 'PUT', salesforceData);
      return {
        success: true,
        data: {
          id: employeeId,
          first_name: employeeData.first_name || '',
          last_name: employeeData.last_name || '',
          email: employeeData.email || '',
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
      const query = 'SELECT Id, FirstName, LastName, Email, Phone, Title FROM Contact LIMIT 100';
      const response = await this.makeRequest(`/query?q=${encodeURIComponent(query)}`);
      return {
        success: true,
        data: response.records.map((record: any) => ({
          id: record.Id,
          first_name: record.FirstName,
          last_name: record.LastName,
          email: record.Email,
          ...record
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Métodos para oportunidades (Opportunities en Salesforce)
  async createOpportunity(opportunityData: OpportunityData): Promise<OpportunityResponse> {
    try {
      const salesforceData = {
        Name: opportunityData.name,
        AccountId: opportunityData.company_id,
        Amount: opportunityData.amount,
        StageName: opportunityData.stage_step || 'Prospecting',
        Description: opportunityData.description,
        CloseDate: opportunityData.expected_close_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const response = await this.makeRequest('/sobjects/Opportunity', 'POST', salesforceData);
      return {
        success: true,
        data: {
          id: response.id,
          name: opportunityData.name,
          stage_step: opportunityData.stage_step || 'Prospecting',
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
      const response = await this.makeRequest(`/sobjects/Opportunity/${opportunityId}`);
      return {
        success: true,
        data: {
          id: response.Id,
          name: response.Name,
          stage_step: response.StageName,
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
      const salesforceData: any = {};
      if (opportunityData.name) salesforceData.Name = opportunityData.name;
      if (opportunityData.company_id) salesforceData.AccountId = opportunityData.company_id;
      if (opportunityData.amount) salesforceData.Amount = opportunityData.amount;
      if (opportunityData.stage_step) salesforceData.StageName = opportunityData.stage_step;
      if (opportunityData.description) salesforceData.Description = opportunityData.description;
      if (opportunityData.expected_close_date) salesforceData.CloseDate = opportunityData.expected_close_date;

      const response = await this.makeRequest(`/sobjects/Opportunity/${opportunityId}`, 'PUT', salesforceData);
      return {
        success: true,
        data: {
          id: opportunityId,
          name: opportunityData.name || '',
          stage_step: opportunityData.stage_step || '',
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
      const response = await this.makeRequest(`/sobjects/Opportunity/${opportunityId}`, 'PUT', { StageName: stageStep });
      return {
        success: true,
        data: {
          id: opportunityId,
          name: '',
          stage_step: stageStep,
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
      const query = 'SELECT Id, Name, StageName, Amount, CloseDate FROM Opportunity LIMIT 100';
      const response = await this.makeRequest(`/query?q=${encodeURIComponent(query)}`);
      return {
        success: true,
        data: response.records.map((record: any) => ({
          id: record.Id,
          name: record.Name,
          stage_step: record.StageName,
          ...record
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
      await this.makeRequest('/sobjects/Account/describe');
      return {
        success: true,
        message: 'Conexión exitosa con Salesforce CRM',
        provider: 'Salesforce',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión con Salesforce: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        provider: 'Salesforce',
        timestamp: new Date().toISOString()
      };
    }
  }
}
