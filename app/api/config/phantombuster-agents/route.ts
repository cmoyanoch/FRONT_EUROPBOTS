import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'n8n_postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'n8n_db',
  user: process.env.DB_USER || 'n8n_user',
  password: process.env.DB_PASSWORD || '3Lchunch0',
});



// Función para obtener API key de Phantombuster
async function getPhantombusterApiKey(): Promise<string | null> {
  try {
    console.log('🔍 Buscando API key de Phantombuster...');

    const result = await pool.query(`
      SELECT eak.encrypted_key, eak.encryption_iv
      FROM webapp.encrypted_api_keys eak
      JOIN webapp.service_config sc ON eak.service_config_id = sc.id
      WHERE sc.service_name = 'phantombuster'
      AND eak.key_name = 'phantombuster_api_key'
      AND sc.is_active = true
      LIMIT 1
    `);

    console.log(`📊 Resultados encontrados: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log('❌ No se encontró API key de Phantombuster');
      return null;
    }

    const { encrypted_key, encryption_iv } = result.rows[0];
    console.log('✅ API key encontrada, procediendo a desencriptar...');
    console.log(`🔑 encrypted_key: ${encrypted_key.substring(0, 20)}...`);
    console.log(`🔑 encryption_iv: ${encryption_iv.substring(0, 20)}...`);

    // Desencriptar usando la función correcta que coincide con la encriptación
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long!!'.padEnd(32, '!').slice(0, 32);

    console.log(`🔑 key length: ${key.length}`);
    console.log(`🔑 encryption_iv length: ${encryption_iv.length}`);
    console.log(`🔑 encrypted_key length: ${encrypted_key.length}`);

    try {
      // Convertir el IV de hex a Buffer
      const ivBuffer = Buffer.from(encryption_iv, 'hex');
      console.log(`🔑 ivBuffer length: ${ivBuffer.length}`);

      const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
      let decrypted = decipher.update(encrypted_key, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      console.log('✅ API key desencriptada exitosamente');
      console.log(`🔑 decrypted: ${decrypted.substring(0, 10)}...`);
      return decrypted;
    } catch (decryptError) {
      console.error('❌ Error desencriptando API key:', decryptError);
      console.error('❌ Decrypt error details:', decryptError instanceof Error ? decryptError.message : 'Unknown error');
      throw decryptError;
    }
  } catch (error) {
    console.error('❌ Error getting Phantombuster API key:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Función para obtener agentes de Phantombuster
async function fetchPhantombusterAgents(apiKey: string) {
  try {
    // Primero obtener información de la organización
    const orgResponse = await fetch('https://api.phantombuster.com/api/v2/orgs/fetch', {
      headers: {
        'X-Phantombuster-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!orgResponse.ok) {
      throw new Error(`Error fetching organization: ${orgResponse.status} ${orgResponse.statusText}`);
    }

    const orgData = await orgResponse.json();

    // Luego obtener todos los agentes
    const agentsResponse = await fetch('https://api.phantombuster.com/api/v2/agents/fetch-all', {
      headers: {
        'X-Phantombuster-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!agentsResponse.ok) {
      throw new Error(`Error fetching agents: ${agentsResponse.status} ${agentsResponse.statusText}`);
    }

    const agentsData = await agentsResponse.json();

    return {
      organization: orgData,
      agents: agentsData
    };
  } catch (error) {
    console.error('Error fetching Phantombuster data:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== OBTENIENDO AGENTES DE PHANTOMBUSTER ===');

    // Obtener API key de Phantombuster
    const apiKey = await getPhantombusterApiKey();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'No se encontró una API key configurada para Phantombuster',
        error: 'NO_API_KEY_CONFIGURED'
      }, { status: 404 });
    }

    // Obtener agentes de Phantombuster
    const phantombusterData = await fetchPhantombusterAgents(apiKey);

    // Log del resultado
    console.log('✅ Agentes de Phantombuster obtenidos exitosamente');
    console.log(`📊 Organización: ${phantombusterData.organization?.name || 'N/A'}`);
    console.log(`🤖 Total de agentes: ${phantombusterData.agents?.length || 0}`);

    // Registrar en logs de configuración
    try {
      await pool.query(`
        INSERT INTO webapp.config_logs (event_type, event_description, new_values)
        VALUES ($1, $2, $3)
      `, [
        'tested',
        'Phantombuster agents fetched successfully',
        JSON.stringify({
          organization_name: phantombusterData.organization?.name,
          agents_count: phantombusterData.agents?.length || 0,
          agents: phantombusterData.agents?.map((agent: any) => ({
            id: agent.id,
            name: agent.name,
            type: agent.type,
            status: agent.status
          }))
        })
      ]);
    } catch (logError) {
      console.error('Error logging to config_logs:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Agentes de Phantombuster obtenidos exitosamente',
      data: phantombusterData
    });

  } catch (error) {
    console.error('❌ Error al obtener agentes de Phantombuster:', error);

    // Registrar error en logs
    try {
      await pool.query(`
        INSERT INTO webapp.config_logs (event_type, event_description, error_message, new_values)
        VALUES ($1, $2, $3, $4)
      `, [
        'error',
        'Error fetching Phantombuster agents',
        error instanceof Error ? error.message : 'Unknown error',
        JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
      ]);
    } catch (logError) {
      console.error('Error logging to config_logs:', logError);
    }

    return NextResponse.json({
      success: false,
      message: 'Error al obtener agentes de Phantombuster',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
