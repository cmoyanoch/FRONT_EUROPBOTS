import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'n8n_db',
  user: process.env.DB_USER || 'n8n_user',
  password: process.env.DB_PASSWORD || 'n8n_password',
});

export async function POST(request: NextRequest) {
  try {
    const { countryCodes } = await request.json();

    console.log('=== DEBUG: API /api/countries/names ===');
    console.log('Códigos recibidos:', countryCodes);

    if (!countryCodes || !Array.isArray(countryCodes) || countryCodes.length === 0) {
      return NextResponse.json({ error: 'countryCodes array is required' }, { status: 400 });
    }

    // Crear placeholders para la consulta SQL
    const placeholders = countryCodes.map((_, index) => `$${index + 1}`).join(',');

    const query = `
      SELECT codigo_linkedin, pais_nombre_es, pais_nombre_fr
      FROM phantombuster.linkedin_codigos_paises_europa
      WHERE codigo_linkedin IN (${placeholders})
      AND activo = true
      ORDER BY pais_nombre_es
    `;

    console.log('Query SQL:', query);
    console.log('Parámetros:', countryCodes);

    const result = await pool.query(query, countryCodes);

    console.log('Resultados de la BD:', result.rows);

    // Crear un mapa de códigos a nombres (preferir español, fallback a francés)
    const countryNames = countryCodes.map(code => {
      const country = result.rows.find(row => row.codigo_linkedin === code);
      console.log(`Buscando código: "${code}" - Encontrado:`, country);
      return country ? (country.pais_nombre_es || country.pais_nombre_fr || code) : code;
    });

    console.log('Nombres finales:', countryNames);

    return NextResponse.json({
      success: true,
      countryNames,
      totalFound: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching country names:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
