"use client";

import FuturisticBackground from "@/components/futuristic-background";
import AnimatedCard from "@/components/ui/animated-card";
import { StatsCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { useNotification } from "@/contexts/NotificationContext";
import { Lead } from "@/lib/database";
import { motion } from "framer-motion";
import {
  Building,
  Mail,
  MapPin,
  Phone,
  Search,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<string>("all");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    qualified: 0,
    contacted: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { hasShownLeadsNotification, setHasShownLeadsNotification } = useNotification();

  // Función para cargar leads desde la API
  const fetchLeads = async (isInitialLoad = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "6",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (selectedProcess && selectedProcess !== "all") {
        params.append("process", selectedProcess);
      }

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.data.leads);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);

        // Solo mostrar notificación en la carga inicial, si hay leads y no se ha mostrado antes
        if (isInitialLoad && data.data.leads.length > 0 && !hasShownLeadsNotification) {
          showSuccess("Leads chargés", `${data.data.leads.length} leads trouvés`);
          setHasShownLeadsNotification(true);
        }
      } else {
        const errorMsg = data.error || "Erreur lors du chargement des leads";
        setError(errorMsg);
        showError("Erreur de chargement", errorMsg);
      }
    } catch (err) {
      const errorMsg = "Erreur de connexion au serveur";
      setError(errorMsg);
      showError("Erreur de connexion", errorMsg);
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el orden por proximidad al estado final (MESSAGE SENDER último)
  const getProcessPriority = (process: string) => {
    switch (process?.toUpperCase()) {
      case "AUTOCONNECT":
        return 1; // Primero - A un paso del final
      case "PROFILE VISITOR":
        return 2; // Segundo - A dos pasos del final
      case "ENRICHED":
        return 3; // Tercero - A tres pasos del final
      case "EXTRACTED":
        return 4; // Cuarto - Más lejos del final
      case "MESSAGE SENDER":
        return 5; // Último - Ya completado
      default:
        return 6; // Muy último
    }
  };

  // Cargar leads al montar el componente y cuando cambien los filtros
  useEffect(() => {
    // Solo es carga inicial si no hay leads cargados aún
    const isInitialLoad = leads.length === 0;
    fetchLeads(isInitialLoad);
  }, [searchTerm, selectedProcess, currentPage]);

  // Ordenar leads por prioridad del estado
  const sortedLeads = [...leads].sort((a, b) => {
    const priorityA = getProcessPriority(a.process || "");
    const priorityB = getProcessPriority(b.process || "");
    return priorityA - priorityB;
  });

  // Función para obtener el color evolutivo del estado (del inicio al final)
  const getProcessColor = (process: string) => {
    switch (process?.toUpperCase()) {
      case "EXTRACTED":
        return "text-red-400 bg-red-500/20 border-red-500/30"; // Inicio - Rojo
      case "ENRICHED":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30"; // Segundo - Naranja
      case "PROFILE VISITOR":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"; // Tercero - Amarillo
      case "AUTOCONNECT":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30"; // Cuarto - Azul
      case "MESSAGE SENDER":
        return "text-green-400 bg-green-500/20 border-green-500/30"; // Final - Verde
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  // Función para obtener el porcentaje de progreso
  const getProcessProgress = (process: string) => {
    switch (process?.toUpperCase()) {
      case "EXTRACTED":
        return 20; // 20%
      case "ENRICHED":
        return 40; // 40%
      case "PROFILE VISITOR":
        return 60; // 60%
      case "AUTOCONNECT":
        return 80; // 80%
      case "MESSAGE SENDER":
        return 100; // 100%
      default:
        return 0;
    }
  };

  // Función para obtener el texto del estado
  const getProcessText = (process: string) => {
    switch (process?.toUpperCase()) {
      case "EXTRACTED":
        return "EXTRACTED";
      case "ENRICHED":
        return "ENRICHED";
      case "PROFILE VISITOR":
        return "PROFILE VISITOR";
      case "AUTOCONNECT":
        return "AUTOCONNECT";
      case "MESSAGE SENDER":
        return "MESSAGE SENDER";
      default:
        return process || "Non défini";
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Fondo Futurístico */}
      <FuturisticBackground />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        {/* Stats Cards - Solo Total Leads */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
              <div className="hidden sm:flex items-center justify-between">
                <div>
                  <motion.h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Gestion des Leads
                  </motion.h1>
                  <motion.p
                    className="text-gray-300 text-sm sm:text-lg"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Administrez et suivez vos leads potentiels
                  </motion.p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-300 p-2">
                    Totaliser les prospects
                  </p>
                  <p className="text-2xl font-bold text-white">
                    <div className="bg-blue-500/20 p-3 rounded-lg flex items-center justify-around "><Users className="w-6 h-6 text-blue-400" /> {stats.total.toLocaleString()}</div>

                  </p>

                </div>
              </div>
              <div className="flex flex-col sm:hidden items-center justify-between">
                <div>
                  <motion.h1
                    className="text-2xl font-bold text-white mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Gestion des Leads
                  </motion.h1>
                </div>
                <div className="flex items-center justify-between">
                  <motion.p
                    className="text-gray-300 text-sm"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Administrez et suivez vos leads potentiels
                  </motion.p>
                  <div className="bg-blue-500/20 px-2 py-1 rounded-lg flex items-center justify-around "><Users className="w-6 h-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white ml-2">{stats.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>

        {/* Search and Filters - Responsive mejorado */}
        <AnimatedCard
          delay={0.2}
          className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-4 sm:p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des leads par nom ou entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
              />
            </div>

            {/* Process Filter */}
            <div className="relative hidden sm:block">
              <select
                value={selectedProcess}
                onChange={(e) => setSelectedProcess(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm appearance-none cursor-pointer"
              >
                <option value="all" className="bg-europbots-primary text-white">Tous les états</option>
                <option value="EXTRACTED" className="bg-europbots-primary text-white">EXTRACTED</option>
                <option value="ENRICHED" className="bg-europbots-primary text-white">ENRICHED</option>
                <option value="PROFILE VISITOR" className="bg-europbots-primary text-white">PROFILE VISITOR</option>
                <option value="AUTOCONNECT" className="bg-europbots-primary text-white">AUTOCONNECT</option>
                <option value="MESSAGE SENDER" className="bg-europbots-primary text-white">MESSAGE SENDER</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Leads Table - Responsive mejorado */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 overflow-hidden">
          {/* Vista mobile - Cards */}
          <div className="block md:hidden">
            <div className="p-4 space-y-4">
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                          <div className="h-3 bg-white/5 rounded animate-pulse w-3/4"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-white/10 rounded-full w-24 animate-pulse"></div>
                        <div className="h-2 bg-white/5 rounded-full w-16 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : sortedLeads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aucun lead trouvé</p>
                </div>
              ) : (
                sortedLeads.map((lead, index) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 space-y-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-europbots-secondary/20 p-2 rounded-lg flex-shrink-0">
                        <Building className="w-5 h-5 text-europbots-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{lead.full_name}</h3>
                        <p className="text-sm text-gray-300 truncate">{lead.job_title || "Sans titre"}</p>
                        <p className="text-sm text-gray-400 truncate">{lead.company || "Sans entreprise"}</p>
                        {lead.email && (
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getProcessColor(
                          lead.process || ""
                        )}`}
                      >
                        {getProcessText(lead.process || "")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${lead.process?.toUpperCase() === 'EXTRACTED' ? 'bg-red-500' :
                              lead.process?.toUpperCase() === 'ENRICHED' ? 'bg-orange-500' :
                                lead.process?.toUpperCase() === 'PROFILE VISITOR' ? 'bg-yellow-500' :
                                  lead.process?.toUpperCase() === 'AUTOCONNECT' ? 'bg-blue-500' :
                                    lead.process?.toUpperCase() === 'MESSAGE SENDER' ? 'bg-green-500' :
                                      'bg-gray-500'
                              }`}
                            style={{
                              width: `${getProcessProgress(lead.process || "")}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {getProcessProgress(lead.process || "")}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-white/5">
                <tr>
                  <th className="w-1/3 px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="w-1/3 px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="w-1/6 px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ÉTAT
                  </th>
                  <th className="w-1/6 px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    PROGRÈS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-europbots-secondary/10">
                {loading ? (
                  <>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))}
                  </>
                ) : sortedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-gray-400">Aucun lead trouvé</p>
                    </td>
                  </tr>
                ) : (
                  sortedLeads.map((lead) => {
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-europbots-secondary/20 p-2 rounded-lg mr-3 flex-shrink-0">
                              <Building className="w-5 h-5 text-europbots-secondary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-white truncate">
                                {lead.full_name}
                              </div>
                              <div className="text-sm text-gray-300 truncate">
                                {lead.job_title || "Sans titre"}
                              </div>
                              <div className="flex items-center text-xs text-gray-400 mt-1 min-h-[16px]">
                                {lead.email ? (
                                  <>
                                    <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{lead.email}</span>
                                  </>
                                ) : (
                                  <div className="h-3"></div>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-400 mt-1 min-h-[16px]">
                                {lead.phone ? (
                                  <>
                                    <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{lead.phone}</span>
                                  </>
                                ) : (
                                  <div className="h-3"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">
                              {lead.company || "Sans entreprise"}
                            </div>
                            {lead.location && (
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{lead.location}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getProcessColor(
                              lead.process || ""
                            )}`}
                          >
                            {getProcessText(lead.process || "")}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-700 rounded-full h-2 flex-1">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${lead.process?.toUpperCase() === 'EXTRACTED' ? 'bg-red-500' :
                                  lead.process?.toUpperCase() === 'ENRICHED' ? 'bg-orange-500' :
                                    lead.process?.toUpperCase() === 'PROFILE VISITOR' ? 'bg-yellow-500' :
                                      lead.process?.toUpperCase() === 'AUTOCONNECT' ? 'bg-blue-500' :
                                        lead.process?.toUpperCase() === 'MESSAGE SENDER' ? 'bg-green-500' :
                                          'bg-gray-500'
                                  }`}
                                style={{
                                  width: `${getProcessProgress(lead.process || "")}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 w-10 text-right">
                              {getProcessProgress(lead.process || "")}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-white">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
