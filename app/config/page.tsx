"use client";

import FuturisticBackground from "@/components/futuristic-background";
import AnimatedCard from "@/components/ui/animated-card";
import { useToast } from "@/components/ui/toast-provider";
import { AnimatePresence, motion } from "framer-motion";
import {
    Beaker,
    Bell,
    CheckCircle,
    Database,
    Eye,
    EyeOff,
    Globe,
    Key,
    Mail,
    Plus,
    Save,
    Shield,
    Trash2,
    User,
    XCircle,
    Zap
} from "lucide-react";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  service_name: string;
  service_display_name: string;
  service_description: string;
  service_category: string;
  config_data: any;
  is_active: boolean;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiKey {
  id: string;
  service_name: string;
  key_name: string;
  key_value: string;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [searchWebhookUrl, setSearchWebhookUrl] = useState("");
  const [campaignWebhookUrl, setCampaignWebhookUrl] = useState("");
  const [isSavingSearchWebhook, setIsSavingSearchWebhook] = useState(false);
  const [isSavingCampaignWebhook, setIsSavingCampaignWebhook] = useState(false);
  const [isTestingSearchConnection, setIsTestingSearchConnection] = useState(false);
  const [isTestingCampaignConnection, setIsTestingCampaignConnection] = useState(false);
  const [searchWebhookStatus, setSearchWebhookStatus] = useState<"idle" | "success" | "error">("idle");
  const [campaignWebhookStatus, setCampaignWebhookStatus] = useState<"idle" | "success" | "error">("idle");
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);

  // Estados para API Keys
  const [services, setServices] = useState<Service[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(true);
  const [showApiKeyInputs, setShowApiKeyInputs] = useState<{[key: string]: boolean}>({});
  const [newApiKeys, setNewApiKeys] = useState<{[key: string]: string}>({});
  const [isSavingApiKey, setIsSavingApiKey] = useState<string | null>(null);
  const [isTestingService, setIsTestingService] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{[key: string]: {success: boolean, message: string}}>({});

  // Estados para agentes de Phantombuster
  const [phantombusterAgents, setPhantombusterAgents] = useState<any>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [showAgentsSection, setShowAgentsSection] = useState(false);

  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const tabs = [
    { id: "profile", name: "Perfil", icon: User },
    { id: "security", name: "Seguridad", icon: Shield },
    { id: "notifications", name: "Notificaciones", icon: Bell },
    { id: "integrations", name: "Integraciones", icon: Zap },
    { id: "api", name: "API", icon: Key },
  ];

  const handleSaveSearchWebhook = async () => {
    if (!searchWebhookUrl.trim()) {
      showError("URL requerida", "Por favor, ingresa una URL válida para el webhook de búsqueda");
      return;
    }

    setIsSavingSearchWebhook(true);
    try {
      const response = await fetch("/api/config/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl: searchWebhookUrl.trim(),
          type: "search",
        }),
      });

      if (response.ok) {
        setSearchWebhookStatus("success");
        showSuccess("Webhook guardado", "El webhook de búsqueda se ha guardado exitosamente");
        setTimeout(() => setSearchWebhookStatus("idle"), 3000);
      } else {
        throw new Error("Error al guardar el webhook de búsqueda");
      }
    } catch (error) {
      console.error("Error saving search webhook:", error);
      setSearchWebhookStatus("error");
      showError("Error al guardar", "Error al guardar el webhook de búsqueda");
      setTimeout(() => setSearchWebhookStatus("idle"), 3000);
    } finally {
      setIsSavingSearchWebhook(false);
    }
  };

  const handleSaveCampaignWebhook = async () => {
    if (!campaignWebhookUrl.trim()) {
      showError("URL requerida", "Por favor, ingresa una URL válida para el webhook de campaña");
      return;
    }

    setIsSavingCampaignWebhook(true);
    try {
      const response = await fetch("/api/config/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl: campaignWebhookUrl.trim(),
          type: "campaign",
        }),
      });

      if (response.ok) {
        setCampaignWebhookStatus("success");
        showSuccess("Webhook guardado", "El webhook de campaña se ha guardado exitosamente");
        setTimeout(() => setCampaignWebhookStatus("idle"), 3000);
      } else {
        throw new Error("Error al guardar el webhook de campaña");
      }
    } catch (error) {
      console.error("Error saving campaign webhook:", error);
      setCampaignWebhookStatus("error");
      showError("Error al guardar", "Error al guardar el webhook de campaña");
      setTimeout(() => setCampaignWebhookStatus("idle"), 3000);
    } finally {
      setIsSavingCampaignWebhook(false);
    }
  };

  const handleTestSearchConnection = async () => {
    if (!searchWebhookUrl.trim()) {
      showError("URL requerida", "Por favor, ingresa una URL válida para el webhook de búsqueda");
      return;
    }

    setIsTestingSearchConnection(true);
    try {
      const response = await fetch("/api/config/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhookUrl: searchWebhookUrl.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess(
          "Conexión exitosa!",
          "El webhook de búsqueda está funcionando correctamente."
        );
      } else {
        const errorMessage =
          result.message ||
          "Error al probar la conexión del webhook de búsqueda";
        showError("Error de conexión", errorMessage);
      }
    } catch (error) {
      console.error("Error testing search webhook:", error);
      showError(
        "Error de conexión",
        "Verifica que la URL sea correcta y el servidor esté disponible."
      );
    } finally {
      setIsTestingSearchConnection(false);
    }
  };

  const handleTestCampaignConnection = async () => {
    if (!campaignWebhookUrl.trim()) {
      showError("URL requerida", "Por favor, ingresa una URL válida para el webhook de campaña");
      return;
    }

    setIsTestingCampaignConnection(true);
    try {
      const response = await fetch("/api/config/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhookUrl: campaignWebhookUrl.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess(
          "Conexión exitosa!",
          "El webhook de campaña está funcionando correctamente."
        );
      } else {
        const errorMessage =
          result.message ||
          "Error al probar la conexión del webhook de campaña";
        showError("Error de conexión", errorMessage);
      }
    } catch (error) {
      console.error("Error testing campaign webhook:", error);
      showError(
        "Error de conexión",
        "Verifica que la URL sea correcta y el servidor esté disponible."
      );
    } finally {
      setIsTestingCampaignConnection(false);
    }
  };

  const handleCopySearchWebhookUrl = () => {
    if (searchWebhookUrl.trim()) {
      navigator.clipboard.writeText(searchWebhookUrl.trim());
      showInfo("URL copiada", "URL del webhook de búsqueda copiada al portapapeles");
    } else {
      showWarning("Sin URL", "No hay URL para copiar");
    }
  };

  const handleCopyCampaignWebhookUrl = () => {
    if (campaignWebhookUrl.trim()) {
      navigator.clipboard.writeText(campaignWebhookUrl.trim());
      showInfo("URL copiada", "URL del webhook de campaña copiada al portapapeles");
    } else {
      showWarning("Sin URL", "No hay URL para copiar");
    }
  };

  // Cargar las URLs de los webhooks guardadas al montar el componente
  useEffect(() => {
    const loadWebhookConfig = async () => {
      try {
        // Cargando configuración de los webhooks

        // Cargar webhook de búsqueda
        const searchResponse = await fetch("/api/config/webhook?type=search");
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.success && searchData.webhookUrl) {
            // Estableciendo URL del webhook de búsqueda
            setSearchWebhookUrl(searchData.webhookUrl);
          }
        }

        // Cargar webhook de campaña
        const campaignResponse = await fetch(
          "/api/config/webhook?type=campaign"
        );
        if (campaignResponse.ok) {
          const campaignData = await campaignResponse.json();
          if (campaignData.success && campaignData.webhookUrl) {
            // Estableciendo URL del webhook de campaña
            setCampaignWebhookUrl(campaignData.webhookUrl);
          }
        }
      } catch (error) {
        console.error("Error loading webhook config:", error);
      } finally {
        setIsLoadingWebhooks(false);
      }
    };

    loadWebhookConfig();
  }, []);

  // Cargar servicios y API keys
  useEffect(() => {
    const loadServicesAndApiKeys = async () => {
      try {
        // Cargar servicios
        const servicesResponse = await fetch("/api/config/services");
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          if (servicesData.success) {
            setServices(servicesData.services);
          }
        }

        // Cargar API keys
        const apiKeysResponse = await fetch("/api/config/api-keys");
        if (apiKeysResponse.ok) {
          const apiKeysData = await apiKeysResponse.json();
          if (apiKeysData.success) {
            setApiKeys(apiKeysData.api_keys);
          }
        }
      } catch (error) {
        console.error("Error loading services and API keys:", error);
      } finally {
        setIsLoadingServices(false);
        setIsLoadingApiKeys(false);
      }
    };

    loadServicesAndApiKeys();
  }, []);

  // Función para guardar API key
  const handleSaveApiKey = async (serviceName: string) => {
    const apiKeyValue = newApiKeys[serviceName];
    if (!apiKeyValue?.trim()) {
      showError("API Key requerida", "Por favor, ingresa una API key válida");
      return;
    }

    setIsSavingApiKey(serviceName);
    try {
      const response = await fetch("/api/config/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_name: serviceName,
          key_name: `${serviceName}_api_key`,
          key_value: apiKeyValue.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showSuccess("API Key guardada", `API key de ${serviceName} guardada exitosamente`);
          setShowApiKeyInputs(prev => ({ ...prev, [serviceName]: false }));
          setNewApiKeys(prev => ({ ...prev, [serviceName]: "" }));

          // Recargar API keys
          const apiKeysResponse = await fetch("/api/config/api-keys");
          if (apiKeysResponse.ok) {
            const apiKeysData = await apiKeysResponse.json();
            if (apiKeysData.success) {
              setApiKeys(apiKeysData.api_keys);
            }
          }
        } else {
          throw new Error(result.message || "Error al guardar la API key");
        }
      } else {
        throw new Error("Error al guardar la API key");
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      showError("Error al guardar", "Error al guardar la API key");
    } finally {
      setIsSavingApiKey(null);
    }
  };

  // Función para probar servicio
  const handleTestService = async (serviceName: string) => {
    setIsTestingService(serviceName);
    try {
      const response = await fetch("/api/config/test-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ service_name: serviceName }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTestResults(prev => ({
          ...prev,
          [serviceName]: { success: true, message: "Conexión exitosa" }
        }));
        showSuccess("Conexión exitosa", `Servicio ${serviceName} conectado correctamente`);
      } else {
        setTestResults(prev => ({
          ...prev,
          [serviceName]: { success: false, message: result.message || "Error de conexión" }
        }));
        showError("Error de conexión", result.message || "Error al conectar con el servicio");
      }
    } catch (error) {
      console.error("Error testing service:", error);
      setTestResults(prev => ({
        ...prev,
        [serviceName]: { success: false, message: "Error de conexión" }
      }));
      showError("Error de conexión", "Error al conectar con el servicio");
    } finally {
      setIsTestingService(null);
    }
  };

  // Función para eliminar API key
  const handleDeleteApiKey = async (apiKeyId: string, serviceName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la API key de ${serviceName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/config/api-keys`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: apiKeyId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showSuccess("API Key eliminada", `API key de ${serviceName} eliminada exitosamente`);
          setApiKeys(prev => prev.filter(key => key.id !== apiKeyId));
        } else {
          throw new Error(result.message || "Error al eliminar la API key");
        }
      } else {
        throw new Error("Error al eliminar la API key");
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      showError("Error al eliminar", "Error al eliminar la API key");
    }
  };

  // Función para obtener agentes de Phantombuster
  const handleFetchPhantombusterAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const response = await fetch("/api/config/phantombuster-agents");
      const result = await response.json();

      if (response.ok && result.success) {
        setPhantombusterAgents(result.data);
        setShowAgentsSection(true);
        showSuccess(
          "Agentes obtenidos",
          `Se encontraron ${result.data.agents?.length || 0} agentes en Phantombuster`
        );
      } else {
        throw new Error(result.message || "Error al obtener agentes");
      }
    } catch (error) {
      console.error("Error fetching Phantombuster agents:", error);
      showError("Error al obtener agentes", error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const renderProfileTab = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.1}>
        <motion.h3
          className="text-lg font-semibold text-white mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Información Personal
        </motion.h3>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre Completo
            </label>
            <motion.input
              type="text"
              defaultValue="Juan Pérez"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <motion.input
              type="email"
              defaultValue="juan.perez@empresa.com"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Teléfono
            </label>
            <motion.input
              type="tel"
              defaultValue="+34 600 123 456"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Empresa
            </label>
            <motion.input
              type="text"
              defaultValue="Tech Solutions S.L."
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
        </motion.div>
      </AnimatedCard>

      <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.4}>
        <motion.h3
          className="text-lg font-semibold text-white mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Preferencias
        </motion.h3>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, staggerChildren: 0.1 }}
        >
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div>
              <p className="text-white font-medium">Idioma</p>
              <p className="text-sm text-gray-300">
                Selecciona el idioma de la interfaz
              </p>
            </div>
            <motion.select
              className="px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </motion.select>
          </motion.div>
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <p className="text-white font-medium">Zona Horaria</p>
              <p className="text-sm text-gray-300">
                Configura tu zona horaria local
              </p>
            </div>
            <motion.select
              className="px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="Europe/London">London (GMT+0)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </motion.select>
          </motion.div>
        </motion.div>
      </AnimatedCard>
    </motion.div>
  );

  const renderSecurityTab = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.1}>
        <motion.h3
          className="text-lg font-semibold text-white mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Cambiar Contraseña
        </motion.h3>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <motion.input
                type={showPassword ? "text" : "password"}
                className="w-full pl-3 pr-10 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="••••••••"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {showPassword ? (
                    <motion.div
                      key="eyeoff"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="eye"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <motion.input
              type="password"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
              placeholder="••••••••"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <motion.input
              type="password"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
              placeholder="••••••••"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          <motion.button
            className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Cambiar Contraseña
          </motion.button>
        </motion.div>
      </AnimatedCard>

      <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.4}>
        <motion.h3
          className="text-lg font-semibold text-white mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Autenticación de Dos Factores
        </motion.h3>
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div>
            <p className="text-white font-medium">2FA</p>
            <p className="text-sm text-gray-300">
              Añade una capa extra de seguridad
            </p>
          </div>
          <motion.button
            className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Configurar 2FA
          </motion.button>
        </motion.div>
      </AnimatedCard>
    </motion.div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Notificaciones por Email
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Nuevos Leads</p>
              <p className="text-sm text-gray-300">
                Recibe notificaciones cuando se generen nuevos leads
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Conversiones</p>
              <p className="text-sm text-gray-300">
                Notificaciones de conversiones exitosas
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                Errores de Automatización
              </p>
              <p className="text-sm text-gray-300">
                Alertas cuando las automatizaciones fallen
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Reportes Semanales</p>
              <p className="text-sm text-gray-300">
                Resumen semanal de actividad
              </p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Notificaciones Push
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                Notificaciones en Tiempo Real
              </p>
              <p className="text-sm text-gray-300">
                Recibe alertas instantáneas en el navegador
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Integraciones Conectadas
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">LinkedIn</p>
                <p className="text-sm text-gray-300">
                  Conectado • Última sincronización: Hace 2 horas
                </p>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-sm font-medium">
              Desconectar
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Gmail</p>
                <p className="text-sm text-gray-300">
                  Conectado • Última sincronización: Hace 1 día
                </p>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-sm font-medium">
              Desconectar
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">CRM HubSpot</p>
                <p className="text-sm text-gray-300">No conectado</p>
              </div>
            </div>
            <button className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors text-sm">
              Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-6">
      {/* API Keys por Servicio */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Keys por Servicio</h3>

        {isLoadingServices ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-europbots-secondary"></div>
            <span className="ml-3 text-gray-300">Cargando servicios...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {services
              .filter(service => service.service_category === 'external_service')
              .map((service) => {
                const serviceApiKey = apiKeys.find(key => key.service_name === service.service_name);
                const hasApiKey = !!serviceApiKey;
                const isShowingInput = showApiKeyInputs[service.service_name];
                const testResult = testResults[service.service_name];

                return (
                  <motion.div
                    key={service.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{service.service_display_name}</h4>
                        <p className="text-sm text-gray-300">{service.service_description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasApiKey && (
                          <motion.button
                            onClick={() => handleTestService(service.service_name)}
                            disabled={isTestingService === service.service_name}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isTestingService === service.service_name ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-300"></div>
                                                         ) : (
                               <Beaker className="w-3 h-3" />
                             )}
                            <span className="text-xs">
                              {isTestingService === service.service_name ? "Probando..." : "Probar"}
                            </span>
                          </motion.button>
                        )}

                        {!hasApiKey && (
                          <motion.button
                            onClick={() => setShowApiKeyInputs(prev => ({ ...prev, [service.service_name]: true }))}
                            className="flex items-center space-x-1 px-3 py-1 bg-europbots-secondary text-europbots-primary rounded-lg hover:bg-europbots-secondary/90 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus className="w-3 h-3" />
                            <span className="text-xs">Agregar API Key</span>
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Estado de la API Key */}
                    {hasApiKey && (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-300">API Key configurada</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            Creada: {new Date(serviceApiKey.created_at).toLocaleDateString()}
                          </span>
                          <motion.button
                            onClick={() => handleDeleteApiKey(serviceApiKey.id, service.service_name)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {/* Resultado de prueba */}
                    {testResult && (
                      <div className={`p-3 rounded-lg mb-3 ${
                        testResult.success
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-red-500/10 border border-red-500/20'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {testResult.success ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`text-sm ${
                            testResult.success ? 'text-green-300' : 'text-red-300'
                          }`}>
                            {testResult.message}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Input para nueva API Key */}
                    {isShowingInput && (
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            API Key de {service.service_display_name}
                          </label>
                          <input
                            type="password"
                            placeholder="Ingresa tu API key aquí..."
                            value={newApiKeys[service.service_name] || ""}
                            onChange={(e) => setNewApiKeys(prev => ({
                              ...prev,
                              [service.service_name]: e.target.value
                            }))}
                            className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => handleSaveApiKey(service.service_name)}
                            disabled={isSavingApiKey === service.service_name}
                            className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isSavingApiKey === service.service_name ? "Guardando..." : "Guardar API Key"}
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setShowApiKeyInputs(prev => ({ ...prev, [service.service_name]: false }));
                              setNewApiKeys(prev => ({ ...prev, [service.service_name]: "" }));
                            }}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancelar
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Agentes de Phantombuster */}
      {apiKeys.some(key => key.service_name === 'phantombuster') && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Agentes de Phantombuster</h3>
            <motion.button
              onClick={handleFetchPhantombusterAgents}
              disabled={isLoadingAgents}
              className="flex items-center space-x-2 px-3 py-2 bg-europbots-secondary text-europbots-primary rounded-lg hover:bg-europbots-secondary/90 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoadingAgents ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b border-europbots-primary"></div>
              ) : (
                <Database className="w-4 h-4" />
              )}
              <span className="text-sm">
                {isLoadingAgents ? "Obteniendo..." : "Obtener Agentes"}
              </span>
            </motion.button>
          </div>

          {showAgentsSection && phantombusterAgents && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Información de la organización */}
              {phantombusterAgents.organization && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Organización</h4>
                  <div className="text-sm text-gray-300">
                    <p><strong>Nombre:</strong> {phantombusterAgents.organization.name || 'N/A'}</p>
                    <p><strong>ID:</strong> {phantombusterAgents.organization.id || 'N/A'}</p>
                    <p><strong>Plan:</strong> {phantombusterAgents.organization.plan || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Lista de agentes */}
              {phantombusterAgents.agents && phantombusterAgents.agents.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Agentes ({phantombusterAgents.agents.length})</h4>
                  {phantombusterAgents.agents.map((agent: any, index: number) => (
                    <motion.div
                      key={agent.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-white font-medium">{agent.name || 'Sin nombre'}</h5>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p><strong>ID:</strong> {agent.id || 'N/A'}</p>
                            <p><strong>Tipo:</strong> {agent.type || 'N/A'}</p>
                            <p><strong>Estado:</strong>
                              <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                                agent.status === 'running' ? 'bg-green-500/20 text-green-300' :
                                agent.status === 'stopped' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {agent.status || 'Desconocido'}
                              </span>
                            </p>
                            {agent.lastLaunch && (
                              <p><strong>Último lanzamiento:</strong> {new Date(agent.lastLaunch).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {agent.scriptId ? `Script: ${agent.scriptId}` : 'Sin script'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-300 text-sm">No se encontraron agentes en esta cuenta de Phantombuster.</p>
                </div>
              )}
            </motion.div>
          )}

          {!showAgentsSection && (
            <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
              <p className="text-gray-300 text-sm">
                Haz clic en "Obtener Agentes" para ver los agentes disponibles en tu cuenta de Phantombuster.
              </p>
            </div>
          )}
        </div>
      )}

      {/* API Key Principal (mantener la existente) */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Key Principal</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">API Key Principal</p>
              <button className="text-europbots-secondary hover:text-europbots-secondary/80 text-sm font-medium">
                Regenerar
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="password"
                defaultValue="sk_live_1234567890abcdef"
                className="flex-1 px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                readOnly
              />
              <button className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Webhook del Bot de Búsqueda
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">URL del Webhook</p>
              <button
                onClick={handleTestSearchConnection}
                disabled={isTestingSearchConnection}
                className="text-europbots-secondary hover:text-europbots-secondary/80 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingSearchConnection ? "Probando..." : "Probar Conexión"}
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://tu-bot.com/webhook/search"
                value={searchWebhookUrl}
                onChange={(e) => setSearchWebhookUrl(e.target.value)}
                disabled={isLoadingWebhooks}
                className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveSearchWebhook}
                  disabled={isSavingSearchWebhook || isLoadingWebhooks}
                  className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSavingSearchWebhook ? "Guardando..." : "Guardar Webhook"}
                  </span>
                </button>
                <button
                  onClick={handleCopySearchWebhookUrl}
                  className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Copiar URL
                </button>
              </div>
            </div>
            {searchWebhookStatus === "success" && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-300">
                  ✅ Webhook de búsqueda guardado exitosamente
                </p>
              </div>
            )}
            {searchWebhookStatus === "error" && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-300">
                  ❌ Error al guardar el webhook de búsqueda. Inténtalo de
                  nuevo.
                </p>
              </div>
            )}
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Nota:</strong> Esta URL recibirá notificaciones
                automáticas cuando se complete una búsqueda de leads.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Webhook del Bot de Crear Campaña
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">URL del Webhook</p>
              <button
                onClick={handleTestCampaignConnection}
                disabled={isTestingCampaignConnection}
                className="text-europbots-secondary hover:text-europbots-secondary/80 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingCampaignConnection
                  ? "Probando..."
                  : "Probar Conexión"}
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://tu-bot.com/webhook/campaign"
                value={campaignWebhookUrl}
                onChange={(e) => setCampaignWebhookUrl(e.target.value)}
                disabled={isLoadingWebhooks}
                className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveCampaignWebhook}
                  disabled={isSavingCampaignWebhook || isLoadingWebhooks}
                  className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSavingCampaignWebhook
                      ? "Guardando..."
                      : "Guardar Webhook"}
                  </span>
                </button>
                <button
                  onClick={handleCopyCampaignWebhookUrl}
                  className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Copiar URL
                </button>
              </div>
            </div>
            {campaignWebhookStatus === "success" && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-300">
                  ✅ Webhook de campaña guardado exitosamente
                </p>
              </div>
            )}
            {campaignWebhookStatus === "error" && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-300">
                  ❌ Error al guardar el webhook de campaña. Inténtalo de nuevo.
                </p>
              </div>
            )}
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Nota:</strong> Esta URL recibirá notificaciones
                automáticas cuando se cree una nueva campaña.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Documentación API
        </h3>
        <p className="text-gray-300 mb-4">
          Consulta nuestra documentación completa para integrar EUROPBOTS en tus
          aplicaciones.
        </p>
        <button className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors">
          Ver Documentación
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "security":
        return renderSecurityTab();
      case "notifications":
        return renderNotificationsTab();
      case "integrations":
        return renderIntegrationsTab();
      case "api":
        return renderApiTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Fondo Futurístico */}
      <FuturisticBackground />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <AnimatedCard className="mb-8" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-3xl lg:text-4xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Configuración
              </motion.h1>
              <motion.p
                className="text-gray-300 text-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Gestiona tu cuenta y preferencias
              </motion.p>
            </div>
            <motion.button
              className="bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => showInfo("Configuración guardada", "Todos los cambios han sido guardados exitosamente")}
            >
              <Save className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </motion.button>
          </div>
        </AnimatedCard>

        {/* Tabs */}
        <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-2 mb-8" delay={0.3}>
          <motion.div
            className="flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, staggerChildren: 0.1 }}
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-europbots-secondary text-europbots-primary"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{ rotate: activeTab === tab.id ? 360 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  <span>{tab.name}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatedCard>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
