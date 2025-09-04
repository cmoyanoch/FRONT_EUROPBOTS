'use client';

import { useEffect, useState } from 'react';

interface Role {
  id: number;
  name: string;
}

interface ProfileData {
  profile: {
    id: number;
    name: string;
  };
  roles: Role[];
}

interface AudienceTargetProps {
  campaignId: string;
  campaign: any;
}

export default function AudienceTarget({ campaignId, campaign }: AudienceTargetProps) {
  const [rolesData, setRolesData] = useState<{ [profileId: number]: ProfileData }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar roles agrupados
  const loadCampaignRolesGrouped = async () => {
    // Verificar si hay id_roles y no es una cadena vacía
    if (!campaign.id_roles || campaign.id_roles === '' || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Limpiar la cadena de comillas y espacios
      const cleanIdRoles = campaign.id_roles.replace(/'/g, '').trim();
      const roleIds = cleanIdRoles
        .split(',')
        .map((id: string) => parseInt(id.trim()))
        .filter((id: number) => !isNaN(id));

      if (roleIds.length > 0) {
        const response = await fetch('/api/campaigns/roles-by-ids', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roleIds: roleIds })
        });

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            setRolesData(data.data.rolesByProfile);
          } else {
            setError(`Error al cargar roles: ${data.message || 'Respuesta inválida'}`);
          }
        } else {
          const errorText = await response.text();
          setError(`Error del servidor: ${response.status} ${response.statusText}`);
        }
      } else {
        setError('No se encontraron IDs de roles válidos');
      }
    } catch (error) {
      setError(`Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar roles cuando el componente se monta
  useEffect(() => {
    // Verificar si hay id_roles y no es una cadena vacía
    if (campaign.id_roles && campaign.id_roles !== '') {
      loadCampaignRolesGrouped();
    }
  }, [campaign.id_roles, campaignId]);

  if (isLoading) {
    return <span className="text-sm text-gray-400">Chargement des rôles...</span>;
  }

  if (error) {
    return <span className="text-sm text-red-400">Error: {error}</span>;
  }

  if (Object.keys(rolesData).length > 0) {
    // Mostrar roles agrupados por perfil
    const profileIds = Object.keys(rolesData).map(id => parseInt(id)).sort();
    const profileCount = profileIds.length;

    // Determinar las clases de grid basadas en el número de perfiles
    let gridClasses = "grid grid-cols sm:grid-cols-2";
    if (profileCount <= 2) {
      gridClasses += " lg:grid-cols-2";
    } else if (profileCount <= 3) {
      gridClasses += " lg:grid-cols-3";
    } else if (profileCount <= 4) {
      gridClasses += " lg:grid-cols-4";
    } else {
      gridClasses += " lg:grid-cols-5";
    }

    return (
      <div className={`${gridClasses} gap-4`}>
        {profileIds.map(profileId => {
          const profileData = rolesData[profileId];
          return (
            <div key={profileId} className="space-y-2">
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-xs text-europbots-secondary font-medium">
                  {profileData ? profileData.profile.name : `Perfil ${profileId}`}
                </span>
              </div>
              <div className="space-y-1 sm:text-right">
                {profileData.roles.map((role: Role, index: number) => (
                  <div key={index} className="text-xs text-white">
                    - {role.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  return <span className="text-sm text-gray-400">Aucun rôle assigné</span>;
}
