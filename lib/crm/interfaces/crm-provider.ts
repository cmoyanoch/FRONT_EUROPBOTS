// Interfaz base para todos los proveedores de CRM
export interface CRMProvider {
  // Métodos para empresas
  createCompany(companyData: CompanyData): Promise<CompanyResponse>;
  getCompany(companyId: string): Promise<CompanyResponse>;
  updateCompany(companyId: string, companyData: Partial<CompanyData>): Promise<CompanyResponse>;
  listCompanies(): Promise<CompanyListResponse>;

  // Métodos para empleados
  createEmployee(employeeData: EmployeeData): Promise<EmployeeResponse>;
  getEmployee(employeeId: string): Promise<EmployeeResponse>;
  updateEmployee(employeeId: string, employeeData: Partial<EmployeeData>): Promise<EmployeeResponse>;
  listEmployees(): Promise<EmployeeListResponse>;

  // Métodos para oportunidades
  createOpportunity(opportunityData: OpportunityData): Promise<OpportunityResponse>;
  getOpportunity(opportunityId: string): Promise<OpportunityResponse>;
  updateOpportunity(opportunityId: string, opportunityData: Partial<OpportunityData>): Promise<OpportunityResponse>;
  updateOpportunityStage(opportunityId: string, stageStep: string): Promise<OpportunityResponse>;
  listOpportunities(): Promise<OpportunityListResponse>;

  // Método para verificar conectividad
  testConnection(): Promise<ConnectionTestResponse>;
}

// Interfaces de datos
export interface CompanyData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  industry?: string;
  [key: string]: any; // Para campos adicionales específicos del CRM
}

export interface EmployeeData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  company_id?: string;
  [key: string]: any;
}

export interface OpportunityData {
  name: string;
  company_id?: string;
  employee_id?: string;
  amount?: number;
  currency?: string;
  stage_step?: string;
  description?: string;
  expected_close_date?: string;
  [key: string]: any;
}

// Interfaces de respuesta
export interface CompanyResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    [key: string]: any;
  };
  error?: string;
}

export interface EmployeeResponse {
  success: boolean;
  data?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    [key: string]: any;
  };
  error?: string;
}

export interface OpportunityResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    stage_step: string;
    [key: string]: any;
  };
  error?: string;
}

export interface CompanyListResponse {
  success: boolean;
  data?: CompanyResponse['data'][];
  error?: string;
}

export interface EmployeeListResponse {
  success: boolean;
  data?: EmployeeResponse['data'][];
  error?: string;
}

export interface OpportunityListResponse {
  success: boolean;
  data?: OpportunityResponse['data'][];
  error?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  provider: string;
  timestamp: string;
}
