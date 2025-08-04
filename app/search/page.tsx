"use client";

import FuturisticBackground from "@/components/futuristic-background";
import {
  Briefcase,
  Building,
  CheckCircle,
  Filter,
  Globe,
  MapPin,
  Rocket,
  Search,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface FilterItem {
  name: string;
  code: string;
  description: string | null;
  order_index: number;
}

interface Filters {
  sectors: FilterItem[];
  roles: FilterItem[];
  countries: FilterItem[];
  companySizes: FilterItem[];
}

export default function SearchPage() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok) {
          router.push("/login");
        } else {
          setUser(data.user);
          // Usuario obtenido exitosamente
        }
      } catch (error) {
        router.push("/login");
      }
    };

    const getFilters = async () => {
      try {
        const response = await fetch("/api/search/filters");
        const data = await response.json();

        if (response.ok) {
          setFilters(data);
        } else {
          console.error("Error obteniendo filtros:", data.error);
        }
      } catch (error) {
        console.error("Error obteniendo filtros:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    getUser();
    getFilters();
  }, [router]);

  const handleSectorChange = (sectorCode: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorCode)
        ? prev.filter((s) => s !== sectorCode)
        : [...prev, sectorCode]
    );
  };

  const handleRoleChange = (roleCode: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleCode)
        ? prev.filter((r) => r !== roleCode)
        : [...prev, roleCode]
    );
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryCode)
        ? prev.filter((c) => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleSizeChange = (sizeCode: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeCode)
        ? prev.filter((s) => s !== sizeCode)
        : [...prev, sizeCode]
    );
  };

  const handleSearch = async () => {
    if (
      !selectedSectors.length &&
      !selectedRoles.length &&
      !selectedCountries.length &&
      !selectedSizes.length
    ) {
      setError("Veuillez sélectionner au moins un critère de recherche");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const requestBody = {
        sectors: selectedSectors,
        roles: selectedRoles,
        countries: selectedCountries,
        companySizes: selectedSizes,
        userId: user?.id || "",
        userEmail: user?.email || "",
      };

      // Enviando datos de búsqueda

      const response = await fetch("/api/search/phantombuster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResult(data);
      } else {
        setError(data.error || "Erreur lors de la recherche");
      }
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSelectedSectors([]);
    setSelectedRoles([]);
    setSelectedCountries([]);
    setSelectedSizes([]);
    setSearchResult(null);
    setError(null);
  };

  const hasActiveFilters =
    selectedSectors.length > 0 ||
    selectedRoles.length > 0 ||
    selectedCountries.length > 0 ||
    selectedSizes.length > 0;

  return (
    <div className="relative">
      <FuturisticBackground />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Recherche Avancée
          </h1>
          <p className="text-gray-300">
            Trouvez des prospects qualifiés avec nos filtres intelligents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-europbots-secondary" />
                  <span>Filtres</span>
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-europbots-secondary hover:text-europbots-secondary/80 transition-colors"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {isLoadingFilters ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-europbots-secondary mx-auto"></div>
                  <p className="text-gray-300 mt-2">
                    Chargement des filtres...
                  </p>
                </div>
              ) : filters ? (
                <div className="space-y-6">
                  {/* Secteurs */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Building className="w-4 h-4 text-europbots-secondary" />
                      <label className="text-sm font-medium text-white">
                        Secteurs
                      </label>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filters.sectors.map((sector) => (
                        <div
                          key={sector.code}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={sector.code}
                            checked={selectedSectors.includes(sector.code)}
                            onChange={() => handleSectorChange(sector.code)}
                            className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
                          />
                          <label
                            htmlFor={sector.code}
                            className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                          >
                            {sector.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rôles */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Briefcase className="w-4 h-4 text-europbots-secondary" />
                      <label className="text-sm font-medium text-white">
                        Rôles
                      </label>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filters.roles.map((role) => (
                        <div
                          key={role.code}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={role.code}
                            checked={selectedRoles.includes(role.code)}
                            onChange={() => handleRoleChange(role.code)}
                            className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
                          />
                          <label
                            htmlFor={role.code}
                            className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                          >
                            {role.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Países */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="w-4 h-4 text-europbots-secondary" />
                      <label className="text-sm font-medium text-white">
                        Région Européenne
                      </label>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filters.countries.map((country) => (
                        <div
                          key={country.code}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={country.code}
                            checked={selectedCountries.includes(country.code)}
                            onChange={() => handleCountryChange(country.code)}
                            className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
                          />
                          <label
                            htmlFor={country.code}
                            className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                          >
                            {country.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tamaño de empresa */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Users className="w-4 h-4 text-europbots-secondary" />
                      <label className="text-sm font-medium text-white">
                        Taille d'Entreprise
                      </label>
                    </div>
                    <div className="space-y-2">
                      {filters.companySizes.map((size) => (
                        <div
                          key={size.code}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={size.code}
                            checked={selectedSizes.includes(size.code)}
                            onChange={() => handleSizeChange(size.code)}
                            className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
                          />
                          <label
                            htmlFor={size.code}
                            className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                          >
                            {size.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-300">
                    Erreur lors du chargement des filtres
                  </p>
                </div>
              )}

              <button
                onClick={handleSearch}
                disabled={isSearching || !hasActiveFilters}
                className="w-full mt-6 bg-europbots-secondary text-europbots-primary font-bold py-3 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-europbots-primary"></div>
                    <span>Recherche en cours...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Lancer la Recherche</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {searchResult ? (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Résultats de la Recherche
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Target className="w-4 h-4" />
                      <span>
                        {searchResult.totalResults || 0} prospects trouvés
                      </span>
                    </div>
                  </div>

                  {searchResult.results && searchResult.results.length > 0 ? (
                    <div className="space-y-4">
                      {searchResult.results.map(
                        (result: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white/5 rounded-lg p-4 border border-europbots-secondary/10"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">
                                  {result.name || "Nom non disponible"}
                                </h4>
                                <p className="text-sm text-gray-300">
                                  {result.title || "Titre non disponible"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {result.company ||
                                    "Entreprise non disponible"}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button className="bg-europbots-secondary text-europbots-primary px-3 py-1 rounded text-sm font-medium hover:bg-europbots-secondary/90 transition-colors">
                                  Connecter
                                </button>
                                <button className="bg-white/10 text-white px-3 py-1 rounded text-sm font-medium hover:bg-white/20 transition-colors">
                                  Voir Profil
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300">
                        Aucun résultat trouvé avec ces critères
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Essayez d'ajuster vos filtres
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-8 text-center">
                <Rocket className="w-16 h-16 text-europbots-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Prêt à Découvrir ?
                </h3>
                <p className="text-gray-300 mb-6">
                  Sélectionnez vos critères de recherche pour trouver des
                  prospects qualifiés
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Filtres intelligents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>Base de données européenne</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Résultats en temps réel</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
