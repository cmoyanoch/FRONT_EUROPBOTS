import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'n8n_postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'n8n',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export async function POST(request: Request) {
  try {
    const { profileIds } = await request.json();

    if (!profileIds || !Array.isArray(profileIds)) {
      return NextResponse.json({
        success: false,
        error: 'profileIds array is required'
      }, { status: 400 });
    }

    // Limpiar y preparar los IDs de perfiles para la consulta
    const cleanProfileIds = profileIds.filter(id => id && !isNaN(parseInt(id)));

    if (cleanProfileIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const query = `
      SELECT
        r.id as role_id,
        r.name as role_name,
        p.id as profile_id,
        p.key_profiles as profile_name
      FROM webapp.roles r
      INNER JOIN webapp.profiles p ON r.id_profiles = p.id
      WHERE p.id = ANY($1::int[])
      ORDER BY p.key_profiles, r.name
    `;

    const result = await pool.query(query, [cleanProfileIds]);

    // Agrupar por perfil
    const rolesByProfile: { [key: number]: {
      profile: { id: number; name: string };
      roles: Array<{ id: number; name: string }>
    }} = {};

    result.rows.forEach((row: any) => {
      const profileId = row.profile_id;
      const profileName = row.profile_name;
      const roleId = row.role_id;
      const roleName = row.role_name;

      if (!rolesByProfile[profileId]) {
        rolesByProfile[profileId] = {
          profile: { id: profileId, name: profileName },
          roles: []
        };
      }

      rolesByProfile[profileId].roles.push({
        id: roleId,
        name: roleName
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        rolesByProfile,
        totalRoles: result.rows.length
      }
    });

  } catch (error) {
    console.error('Error mapping roles:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
