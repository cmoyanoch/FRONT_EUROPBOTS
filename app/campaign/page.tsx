"use client";

import AudienceTarget from "@/components/audience-target";
import FuturisticBackground from "@/components/futuristic-background";
import RegionDisplay from "@/components/region-display";
import Accordion from "@/components/ui/accordion";
import AnimatedCard from "@/components/ui/animated-card";
import { useToast } from "@/components/ui/toast-provider";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  Search,
  Square,
  Target,
  Trash2,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

// Interfaces para los datos dinámicos
interface Sector {
  id: number;
  name: string;
  code: string;
  description: string | null;
  order_index: number;
}

interface Role {
  id: number;
  name: string;
  code: string;
  description: string | null;
  order_index: number;
  sector_id: number;
  id_profiles?: number;
  profile_name?: string;
}

interface CountryGroup {
  priority: number;
  title: string;
  description: string;
  countries: {
    name: string;
    code: string;
    description: string;
    order_index: number;
  }[];
}

// Datos de ejemplo para los filtros (fallback)
const FALLBACK_SECTORS = [
  "Manufacturing & Industry",
  "Banking & Insurance",
  "Retail",
  "Hospitality & Hotels",
  "Healthcare & Hospitals",
  "Technology & Telecom",
  "Logistics & Transportation",
  "Real Estate & Development",
  "Education",
  "Business Services & Consulting",
  "Facilities & Cleaning Services",
  "Government & Public Administration",
];

const FALLBACK_ROLES = [
  "CEO",
  "CTO",
  "CFO",
  "CMO",
  "Operations Directors",
  "Sales Directors",
  "Managers",
  "Directors",
  "VPs",
  "Founders",
  "Presidents",
];

// Datos de ejemplo para los filtros (fallback)
const FALLBACK_COUNTRIES = [
  { name: 'France', code: '105015875', description: 'France', order_index: 1 },
];

// Función para obtener nombres de países desde la base de datos
const getCountryNamesFromDB = async (countryCodes: string[]): Promise<string[]> => {
  try {
    const response = await fetch('/api/countries/names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ countryCodes }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.countryNames || [];
    }
  } catch (error) {
    console.error('Error fetching country names:', error);
  }

  // Si la API falla, devolver los códigos originales
  return countryCodes;
};

// Función para agrupar roles por perfiles
const groupRolesByProfiles = (roles: Role[]) => {
  // Agrupar roles por id_profiles
  const profileGroups: { [key: number]: Role[]; } = {};

  roles.forEach(role => {
    const profileId = role.id_profiles || 0;
    if (!profileGroups[profileId]) {
      profileGroups[profileId] = [];
    }
    profileGroups[profileId].push(role);
  });

  // Convertir a array y ordenar por id_profiles
  return Object.entries(profileGroups)
    .map(([profileId, roles]) => {
      // Obtener el nombre del perfil del primer rol (todos los roles del mismo perfil tienen el mismo nombre)
      const profileName = roles[0]?.profile_name || `Perfil ${profileId}`;

      return {
        profileId: parseInt(profileId),
        profileName: profileName,
        roles: roles.sort((a, b) => a.order_index - b.order_index)
      };
    })
    .sort((a, b) => a.profileId - b.profileId);
};

// ✅ NUEVA FUNCIÓN: Para agrupar roles de campañas específicamente
const groupCampaignRolesByProfiles = (roleIds: number[], allRoles: Role[]) => {
  const rolesByProfile: { [key: number]: { profile: { id: number; name: string }; roles: Array<{ id: number; name: string }> } } = {};

  roleIds.forEach((roleId: number) => {
    const role = allRoles.find((r: Role) => r.id === roleId);

    if (role && role.id_profiles) {
      const profileId = role.id_profiles;
      const profileName = role.profile_name || 'Sin Perfil';

      if (!rolesByProfile[profileId]) {
        rolesByProfile[profileId] = {
          profile: { id: profileId, name: profileName },
          roles: []
        };
      }
      rolesByProfile[profileId].roles.push({ id: role.id, name: role.name });
    }
  });

  return rolesByProfile;
};

