import { Pool } from "pg";

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configuraciones adicionales para mejor rendimiento
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo máximo que una conexión puede estar inactiva
  connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
});

// Verificar conexión
pool.on("connect", () => {
  console.log("✅ Conectado a PostgreSQL");
});

pool.on("error", (err: Error) => {
  console.error("❌ Error en la conexión de PostgreSQL:", err);
});

export default pool;

// Tipos para TypeScript
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  avatar_url?: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface Profile {
  id: string;
  bio?: string;
  website?: string;
  location?: string;
  company?: string;
  role?: string;
  preferences?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Interfaz para Leads basada en la tabla webapp.leads
export interface Lead {
  id: string;
  profile_url: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  additional_info?: string;
  location?: string;
  connection_degree?: string;
  profile_image_url?: string;
  vmid?: string;
  search_query?: string;
  category?: string;
  timestamp?: Date;
  shared_connections?: string;
  company?: string;
  company_url?: string;
  industry?: string;
  company2?: string;
  company_url2?: string;
  job_title2?: string;
  job_date_range?: string;
  job_date_range2?: string;
  school?: string;
  school_degree?: string;
  school_date_range?: string;
  school2?: string;
  school_degree2?: string;
  school_date_range2?: string;
  created_at: Date;
  updated_at: Date;
  status: "active" | "inactive" | "contacted" | "qualified" | "converted";
  source?: string;
  user_id?: string;
  assigned_to?: string;
  tags?: any[];
  notes?: any[];
  contact_history?: any[];
  process?: string;
  phone?: string;
  email?: string;
  containerid?: string;
  search_id?: string;
  id_crm?: number;
  sector?: string;
  role?: string;
  campaigns?: string;
  company_lead_id?: string;
  axonaut_contact_id?: number;
  axonaut_employee_id?: number;
  lead_score?: number;
  qualified_date?: Date;
  converted_date?: Date;
  last_contact_date?: Date;
  axonaut_company_id?: number;
}

// Función para obtener todos los leads
export async function getLeads(): Promise<Lead[]> {
  try {
    const query = `
      SELECT * FROM webapp.leads
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error obteniendo leads:", error);
    throw error;
  }
}

// Función para obtener leads con filtros
export async function getLeadsWithFilters(
  searchTerm?: string,
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ leads: Lead[]; total: number }> {
  try {
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Filtro de búsqueda
    if (searchTerm) {
      whereConditions.push(`(
        full_name ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex} OR
        company ILIKE $${paramIndex} OR
        job_title ILIKE $${paramIndex}
      )`);
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Filtro de estado
    if (status && status !== "all") {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Query para obtener leads
    const leadsQuery = `
      SELECT * FROM webapp.leads
      ${whereClause}
      ORDER BY
        CASE
          WHEN process = 'PROFILE VISITOR' THEN 1
          WHEN process = 'AUTOCONNECT' THEN 2
          WHEN process = 'MESSAGE SENDER' THEN 3
          WHEN process = 'ENRICHED' THEN 4
          WHEN process = 'EXTRACTED' THEN 5
          ELSE 6
        END,
        created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total FROM webapp.leads
      ${whereClause}
    `;
    const countParams = params.slice(0, -2); // Excluir LIMIT y OFFSET

    const [leadsResult, countResult] = await Promise.all([
      pool.query(leadsQuery, params),
      pool.query(countQuery, countParams),
    ]);

    return {
      leads: leadsResult.rows,
      total: parseInt(countResult.rows[0].total),
    };
  } catch (error) {
    console.error("Error obteniendo leads con filtros:", error);
    throw error;
  }
}

// Función para obtener estadísticas de leads
export async function getLeadsStats(): Promise<{
  total: number;
  qualified: number;
  contacted: number;
  conversionRate: number;
}> {
  try {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted
      FROM webapp.leads
    `;
    const result = await pool.query(query);
    const stats = result.rows[0];

    const total = parseInt(stats.total);
    const qualified = parseInt(stats.qualified);
    const contacted = parseInt(stats.contacted);
    const converted = parseInt(stats.converted);

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    return {
      total,
      qualified,
      contacted,
      conversionRate: Math.round(conversionRate * 10) / 10, // Redondear a 1 decimal
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas de leads:", error);
    throw error;
  }
}

// Función para actualizar el estado de un lead
export async function updateLeadStatus(
  leadId: string,
  status: string
): Promise<void> {
  try {
    const query = `
      UPDATE webapp.leads
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(query, [status, leadId]);
  } catch (error) {
    console.error("Error actualizando estado del lead:", error);
    throw error;
  }
}

// Función para eliminar un lead
export async function deleteLead(leadId: string): Promise<void> {
  try {
    const query = `DELETE FROM webapp.leads WHERE id = $1`;
    await pool.query(query, [leadId]);
  } catch (error) {
    console.error("Error eliminando lead:", error);
    throw error;
  }
}
