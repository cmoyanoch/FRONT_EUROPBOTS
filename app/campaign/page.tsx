"use client";

import FuturisticBackground from "@/components/futuristic-background";
import {
  Globe,
  Plus,
  Search,
  Square,
  Target,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// Datos de ejemplo para los filtros
const SECTORS = [
  "Technologie",
  "Santé",
  "Finance",
  "Éducation",
  "Commerce",
  "Manufacturing",
  "Consulting",
  "Media",
  "Real Estate",
  "Government",
];
const ROLES = [
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
const REGIONS = [
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
];

export default function CampaignPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);
  const [leadsCounts, setLeadsCounts] = useState<{ [key: string]: number }>({});

  // Cargar campañas desde la base de datos
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
  }, []);

  // Función para cargar los conteos de leads por campaña
  async function loadLeadsCounts(campaignsList: any[]) {
    try {
      // Iniciando carga de conteos de leads
      const counts: { [key: string]: number } = {};

      // Por ahora, usar el endpoint simple que funciona
      const response = await fetch("/api/campaigns/leads-count");
      // Leads count response status

      if (response.ok) {
        const data = await response.json();
        // Leads count data
        // Asignar el mismo conteo a todas las campañas por ahora
        for (const campaign of campaignsList) {
          counts[campaign.campaign_id] = data.leads_count;
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
      const counts: { [key: string]: number } = {};
      for (const campaign of campaignsList) {
        counts[campaign.campaign_id] = 0;
      }
      setLeadsCounts(counts);
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
      // Datos de la campaña a enviar al webhook
      const campaignData = {
        name: `Campaña ${new Date().toLocaleDateString()}`,
        filters: {
          sectors: selectedSectors,
          roles: selectedRoles,
          regions: selectedRegions,
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
        // Aquí podrías mostrar una notificación de éxito
        alert(`Campagne créée avec succès! ID: ${result.campaignId}`);
        setShowModal(false);
        // Recargar la lista de campañas
        window.location.reload();
      } else {
        console.error("Error al crear la campaña:", result.message);
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error en la llamada al webhook:", error);
      alert("Erreur de connexion lors de la création de la campagne");
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
        alert("Campagne désactivée correctement");
      } else {
        console.error("❌ Error al desactivar campaña:", data.message);
        alert(
          `Erreur lors de la désactivation de la campagne: ${data.message}`
        );
      }
    } catch (error) {
      console.error("❌ Error de conexión al desactivar campaña:", error);
      alert("Erreur de connexion lors de la désactivation de la campagne");
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
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function cleanValue(value: string | null | undefined): string {
    if (!value) return "N/A";
    return value.replace(/'/g, "");
  }

  function calculateProgress(campaign: any) {
    if (!campaign.started_at || !campaign.ended_at) return 0;

    const start = new Date(campaign.started_at).getTime();
    const end = new Date(campaign.ended_at).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
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

  return (
    <div className="min-h-screen relative">
      <FuturisticBackground />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestion des Campagnes
              </h1>
              <p className="text-gray-300">
                Administrez et surveillez vos campagnes de marketing automatisé
              </p>
              {campaigns.some((campaign) => campaign.status === "active") && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm">
                    {
                      campaigns.filter(
                        (campaign) => campaign.status === "active"
                      ).length
                    }
                    {campaigns.filter(
                      (campaign) => campaign.status === "active"
                    ).length === 1
                      ? " campagne active"
                      : " campagnes actives"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(true)}
                disabled={campaigns.some(
                  (campaign) => campaign.status === "active"
                )}
                className={`font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 ${
                  campaigns.some((campaign) => campaign.status === "active")
                    ? "bg-white/10 text-gray-300 cursor-not-allowed"
                    : "bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90"
                }`}
                title={
                  campaigns.some((campaign) => campaign.status === "active")
                    ? "Il y a déjà une campagne active. Vous devez mettre en pause ou annuler la campagne actuelle avant d'en créer une nouvelle."
                    : "Créer une nouvelle campagne"
                }
              >
                <Plus className="w-5 h-5" />
                <span>Nouvelle Campagne</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des campagnes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-europbots-secondary mx-auto mb-4"></div>
            <p className="text-gray-300">Chargement des campagnes...</p>
          </div>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-red-300 mb-2">
              Erreur lors du chargement des campagnes
            </h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-europbots-secondary hover:bg-europbots-secondary/90 text-europbots-primary font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && !error && campaigns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 hover:bg-white/15 transition-all duration-200"
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-europbots-secondary/20 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-europbots-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {campaign.campaign_name}
                      </h3>
                      <p className="text-sm text-gray-300">
                        Campagne automatisée LinkedIn
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteCampaign(campaign.campaign_id)}
                      disabled={deletingCampaign === campaign.campaign_id}
                      className={`p-2 rounded-lg transition-colors ${
                        deletingCampaign === campaign.campaign_id
                          ? "text-gray-500 cursor-not-allowed"
                          : "bg-red-500/20 hover:bg-red-500/30"
                      }`}
                      title="Désactiver la campagne"
                    >
                      {deletingCampaign === campaign.campaign_id ? (
                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Detalles de la campaña */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Audience cible:</span>
                    <span className="text-white font-medium">
                      {cleanValue(campaign.roles)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Secteurs:</span>
                    <span className="text-white font-medium">
                      {cleanValue(campaign.sectors)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">ID Campagne:</span>
                    <span className="text-white text-xs font-mono">
                      {campaign.campaign_id}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Progression</span>
                    <span className="text-white font-medium">
                      {calculateProgress(campaign)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-europbots-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(campaign)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">
                      {campaign.duration_days || 0}
                    </p>
                    <p className="text-xs text-gray-300">Jours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">
                      {campaign.status || "pending"}
                    </p>
                    <p className="text-xs text-gray-300">Statut</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">
                      {calculateProgress(campaign)}%
                    </p>
                    <p className="text-xs text-gray-300">Progression</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">
                      {leadsCounts[campaign.campaign_id] || 0}
                    </p>
                    <p className="text-xs text-gray-300">Leads</p>
                  </div>
                </div>

                {/* Status y acciones */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(
                        campaign.status
                      )} ${getStatusColor(campaign.status)}`}
                    >
                      {campaign.status === "cancelled"
                        ? "Annulée"
                        : campaign.status}
                    </div>
                    <span className="text-xs text-gray-300">
                      {formatDate(campaign.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && campaigns.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm ? "Aucune campagne trouvée" : "Aucune campagne"}
            </h3>
            <p className="text-gray-300 mb-6">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Créez votre première campagne pour commencer"}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-europbots-secondary hover:bg-europbots-secondary/90 text-europbots-primary font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Créer une Campagne
            </button>
          </div>
        )}

        {/* Modal de nueva campaña */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-8 max-w-2xl w-full mx-4 mt-16 overflow-y-auto">
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="bg-europbots-secondary/20 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-europbots-secondary" />
                  </div>
                  Nouvelle Campagne
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              {/* Contenido del modal - Filtros */}
              <div className="space-y-6">
                {/* Secteurs */}
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Square className="w-4 h-4 text-europbots-secondary" />
                    Secteurs
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTORS.map((sector) => (
                      <label
                        key={sector}
                        className="flex items-center gap-3 text-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSectors.includes(sector)}
                          onChange={() =>
                            handleToggle(
                              selectedSectors,
                              sector,
                              setSelectedSectors
                            )
                          }
                          className="w-4 h-4 text-europbots-secondary bg-transparent border-europbots-secondary rounded focus:ring-europbots-secondary focus:ring-2"
                        />
                        {sector}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rôles */}
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-europbots-secondary" />
                    Rôles
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map((role) => (
                      <label
                        key={role}
                        className="flex items-center gap-3 text-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() =>
                            handleToggle(selectedRoles, role, setSelectedRoles)
                          }
                          className="w-4 h-4 text-europbots-secondary bg-transparent border-europbots-secondary rounded focus:ring-europbots-secondary focus:ring-2"
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Région Européenne */}
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-europbots-secondary" />
                    Région Européenne
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {REGIONS.map((region) => (
                      <label
                        key={region}
                        className="flex items-center gap-3 text-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRegions.includes(region)}
                          onChange={() =>
                            handleToggle(
                              selectedRegions,
                              region,
                              setSelectedRegions
                            )
                          }
                          className="w-4 h-4 text-europbots-secondary bg-transparent border-europbots-secondary rounded focus:ring-europbots-secondary focus:ring-2"
                        />
                        {region}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones del modal */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-europbots-secondary/20 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateCampaign}
                  className="flex-1 bg-europbots-secondary hover:bg-europbots-secondary/90 text-europbots-primary font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Créer la Campagne
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
