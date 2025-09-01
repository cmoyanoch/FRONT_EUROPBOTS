import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'n8n_postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'n8n',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id');

    if (!profileId) {
      return NextResponse.json({
        success: false,
        error: 'profile_id parameter is required'
      }, { status: 400 });
    }

    const client = await pool.connect();

    // Obtener roles de un perfil específico
    const query = `
      SELECT
        p.id as profile_id,
        p.key_profiles as profile_name,
        r.id as role_id,
        r.name as role_name
      FROM webapp.profiles p
      INNER JOIN webapp.roles r ON r.id_profiles = p.id
      WHERE p.id = $1 AND r.id IS NOT NULL
      ORDER BY r.name
    `;

    const result = await pool.query(query, [profileId]);

    // Extraer información del perfil y roles
    const profileInfo = result.rows.length > 0 ? {
      id: parseInt(profileId),
      name: result.rows[0].profile_name
    } : null;

    const roles = result.rows.map((row: any) => ({
      id: row.role_id,
      name: row.role_name
    }));

    return NextResponse.json({
      success: true,
      data: {
        profile: profileInfo,
        roles: roles
      }
    });

  } catch (error) {
    console.error('Error obteniendo roles y perfiles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo roles y perfiles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
