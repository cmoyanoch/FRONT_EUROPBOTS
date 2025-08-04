"use client";

import FuturisticBackground from "@/components/futuristic-background";
import {
  Bell,
  Database,
  Eye,
  EyeOff,
  Globe,
  Key,
  Mail,
  Save,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [searchWebhookUrl, setSearchWebhookUrl] = useState("");
  const [campaignWebhookUrl, setCampaignWebhookUrl] = useState("");
  const [isSavingSearchWebhook, setIsSavingSearchWebhook] = useState(false);
  const [isSavingCampaignWebhook, setIsSavingCampaignWebhook] = useState(false);
  const [isTestingSearchConnection, setIsTestingSearchConnection] =
    useState(false);
  const [isTestingCampaignConnection, setIsTestingCampaignConnection] =
    useState(false);
  const [searchWebhookStatus, setSearchWebhookStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [campaignWebhookStatus, setCampaignWebhookStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);

  const tabs = [
    { id: "profile", name: "Perfil", icon: User },
    { id: "security", name: "Seguridad", icon: Shield },
    { id: "notifications", name: "Notificaciones", icon: Bell },
    { id: "integrations", name: "Integraciones", icon: Zap },
    { id: "api", name: "API", icon: Key },
  ];

  const handleSaveSearchWebhook = async () => {
    if (!searchWebhookUrl.trim()) {
      alert("Por favor, ingresa una URL válida para el webhook de búsqueda");
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
        setTimeout(() => setSearchWebhookStatus("idle"), 3000);
      } else {
        throw new Error("Error al guardar el webhook de búsqueda");
      }
    } catch (error) {
      console.error("Error saving search webhook:", error);
      setSearchWebhookStatus("error");
      setTimeout(() => setSearchWebhookStatus("idle"), 3000);
    } finally {
      setIsSavingSearchWebhook(false);
    }
  };

  const handleSaveCampaignWebhook = async () => {
    if (!campaignWebhookUrl.trim()) {
      alert("Por favor, ingresa una URL válida para el webhook de campaña");
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
        setTimeout(() => setCampaignWebhookStatus("idle"), 3000);
      } else {
        throw new Error("Error al guardar el webhook de campaña");
      }
    } catch (error) {
      console.error("Error saving campaign webhook:", error);
      setCampaignWebhookStatus("error");
      setTimeout(() => setCampaignWebhookStatus("idle"), 3000);
    } finally {
      setIsSavingCampaignWebhook(false);
    }
  };

  const handleTestSearchConnection = async () => {
    if (!searchWebhookUrl.trim()) {
      alert("Por favor, ingresa una URL válida para el webhook de búsqueda");
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
        alert(
          "Conexión exitosa! El webhook de búsqueda está funcionando correctamente."
        );
      } else {
        const errorMessage =
          result.message ||
          "Error al probar la conexión del webhook de búsqueda";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error testing search webhook:", error);
      alert(
        "Error de conexión. Verifica que la URL sea correcta y el servidor esté disponible."
      );
    } finally {
      setIsTestingSearchConnection(false);
    }
  };

  const handleTestCampaignConnection = async () => {
    if (!campaignWebhookUrl.trim()) {
      alert("Por favor, ingresa una URL válida para el webhook de campaña");
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
        alert(
          "Conexión exitosa! El webhook de campaña está funcionando correctamente."
        );
      } else {
        const errorMessage =
          result.message ||
          "Error al probar la conexión del webhook de campaña";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error testing campaign webhook:", error);
      alert(
        "Error de conexión. Verifica que la URL sea correcta y el servidor esté disponible."
      );
    } finally {
      setIsTestingCampaignConnection(false);
    }
  };

  const handleCopySearchWebhookUrl = () => {
    if (searchWebhookUrl.trim()) {
      navigator.clipboard.writeText(searchWebhookUrl.trim());
      alert("URL del webhook de búsqueda copiada al portapapeles");
    } else {
      alert("No hay URL para copiar");
    }
  };

  const handleCopyCampaignWebhookUrl = () => {
    if (campaignWebhookUrl.trim()) {
      navigator.clipboard.writeText(campaignWebhookUrl.trim());
      alert("URL del webhook de campaña copiada al portapapeles");
    } else {
      alert("No hay URL para copiar");
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

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Información Personal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              defaultValue="Juan Pérez"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue="juan.perez@empresa.com"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              defaultValue="+34 600 123 456"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Empresa
            </label>
            <input
              type="text"
              defaultValue="Tech Solutions S.L."
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preferencias</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Idioma</p>
              <p className="text-sm text-gray-300">
                Selecciona el idioma de la interfaz
              </p>
            </div>
            <select className="px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm">
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Zona Horaria</p>
              <p className="text-sm text-gray-300">
                Configura tu zona horaria local
              </p>
            </div>
            <select className="px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm">
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="Europe/London">London (GMT+0)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Cambiar Contraseña
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-3 pr-10 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
          <button className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors">
            Cambiar Contraseña
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Autenticación de Dos Factores
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">2FA</p>
            <p className="text-sm text-gray-300">
              Añade una capa extra de seguridad
            </p>
          </div>
          <button className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors">
            Configurar 2FA
          </button>
        </div>
      </div>
    </div>
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
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Configuración
              </h1>
              <p className="text-gray-300">Gestiona tu cuenta y preferencias</p>
            </div>
            <button className="bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-2 mb-8">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-europbots-secondary text-europbots-primary"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