// Componente de acordeón funcional
const AccordionItem = ({
  title,
  children,
  isOpen,
  onToggle,
  index
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) => {
  return (
    <div className={`rounded-lg ${isOpen ? 'border border-europbots-secondary/20' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center justify-between w-full p-4 font-medium rtl:text-right text-europbots-secondary focus:ring-4 focus:ring-europbots-secondary/20 hover:bg-europbots-secondary/10 transition-colors gap-3 ${!isOpen ? 'border border-europbots-secondary/20 rounded-lg' : ''}`}
        aria-expanded={isOpen}
        aria-controls={`accordion-body-${index}`}
      >
        <span className="text-sm">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0" />
        )}
      </button>
      <div
        id={`accordion-body-${index}`}
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'block opacity-100' : 'hidden opacity-0'
          }`}
        aria-labelledby={`accordion-heading-${index}`}
      >
        {isOpen && (
          <div className="p-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CampaignPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);
  const [leadsCounts, setLeadsCounts] = useState<{ [key: string]: number; }>({});
  const [processStats, setProcessStats] = useState<{ [key: string]: Array<{ process_name: string; process: string; count: number; }>; }>({});
    const [rolesProfiles, setRolesProfiles] = useState<{
    [key: number]: { profile: { id: number; name: string }; roles: Array<{ id: number; name: string }> }
  }>({});
  const [loadingRolesProfiles, setLoadingRolesProfiles] = useState(true);

  // Estado para roles agrupados por campaña
  const [campaignRolesGrouped, setCampaignRolesGrouped] = useState<{
    [campaignId: string]: { [profileId: number]: { profile: { id: number; name: string }; roles: Array<{ id: number; name: string }> } }
  }>({});
  const [loadingCampaignRoles, setLoadingCampaignRoles] = useState<{ [campaignId: string]: boolean }>({});



  // Estados para datos dinámicos
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [countryGroups, setCountryGroups] = useState<CountryGroup[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  // ✅ NUEVO: Estado para TODOS los roles (para visualización de campañas)
  const [allRoles, setAllRoles] = useState<Role[]>([]);

  // Estados para controlar el acordeón
  const [openAccordionItems, setOpenAccordionItems] = useState<number[]>([]); // Empezar con todos cerrados
  const [openCountryGroups, setOpenCountryGroups] = useState<number[]>([]); // Empezar con todos cerrados



  // Hook para notificaciones
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Función para verificar si un grupo de roles tiene elementos seleccionados
  const hasSelectedRolesInGroup = (profileGroup: any) => {
    return profileGroup.roles.some((role: any) => selectedRoles.includes(role.name));
  };

  // Función para verificar si un grupo de países tiene elementos seleccionados
  const hasSelectedCountriesInGroup = (group: any) => {
    return group.countries.some((country: any) => selectedCountries.includes(country.code));
  };

  // Función para manejar el toggle del acordeón de roles
  const handleAccordionToggle = (index: number) => {
    const profileGroup = groupRolesByProfiles(availableRoles)[index];

    // Si el grupo tiene elementos seleccionados, no permitir colapsar
    if (hasSelectedRolesInGroup(profileGroup) && openAccordionItems.includes(index)) {
      return;
    }

    setOpenAccordionItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Función para manejar el toggle del acordeón de países
  const handleCountryGroupToggle = (index: number) => {
    const group = countryGroups[index];

    // Si el grupo tiene elementos seleccionados, no permitir colapsar
    if (hasSelectedCountriesInGroup(group) && openCountryGroups.includes(index)) {
      return;
    }

    setOpenCountryGroups(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Cargar sectores y roles desde la API
  const loadSectorsAndRoles = async () => {
    try {
      const response = await fetch("/api/search/filters");
      const data = await response.json();

      if (data.success) {
        setSectors(data.sectors || []);
        setRoles(data.roles || []);
        // ✅ Cargar todos los roles en allRoles para visualización de campañas
        console.log('Roles cargados:', data.roles?.length || 0);
        setAllRoles(data.roles || []);
        // ✅ Mantener availableRoles vacío hasta que se seleccione un sector
        setAvailableRoles([]);
        setCountries(data.countries || []);
        setCountryGroups(data.countryGroups || []);
      } else {
        console.error("Error cargando sectores y roles:", data.message);
        // Usar datos de fallback
        const fallbackRoles = FALLBACK_ROLES.map((name, index) => ({
          id: index + 1,
          name,
          code: name.toLowerCase().replace(/\s+/g, '_'),
          description: null,
          order_index: index + 1,
          sector_id: 1 // Asignar al primer sector por defecto
        }));
        setSectors(FALLBACK_SECTORS.map((name, index) => ({
          id: index + 1,
          name,
          code: name.toLowerCase().replace(/\s+/g, '_'),
          description: null,
          order_index: index + 1
        })));
        setRoles(fallbackRoles);
        // ✅ Cargar roles de fallback en allRoles
        setAllRoles(fallbackRoles);
        // ✅ Mantener availableRoles vacío
        setAvailableRoles([]);
        setCountries(FALLBACK_COUNTRIES);
        setCountryGroups([
          {
            priority: 1,
            title: 'Principales',
            description: 'Países prioritarios - mercados principales',
            countries: FALLBACK_COUNTRIES
          }
        ]);
      }
    } catch (error) {
      console.error("Error cargando sectores y roles:", error);
      // Usar datos de fallback
      setSectors(FALLBACK_SECTORS.map((name, index) => ({
        id: index + 1,
        name,
        code: name.toLowerCase().replace(/\s+/g, '_'),
        description: null,
        order_index: index + 1
      })));
      setRoles(FALLBACK_ROLES.map((name, index) => ({
        id: index + 1,
        name,
        code: name.toLowerCase().replace(/\s+/g, '_'),
        description: null,
        order_index: index + 1,
        sector_id: 1 // Asignar al primer sector por defecto
      })));
      setCountries(FALLBACK_COUNTRIES);
      setCountryGroups([
        {
          priority: 1,
          title: 'Principales',
          description: 'Países prioritarios - mercados principales',
          countries: FALLBACK_COUNTRIES
        }
      ]);
    }
  };

  // Función para filtrar roles por sector seleccionado
  const filterRolesBySector = (sectorName: string) => {
    if (!sectorName) {
      setAvailableRoles([]);
      return;
    }

    // Buscar el sector seleccionado
    const selectedSectorData = sectors.find(sector => sector.name === sectorName);

    if (!selectedSectorData) {
      setAvailableRoles([]);
      return;
    }

    // ✅ Filtrar roles usando sector_id (evita duplicados)
    const sectorRoles = roles.filter(role => role.sector_id === selectedSectorData.id);

    setAvailableRoles(sectorRoles);
  };

  // Función para obtener roles de un perfil específico
  const fetchRolesForProfile = async (profileId: number) => {
    try {
      const response = await fetch(`/api/roles-profiles?profile_id=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRolesProfiles(prev => ({
            ...prev,
            [profileId]: data.data
          }));
        }
      }
    } catch (error) {
      console.error(`Error obteniendo roles para perfil ${profileId}:`, error);
    }
  };

  // Función para obtener roles de múltiples perfiles
  const fetchRolesProfiles = async () => {
    try {
      setLoadingRolesProfiles(true);
      // Obtener roles para los perfiles principales
      const profileIds = [1, 3, 4, 5]; // Director, C-Level/Executive, Mid-Senior Level, Associate
      await Promise.all(profileIds.map(id => fetchRolesForProfile(id)));
    } catch (error) {
      console.error('Error obteniendo roles y perfiles:', error);
    } finally {
      setLoadingRolesProfiles(false);
    }
  };

        // Función para obtener roles por IDs desde la campaña
  const fetchCampaignRolesByIds = async (roleIds: string) => {
    try {
      // Convertir la cadena de IDs separados por comas a array
      const roleIdsArray = roleIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      if (roleIdsArray.length === 0) {
        return {};
      }

      const response = await fetch('/api/campaigns/roles-by-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleIds: roleIdsArray })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data.rolesByProfile;
        }
      }
      return {};
    } catch (error) {
      console.error('Error obteniendo roles de campaña por IDs:', error);
      return {};
    }
  };

  // Función para obtener roles de perfiles específicos (fallback)
  const fetchCampaignRoles = async (profileIds: number[]) => {
    try {
      const response = await fetch('/api/roles-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileIds })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data.rolesByProfile;
        }
      }
      return {};
    } catch (error) {
      console.error('Error obteniendo roles de campaña:', error);
      return {};
    }
  };

  // Función para cargar roles agrupados por campaña
  const loadCampaignRolesGrouped = async (campaignId: string, campaign: any) => {
    // Si ya se están cargando, no hacer nada
    if (loadingCampaignRoles[campaignId]) {
      return;
    }

    // Si ya están cargados, no hacer nada
    if (campaignRolesGrouped[campaignId]) {
      return;
    }

    setLoadingCampaignRoles(prev => ({ ...prev, [campaignId]: true }));

    try {
      let rolesData = {};

      // Usar el campo id_roles de la campaña si está disponible
      if (campaign.id_roles) {
        const roleIds = campaign.id_roles.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        console.log(`Cargando roles para campaña ${campaignId} con IDs:`, roleIds);

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
              rolesData = data.data.rolesByProfile;
              console.log(`Roles agrupados para campaña ${campaignId}:`, rolesData);
            }
          }
        }
      } else {
        // No hay id_roles, mostrar mensaje de error
        console.log(`Campaña ${campaignId} no tiene id_roles`);
        rolesData = {};
      }

      setCampaignRolesGrouped(prev => ({
        ...prev,
        [campaignId]: rolesData
      }));
    } catch (error) {
      console.error(`Error cargando roles para campaña ${campaignId}:`, error);
    } finally {
      setLoadingCampaignRoles(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  useEffect(() => {
    async function loadCampaigns() {
      try {
        // Iniciando carga de campañas
        setLoading(true);
        const response = await fetch("/api/campaigns");
        // Response status
        const data = await response.json();
        // Datos recibidos

        if (data.success) {
          // Campañas cargadas exitosamente
          setCampaigns(data.campaigns);
          // Cargar conteos de leads para cada campaña
          await loadLeadsCounts(data.campaigns);
          // Cargar estadísticas de proceso para cada campaña
          await loadProcessStats(data.campaigns);
        } else {
          console.error("❌ Error en respuesta:", data.message);
          setError(data.message || "Error al cargar las campañas");
        }
      } catch (error) {
        console.error("❌ Error cargando campañas:", error);
        setError("Error de conexión al cargar las campañas");
      } finally {
        // Finalizando carga de campañas
        setLoading(false);
      }
    }

    loadCampaigns();
    loadSectorsAndRoles();
    fetchRolesProfiles();
  }, []);

  // Función para cargar los conteos de leads por campaña
  async function loadLeadsCounts(campaignsList: any[]) {
    try {
      // Iniciando carga de conteos de leads
      const counts: { [key: string]: number; } = {};

      // Obtener conteos individuales por campaña
      const response = await fetch("/api/campaigns/leads-count");
      // Leads count response status

      if (response.ok) {
        const data = await response.json();
        // Leads count data
        // Usar los conteos individuales por campaña
        if (data.leads_counts) {
          // Asignar conteos específicos por campaña
          for (const campaign of campaignsList) {
            counts[campaign.campaign_id] = data.leads_counts[campaign.campaign_id] || 0;
          }
        } else {
          // Fallback: asignar 0 a todas las campañas
          for (const campaign of campaignsList) {
            counts[campaign.campaign_id] = 0;
          }
        }
      } else {
        // Leads count response not ok
        // Si falla, asignar 0 a todas las campañas
        for (const campaign of campaignsList) {
          counts[campaign.campaign_id] = 0;
        }
      }

      // Conteos de leads asignados
      setLeadsCounts(counts);
    } catch (error) {
      console.error("❌ Error al cargar conteos de leads:", error);
      // En caso de error, asignar 0 a todas las campañas
      const counts: { [key: string]: number; } = {};
      for (const campaign of campaignsList) {
        counts[campaign.campaign_id] = 0;
      }
      setLeadsCounts(counts);
    }
  }

  // Función para cargar las estadísticas de proceso por campaña
  async function loadProcessStats(campaignsList: any[]) {
    try {
      // Iniciando carga de estadísticas de proceso
      const stats: { [key: string]: any[]; } = {};

      // Obtener estadísticas de proceso para todas las campañas
      const response = await fetch("/api/campaigns/process-stats");
      // Process stats response status

      if (response.ok) {
        const data = await response.json();
        // Process stats data
        // Usar las estadísticas específicas por campaña
        if (data.process_stats_by_campaign) {
          // Asignar estadísticas específicas por campaña
          for (const campaign of campaignsList) {
            stats[campaign.campaign_id] = data.process_stats_by_campaign[campaign.campaign_id] || [];
          }
        } else {
          // Fallback: asignar array vacío a todas las campañas
          for (const campaign of campaignsList) {
            stats[campaign.campaign_id] = [];
          }
        }
      } else {
        // Process stats response not ok
        // Si falla, asignar array vacío a todas las campañas
        for (const campaign of campaignsList) {
          stats[campaign.campaign_id] = [];
        }
      }

      // Estadísticas de proceso asignadas
      setProcessStats(stats);

      // DATOS DE PRUEBA: Agregar datos simulados para mostrar el diseño
      // Solo si no hay datos reales, agregar datos de prueba para la primera campaña activa
      const activeCampaigns = campaignsList.filter(campaign => campaign.status === 'active');
      if (activeCampaigns.length > 0 && Object.keys(stats).length === 0) {
        const testStats: { [key: string]: any[]; } = { ...stats };

        // Datos de prueba para la primera campaña activa
        const firstActiveCampaign = activeCampaigns[0];
        testStats[firstActiveCampaign.campaign_id] = [
          {
            process_name: 'ENRICHED',
            process: 'ENRICHED',
            count: 15,
            percentage: '13.9'
          },
          {
            process_name: 'PROFILE VISITOR',
            process: 'PROFILE VISITOR',
            count: 42,
            percentage: '38.9'
          },
          {
            process_name: 'AUTOCONNECT',
            process: 'AUTOCONNECT',
            count: 45,
            percentage: '41.7'
          },
          {
            process_name: 'MESSAGE SENDER',
            process: 'MESSAGE SENDER',
            count: 6,
            percentage: '5.6'
          }
        ];

        // Actualizar también los conteos de leads para que coincidan
        const updatedLeadsCounts = { ...leadsCounts };
        updatedLeadsCounts[firstActiveCampaign.campaign_id] = 108; // Total de leads
        setLeadsCounts(updatedLeadsCounts);

        // Test data applied for design display
        setProcessStats(testStats);
      }
    } catch (error) {
      console.error("❌ Error al cargar estadísticas de proceso:", error);
      // En caso de error, asignar array vacío a todas las campañas
      const stats: { [key: string]: any[]; } = {};
      for (const campaign of campaignsList) {
        stats[campaign.campaign_id] = [];
      }
      setProcessStats(stats);
    }
  }

  function handleToggle(
    array: string[],
    value: string,
    setter: (v: string[]) => void
  ) {
    if (array.includes(value)) setter(array.filter((v) => v !== value));
    else setter([...array, value]);
  }

  async function handleCreateCampaign() {
    try {
      // Validar que se haya seleccionado un sector
      if (!selectedSector) {
        showWarning("Veuillez sélectionner un secteur");
        return;
      }

      // Validar que se hayan seleccionado roles
      if (selectedRoles.length === 0) {
        showWarning("Veuillez sélectionner au moins un rôle");
        return;
      }

      // Validar que se haya seleccionado al menos una región
      if (selectedCountries.length === 0) {
        showWarning("Veuillez sélectionner au moins une région");
        return;
      }

      // Generar nombre de campaña más descriptivo
      const campaignName = `${selectedSector} lundi au vendredi Semaine ${Math.ceil(new Date().getTime() / (1000 * 60 * 60 * 24 * 7))} ${new Date().getFullYear()}`;

      // Obtener los roles seleccionados con sus IDs de perfil
      const selectedRolesWithProfiles: Array<{ roleId: number; roleName: string; profileId: number; profileName: string }> = [];
      const profileGroups = groupRolesByProfiles(availableRoles);

      profileGroups.forEach((profileGroup) => {
        // Verificar si este grupo tiene roles seleccionados
        profileGroup.roles.forEach(role => {
          if (selectedRoles.includes(role.name)) {
            selectedRolesWithProfiles.push({
              roleId: role.id,
              roleName: role.name,
              profileId: profileGroup.profileId,
              profileName: profileGroup.profileName
            });
          }
        });
      });

      // Datos de la campaña a enviar al webhook
      const campaignData = {
        name: campaignName,
        filters: {
          sectors: [selectedSector], // Usar el sector seleccionado
          roles: selectedRolesWithProfiles, // Enviar roles con información de perfil
          regions: selectedCountries,
        },
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      // Llamada al webhook de n8n
      const response = await fetch("/api/n8n/create-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Campaña creada exitosamente via webhook n8n
        showSuccess(`Campagne créée avec succès! ID: ${result.campaignId}`);
        setShowModal(false);
        // Recargar la lista de campañas
        window.location.reload();
      } else {
        console.error("Error al crear la campaña:", result.message);
        showError(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error en la llamada al webhook:", error);
      showError("Erreur de connexion lors de la création de la campagne");
    }
  }

  // Función para manejar la eliminación de campañas
  const handleDeleteCampaign = async (campaignId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir désactiver cette campagne? Cette action la masquera de la liste."
      )
    ) {
      return;
    }

    try {
      setDeletingCampaign(campaignId);
      const response = await fetch(`/api/campaigns/${campaignId}/deactivate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // Campaña desactivada exitosamente
        // Remover la campaña de la lista local
        setCampaigns((prevCampaigns) =>
          prevCampaigns.filter(
            (campaign) => campaign.campaign_id !== campaignId
          )
        );
        showSuccess("Campagne désactivée correctement");
      } else {
        console.error("❌ Error al desactivar campaña:", data.message);
        showError(
          `Erreur lors de la désactivation de la campagne: ${data.message}`
        );
      }
    } catch (error) {
      console.error("❌ Error de conexión al desactivar campaña:", error);
      showError("Erreur de connexion lors de la désactivation de la campagne");
    } finally {
      setDeletingCampaign(null);
    }
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function cleanValue(value: string | null | undefined): string {
    if (!value) return "N/A";

    // Limpiar comillas simples
    let cleaned = value.replace(/'/g, "");

    // Si contiene comas, formatear con saltos de línea
    if (cleaned.includes(',')) {
      return cleaned
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .join('\n');
    }

    // Si contiene "lundi", hacer salto de línea antes de "lundi"
    if (cleaned.includes('lundi')) {
      const lundiIndex = cleaned.indexOf('lundi');
      return cleaned.substring(0, lundiIndex) + '\n' + cleaned.substring(lundiIndex);
    }

    return cleaned;
  }

  function calculateProgress(campaign: any) {
    // ✅ USAR PROGRESO CALCULADO POR LA BASE DE DATOS
    // La base de datos ya calcula el progreso automáticamente basado en duración temporal

    if (campaign.progress !== undefined && campaign.progress !== null) {
      return Math.round(campaign.progress);
    }

    // Fallback: si no hay progreso calculado, mostrar 0
    console.warn(`Campaña ${campaign.campaign_id} sin progreso calculado`);
    return 0;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400";
      case "paused":
        return "text-orange-400";
      case "stopped":
        return "text-red-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20";
      case "paused":
        return "bg-orange-500/20";
      case "stopped":
        return "bg-red-500/20";
      case "cancelled":
        return "bg-red-500/20";
      default:
        return "bg-gray-500/20";
    }
  };

  // Log temporal para debuggear
  // Estado actual del componente

  // Separar campañas activas y completadas
  const activeCampaigns = campaigns.filter(campaign =>
    campaign.status === 'active' && !campaign.is_expired
  );

  const completedCampaigns = campaigns.filter(campaign =>
    campaign.status === 'completed'
  );

  return (
    <div className="min-h-screen relative">
      <FuturisticBackground />

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8 relative z-10">
        {/* Header Principal */}
        <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-4 sm:p-6 mb-6 sm:mb-8" delay={0.1}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2">
                Gestion des Campagnes
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-300">
                Administrez et surveillez vos campagnes de marketing automatisé
              </p>
            </motion.div>
            <motion.div
              className="flex justify-center lg:justify-end w-full lg:w-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                disabled={campaigns.some(
                  (campaign) => campaign.status === "active"
                )}
                className={`font-bold py-3 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full lg:w-auto min-h-[44px] ${campaigns.some((campaign) => campaign.status === "active")
                    ? "bg-white/10 text-gray-300 cursor-not-allowed"
                    : "bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90"
                  }`}
                title={
                  campaigns.some((campaign) => campaign.status === "active")
                    ? "Il y a déjà une campagne active. Vous devez mettre en pause ou annuler la campagne actuelle avant d'en créer une nouvelle."
                    : "Créer une nouvelle campagne"
                }
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Nouvelle Campagne</span>
              </motion.button>
            </motion.div>
          </div>
        </AnimatedCard>

        {/* Search and Filter Section */}
        <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8" delay={0.1}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <motion.div
                className="relative"
                whileFocus="focused"
                variants={{
                  focused: { scale: 1.02 }
                }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <motion.input
                  type="text"
                  placeholder="Rechercher des campagnes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 sm:py-4 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200 text-sm sm:text-base min-h-[44px]"
                  whileFocus={{ borderColor: "#D2FF00" }}
                />
              </motion.div>
            </div>
          </div>
        </AnimatedCard>

        {/* Estado de carga */}
        {loading && (
          <AnimatedCard className="text-center py-12" delay={0.2}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-b-2 border-europbots-secondary mx-auto mb-4 rounded-full"
            />
            <motion.p
              className="text-gray-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Chargement des campagnes...
            </motion.p>
          </AnimatedCard>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <AnimatedCard className="text-center py-12" delay={0.2}>
            <motion.div
              className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <X className="w-8 h-8 text-red-400" />
            </motion.div>
            <motion.h3
              className="text-lg font-medium text-red-300 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Erreur lors du chargement des campagnes
            </motion.h3>
            <motion.p
              className="text-gray-300 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >{error}</motion.p>
            <motion.button
              onClick={() => window.location.reload()}
              className="bg-europbots-secondary hover:bg-europbots-secondary/90 text-europbots-primary font-bold py-3 px-6 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Réessayer
            </motion.button>
          </AnimatedCard>
        )}

        {/* Layout de dos columnas: Campañas activas y completadas */}
        <AnimatePresence>
          {!loading && !error && campaigns.length > 0 && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Columna izquierda: Campañas activas */}
              <div className="lg:col-span-2">
                <motion.h2
                  className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Campagnes Actives ({activeCampaigns.length})
                </motion.h2>

                {activeCampaigns.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {activeCampaigns.map((campaign, index) => (
                      <AnimatedCard
                        key={campaign.campaign_id}
                        className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-4 sm:p-6 hover:bg-white/15 transition-all duration-200 campaign-card"
                        delay={index * 0.1}
                      >
                        {/* Header de la tarjeta */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="bg-europbots-secondary/20 p-2 rounded-lg flex-shrink-0">
                              <Target className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-europbots-secondary campaign-icon animate-pulse" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base sm:text-lg font-semibold text-white break-words leading-tight campaign-title">
                                {cleanValue(campaign.campaign_name)}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-300 mt-1 campaign-description">
                                Campagne automatisée LinkedIn
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 self-start">
                            <button
                              onClick={() => handleDeleteCampaign(campaign.campaign_id)}
                              disabled={deletingCampaign === campaign.campaign_id}
                              className={`p-2 sm:p-3 rounded-lg transition-colors campaign-button ${deletingCampaign === campaign.campaign_id
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "bg-red-500/20 hover:bg-red-500/30"
                                }`}
                              title="Désactiver la campagne"
                            >
                              {deletingCampaign === campaign.campaign_id ? (
                                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                              )}
                            </button>
                          </div>
                        </div>



                        {/* Barra de progreso */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Conversion Rate</span>
                            <span className="text-white font-medium">
                              {(() => {
                                const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                const messageSenderCount = processStats[campaign.campaign_id]?.find(
                                  stat => stat.process_name === 'MESSAGE SENDER' || stat.process === 'MESSAGE SENDER'
                                )?.count || 0;
                                return totalLeads > 0 ? ((messageSenderCount / totalLeads) * 100).toFixed(1) : '0.0';
                              })()}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-europbots-secondary h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(() => {
                                  const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                  const messageSenderCount = processStats[campaign.campaign_id]?.find(
                                    stat => stat.process_name === 'MESSAGE SENDER' || stat.process === 'MESSAGE SENDER'
                                  )?.count || 0;
                                  return totalLeads > 0 ? ((messageSenderCount / totalLeads) * 100) : 0;
                                })()}%`
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Grid de estadísticas de proceso */}
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 mb-4">
                          {/* LEADS */}
                          <div className="text-center p-2 sm:p-2 bg-white/5 rounded-lg">
                            <p className="process-stat-title font-bold text-white">LEADS</p>
                            <span className="text-white font-medium">
                              {leadsCounts[campaign.campaign_id] || 0}
                            </span>
                          </div>

                          {/* ENRICHED */}
                          <div className="text-center p-2 sm:p-2 bg-white/5 rounded-lg">
                            <p className="process-stat-title font-bold text-white">ENRICHED</p>
                            <p className="text-xs text-gray-300">
                              {(() => {
                                const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                const enrichedCount = processStats[campaign.campaign_id]?.find(
                                  stat => stat.process_name === 'ENRICHED' || stat.process === 'ENRICHED'
                                )?.count || 0;
                                const percentage = totalLeads > 0 ? ((enrichedCount / totalLeads) * 100).toFixed(1) : '0.0';
                                return `${enrichedCount} (${percentage}%)`;
                              })()}
                            </p>
                          </div>

                          {/* PROFILE VISITOR */}
                          <div className="text-center p-2 sm:p-2 bg-white/5 rounded-lg">
                            <p className="process-stat-title font-bold text-white">PROFILE VISITOR</p>
                            <p className="text-xs text-gray-300">
                              {(() => {
                                const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                const profileVisitorCount = processStats[campaign.campaign_id]?.find(
                                  stat => stat.process_name === 'PROFILE VISITOR' || stat.process === 'PROFILE VISITOR'
                                )?.count || 0;
                                const percentage = totalLeads > 0 ? ((profileVisitorCount / totalLeads) * 100).toFixed(1) : '0.0';
                                return `${profileVisitorCount} (${percentage}%)`;
                              })()}
                            </p>
                          </div>

                          {/* AUTOCONNECT */}
                          <div className="text-center p-2 sm:p-2 bg-white/5 rounded-lg">
                            <p className="process-stat-title font-bold text-white">AUTOCONNECT</p>
                            <p className="text-xs text-gray-300">
                              {(() => {
                                const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                const autoconnectCount = processStats[campaign.campaign_id]?.find(
                                  stat => stat.process_name === 'AUTOCONNECT' || stat.process === 'AUTOCONNECT'
                                )?.count || 0;
                                const percentage = totalLeads > 0 ? ((autoconnectCount / totalLeads) * 100).toFixed(1) : '0.0';
                                return `${autoconnectCount} (${percentage}%)`;
                              })()}
                            </p>
                          </div>

                          {/* MESSAGE SENDER */}
                          <div className="text-center p-2 sm:p-2 bg-white/5 rounded-lg">
                            <p className="process-stat-title font-bold text-white">MESSAGE SENDER</p>
                            <p className="text-xs text-gray-300">
                              {(() => {
                                const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                const messageSenderCount = processStats[campaign.campaign_id]?.find(
                                  stat => stat.process_name === 'MESSAGE SENDER' || stat.process === 'MESSAGE SENDER'
                                )?.count || 0;
                                const percentage = totalLeads > 0 ? ((messageSenderCount / totalLeads) * 100).toFixed(1) : '0.0';
                                return `${messageSenderCount} (${percentage}%)`;
                              })()}
                            </p>
                          </div>
                        </div>

                        {/* Detalles de la campaña en Accordion */}
                        <div className="mb-4 campaign-details">
                          <Accordion
                            title="Détails de la Campagne"
                            id={`details-${campaign.campaign_id}`}
                            className="mb-2"
                          >
                            <div className="space-y-3">
                              {/* Secteurs */}
                              <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                                <span className="text-gray-300">Secteurs:</span>
                                <span className="text-white font-medium text-right break-words">
                                  {cleanValue(campaign.sectors)}
                                </span>
                              </div>

                              {/* Régions cibles */}
                              <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                                <span className="text-gray-300">Régions cibles:</span>
                                <div className="text-white font-medium text-left w-full sm:w-auto">
                                  {(() => {
                                    // Parsear los códigos de países desde campaign.regions
                                    let countryCodes: string[] = [];

                                    try {
                                      if (campaign.regions && campaign.regions !== '' && campaign.regions !== 'null') {
                                        if (typeof campaign.regions === 'string') {
                                          // El formato en la BD es: '105015875','101282230'
                                          countryCodes = campaign.regions
                                            .replace(/'/g, '') // Remover comillas simples
                                            .split(',') // Dividir por comas
                                            .map((code: string) => code.trim()) // Limpiar espacios
                                            .filter((code: string) => code.length > 0); // Filtrar códigos vacíos
                                        } else if (Array.isArray(campaign.regions)) {
                                          countryCodes = campaign.regions.map((code: any) => String(code).trim()).filter((code: string) => code.length > 0);
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error parsing regions:', error);
                                      countryCodes = []; // En caso de error, usar array vacío
                                    }

                                    return <RegionDisplay countryCodes={countryCodes} defaultText="Toutes les régions" />;
                                  })()}
                                </div>
                              </div>

                              {/* Date de création */}
                              <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                                <span className="text-gray-300">Date de création:</span>
                                <span className="text-white text-xs text-right">
                                  {formatDate(campaign.created_at)}
                                </span>
                              </div>

                                                            {/* Audience cible */}
                              <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                                <span className="text-gray-300">Audience cible:</span>
                                <div className="text-white font-medium text-left w-full sm:w-auto">
                                  <AudienceTarget campaignId={campaign.campaign_id} campaign={campaign} />
                                </div>
                              </div>
                            </div>
                          </Accordion>
                        </div>

                        {/* Status y acciones */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Badge eliminado */}
                          </div>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                ) : (
                  <AnimatedCard className="text-center py-8 sm:py-12" delay={0.3}>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    </motion.div>
                    <motion.h3
                      className="text-base sm:text-lg font-medium text-gray-300 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Aucune campagne active
                    </motion.h3>
                    <motion.p
                      className="text-sm sm:text-base text-gray-300 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Toutes les campagnes sont terminées ou en attente
                    </motion.p>
                  </AnimatedCard>
                )}
              </div>

              {/* Columna derecha: Campañas completadas */}
              <div className="lg:col-span-1">
                <motion.h2
                  className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Campagnes Terminées ({completedCampaigns.length})
                </motion.h2>

                {completedCampaigns.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {completedCampaigns.map((campaign, index) => (
                      <AnimatedCard
                        key={campaign.campaign_id}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-600/30 p-4 hover:bg-gray-800/60 transition-all duration-200"
                        delay={index * 0.05}
                      >
                        {/* Header con nombre de campaña y fecha */}
                        <div className="mb-4 flex justify-between items-start">
                          <h4 className="text-base font-semibold text-white break-words leading-tight flex-1 mr-4">
                            {cleanValue(campaign.campaign_name)}
                          </h4>
                          <p className="text-sm text-gray-400 flex-shrink-0">
                            {formatDate(campaign.created_at)}
                          </p>
                        </div>

                        {/* Contenido principal - Diseño simple como la imagen */}
                        <Accordion
                          title={
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                {/* Lado izquierdo: Conversion Rate */}
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-500">Conversion Rate</span>
                                  <span className="text-xs text-green-500">
                                    {(() => {
                                      const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                      const messageSenderCount = processStats[campaign.campaign_id]?.find(
                                        stat => stat.process_name === 'MESSAGE SENDER' || stat.process === 'MESSAGE SENDER'
                                      )?.count || 0;
                                      return totalLeads > 0 ? ((messageSenderCount / totalLeads) * 100).toFixed(1) : '0.0';
                                    })()}%
                                  </span>
                                </div>
                                {/* Lado derecho: Total Leads y Chevron */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-white">Total Leads</span>
                                  <span className="text-xs text-white font-bold">
                                    {leadsCounts[campaign.campaign_id] || 0}
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-green-500" />
                                </div>
                              </div>

                              {/* Barra de progreso */}
                              <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden mb-3">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${(() => {
                                      const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                      const messageSenderCount = processStats[campaign.campaign_id]?.find(
                                        stat => stat.process_name === 'MESSAGE SENDER' || stat.process === 'MESSAGE SENDER'
                                      )?.count || 0;
                                      return totalLeads > 0 ? ((messageSenderCount / totalLeads) * 100) : 0;
                                    })()}%`
                                  }}
                                />
                              </div>
                            </div>
                          }
                          id={`completed-campaign-${campaign.campaign_id}`}
                          hideChevron={true}
                        >
                          {/* Contenido expandible: Flujo completado y Eficiencia */}
                          <div className="space-y-2 p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white">Flujo completado</span>
                              <span className="text-xs text-green-500">
                                {(() => {
                                  const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                  const messageSenderCount = processStats[campaign.campaign_id]?.find(
                                    stat => stat.process_name === 'MESSAGE SENDER' || stat.process === 'MESSAGE SENDER'
                                  )?.count || 0;
                                  return `${messageSenderCount} / ${totalLeads}`;
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white">Eficiencia</span>
                              <span className="text-xs text-green-500">
                                {(() => {
                                  const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                                  const messageSenderCount = processStats[campaign.campaign_id]?.find(
                                    stat => stat.process_name === 'MESSAGE SENDER' || stat.process === 'MESSAGE SENDER'
                                  )?.count || 0;
                                  return totalLeads > 0 ? ((messageSenderCount / totalLeads) * 100).toFixed(1) : '0.0';
                                })()}%
                              </span>
                            </div>

                            {/* Distribución por proceso */}
                            {(() => {
                              const totalLeads = leadsCounts[campaign.campaign_id] || 0;
                              const stats = processStats[campaign.campaign_id] || [];

                              // Definir el orden correcto
                              const orderMap: { [key: string]: number; } = {
                                'ENRICHED': 1,
                                'PROFILE VISITOR': 2,
                                'AUTOCONNECT': 3,
                                'MESSAGE SENDER': 4
                              };

                              // Ordenar los stats según el orden definido
                              const sortedStats = stats.sort((a, b) => {
                                const processA = (a.process_name || a.process) as string;
                                const processB = (b.process_name || b.process) as string;
                                const orderA = orderMap[processA] || 999;
                                const orderB = orderMap[processB] || 999;
                                return orderA - orderB;
                              });

                              return sortedStats.map((stat, index) => {
                                const percentage = totalLeads > 0 ? ((stat.count / totalLeads) * 100).toFixed(1) : '0.0';
                                const isMessageSender = stat.process_name === 'MESSAGE SENDER' || stat.process === 'MESSAGE SENDER';

                                return (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-xs text-white">{stat.process_name || stat.process}</span>
                                    <span className={`text-xs ${isMessageSender ? 'text-green-500' : 'text-white'}`}>
                                      {stat.count} ({percentage}%)
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </Accordion>
                      </AnimatedCard>
                    ))}
                  </div>
                ) : (
                  <AnimatedCard className="text-center py-6 sm:py-8" delay={0.3}>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Square className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                    </motion.div>
                    <motion.h3
                      className="text-sm font-medium text-gray-300 mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Aucune campagne terminée
                    </motion.h3>
                    <motion.p
                      className="text-xs text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Les campagnes terminées apparaîtront ici
                    </motion.p>
                  </AnimatedCard>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estado vacío */}
        {!loading && !error && campaigns.length === 0 && (
          <AnimatedCard className="text-center py-12" delay={0.3}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <motion.h3
              className="text-lg font-medium text-gray-300 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {searchTerm ? "Aucune campagne trouvée" : "Aucune campagne"}
            </motion.h3>
            <motion.p
              className="text-gray-300 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Créez votre première campagne pour commencer"}
            </motion.p>
            <motion.button
              onClick={() => setShowModal(true)}
              className="bg-europbots-secondary hover:bg-europbots-secondary/90 text-europbots-primary font-bold py-3 px-6 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Créer une Campagne
            </motion.button>
          </AnimatedCard>
        )}

        {/* Modal de nueva campaña */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-3 sm:p-4 lg:p-6 max-w-7xl w-full max-h-[95vh] flex flex-col mx-2 sm:mx-4"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                {/* Header del modal */}
                <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
                  <motion.h2
                    className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="bg-europbots-secondary/20 p-1.5 sm:p-2 rounded-lg"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-europbots-secondary" />
                    </motion.div>
                    <span className="whitespace-nowrap">Nouvelle Campagne</span>
                  </motion.h2>
                  <motion.button
                    onClick={() => setShowModal(false)}
                    className="p-1.5 sm:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-300" />
                  </motion.button>
                </div>

                {/* Contenido del modal */}
                <motion.div
                  className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Sectores */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <Square className="w-4 h-4 text-europbots-secondary" />
                      <span className="whitespace-nowrap">Secteurs</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Sélectionnez un secteur
                        </label>
                        <select
                          value={selectedSector}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedSector(value);
                            filterRolesBySector(value);
                            setSelectedRoles([]);
                            setOpenAccordionItems([]);
                          }}
                          className="w-full pl-4 pr-4 py-3 bg-white/10 border border-gray-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <option value="" style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}>
                            Sélectionnez un secteur...
                          </option>
                          {sectors.map((sector) => (
                            <option
                              key={sector.code}
                              value={sector.name}
                              style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                            >
                              {sector.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>

                  {/* Rôles */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <User className="w-4 h-4 text-europbots-secondary" />
                      <span className="whitespace-nowrap">
                        Rôles {selectedSector && `(${selectedSector})`}
                      </span>
                    </h3>
                    {selectedSector ? (
                      <div className="space-y-4">
                        {availableRoles.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                            {groupRolesByProfiles(availableRoles).map((profileGroup, index) => (
                              <AccordionItem
                                key={profileGroup.profileName}
                                title={profileGroup.profileName}
                                isOpen={openAccordionItems.includes(index)}
                                onToggle={() => handleAccordionToggle(index)}
                                index={index}
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 w-full">
                                  {profileGroup.roles.map((role) => (
                                    <label
                                      key={role.code}
                                      className="flex items-center gap-1 sm:gap-2 text-white cursor-pointer text-xs sm:text-sm"
                                      title={role.name}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role.name)}
                                        onChange={() => {
                                          if (selectedRoles.includes(role.name)) {
                                            setSelectedRoles(selectedRoles.filter(r => r !== role.name));
                                          } else {
                                            setSelectedRoles([...selectedRoles, role.name]);
                                          }
                                        }}
                                        className="w-3 h-3 sm:w-4 sm:h-4 text-europbots-secondary bg-transparent border-europbots-secondary rounded focus:ring-europbots-secondary focus:ring-1 sm:focus:ring-2"
                                      />
                                      <span className="truncate font-medium">{role.name}</span>
                                    </label>
                                  ))}
                                </div>
                              </AccordionItem>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            Aucun rôle disponible pour ce secteur
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        Sélectionnez d'abord un secteur pour voir les rôles disponibles
                      </div>
                    )}
                  </motion.div>

                  {/* Région Européenne */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <MapPin className="w-4 h-4 text-europbots-secondary" />
                      <span className="whitespace-nowrap">Marché par Région Européenne</span>
                    </h3>
                    {selectedRoles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {countryGroups.map((group, index) => (
                          <AccordionItem
                            key={group.priority}
                            title={group.title}
                            isOpen={openCountryGroups.includes(index)}
                            onToggle={() => handleCountryGroupToggle(index)}
                            index={index}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
                              {group.countries.map((country) => (
                                <label
                                  key={country.code}
                                  className="flex items-center gap-1 sm:gap-2 text-white cursor-pointer text-xs sm:text-sm"
                                  title={country.name}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCountries.includes(country.code)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCountries([...selectedCountries, country.code]);
                                      } else {
                                        setSelectedCountries(selectedCountries.filter(c => c !== country.code));
                                      }
                                    }}
                                    className="w-3 h-3 sm:w-4 sm:h-4 text-europbots-secondary bg-transparent border-europbots-secondary rounded focus:ring-europbots-secondary focus:ring-1 sm:focus:ring-2"
                                  />
                                  <span className="truncate font-medium">{country.name}</span>
                                </label>
                              ))}
                            </div>
                          </AccordionItem>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        <p>Sélectionnez d'abord au moins un rôle pour voir les régions disponibles</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>

                {/* Botones del modal */}
                <motion.div
                  className="flex gap-3 sm:gap-4 mt-6 flex-shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 border border-europbots-secondary/20 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-sm sm:text-base font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    onClick={handleCreateCampaign}
                    className="flex-1 bg-europbots-secondary hover:bg-europbots-secondary/90 text-europbots-primary font-bold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Créer la Campagne
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
