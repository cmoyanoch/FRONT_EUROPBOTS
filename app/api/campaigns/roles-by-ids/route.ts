import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'n8n_user',
  host: process.env.DB_HOST || 'n8n_postgres',
  database: process.env.DB_NAME || 'n8n_db',
  password: process.env.DB_PASSWORD || '3Lchunch0',
  port: parseInt(process.env.DB_PORT || '5432'),
})

export async function POST(request: NextRequest) {
  try {
    const { roleIds } = await request.json();

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Se requieren IDs de roles válidos'
      }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Consulta para obtener roles con información de perfiles
      const query = `
        SELECT
          r.id as role_id,
          r.name as role_name,
          r.id_profiles,
          p.key_profiles as profile_name
        FROM webapp.roles r
        LEFT JOIN webapp.profiles p ON r.id_profiles = p.id
        WHERE r.id = ANY($1) AND r.is_active = true
        ORDER BY p.id, r.order_index
      `;

      const result = await client.query(query, [roleIds]);

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No se encontraron roles con los IDs proporcionados'
        }, { status: 404 });
      }

      // Agrupar roles por perfil
      const rolesByProfile: { [key: number]: {
        profile: {
          id: number;
          name: string;
        };
        roles: Array<{
          id: number;
          name: string;
        }>;
      }} = {};

      result.rows.forEach((row: any) => {
        const profileId = row.id_profiles || 0;
        const profileName = row.profile_name || 'Sin Perfil';

        if (!rolesByProfile[profileId]) {
          rolesByProfile[profileId] = {
            profile: {
              id: profileId,
              name: profileName
            },
            roles: []
          };
        }

        rolesByProfile[profileId].roles.push({
          id: row.role_id,
          name: row.role_name
        });
      });

      // Generar HTML para cada perfil
      const htmlOutput = Object.keys(rolesByProfile).map(profileId => {
        const profileData = rolesByProfile[parseInt(profileId)];
        const rolesHtml = profileData.roles.map(role =>
          `<div class="role-item">${role.name}</div>`
        ).join('');

        return `
          <div class="profile-group">
            <div class="profile-header">
              <span class="profile-name">${profileData.profile.name}</span>
            </div>
            <div class="roles-list">
              ${rolesHtml}
            </div>
          </div>
        `;
      }).join('');

      // Generar CSS para el HTML
      const cssStyles = `
        <style>
          .profile-group {
            margin-bottom: 1rem;
            padding: 0.75rem;
            border: 1px solid #374151;
            border-radius: 0.5rem;
            background-color: rgba(31, 41, 55, 0.5);
          }
          .profile-header {
            margin-bottom: 0.5rem;
          }
          .profile-name {
            font-size: 0.875rem;
            font-weight: 500;
            color: #D2FF00;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .roles-list {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }
          .role-item {
            font-size: 0.75rem;
            color: #ffffff;
            padding: 0.25rem 0;
          }
          .profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
        </style>
      `;

      // HTML completo con grid
      const completeHtml = `
        ${cssStyles}
        <div class="profile-grid">
          ${htmlOutput}
        </div>
      `;

      return NextResponse.json({
        success: true,
        message: 'Roles agrupados por perfiles obtenidos exitosamente',
        data: {
          rolesByProfile,
          html: completeHtml,
          htmlOnly: htmlOutput,
          css: cssStyles,
          summary: {
            totalRoles: roleIds.length,
            totalProfiles: Object.keys(rolesByProfile).length,
            profiles: Object.values(rolesByProfile).map(p => p.profile.name).sort()
          }
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error obteniendo roles por IDs:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
