"use client";

import { Button } from '@/components/ui/button';
import { useNotification } from '@/contexts/NotificationContext';
import { useAxonautStatus } from '@/hooks/useAxonautStatus';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export function AxonautAlerts() {
  const { status, isLoading, refreshStatus } = useAxonautStatus();
  const { openPopup, closePopup, isPopupOpen } = useNotification();
  const popupId = 'axonaut-alerts';
  const isExpanded = isPopupOpen(popupId);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-400">Verificando Axonaut...</span>
      </div>
    );
  }

  const hasErrors = status.status !== 'online';

  const getStatusRingClass = () => {
    switch (status.status) {
      case 'online':
        return 'axonaut-ring-online';
      case 'offline':
        return 'axonaut-ring-offline';
      case 'error':
        return 'axonaut-ring-error';
      case 'timeout':
        return 'axonaut-ring-warning';
      default:
        return 'ring-gray-400 bg-gray-50';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'online':
        return 'Axonaut Connecté';
      case 'offline':
        return 'Axonaut Déconnecté';
      case 'error':
        return 'Erreur de Connexion';
      case 'timeout':
        return 'Timeout de Connexion';
      default:
        return 'État Inconnu';
    }
  };

  const handleTogglePopup = () => {
    if (hasErrors) {
      if (isExpanded) {
        closePopup(popupId);
      } else {
        openPopup(popupId);
      }
    }
  };

  return (
    <div className="relative">
      {/* Botón de estado principal - solo Axonaut */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTogglePopup}
        className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
          hasErrors
            ? 'text-gray-300 hover:text-white hover:bg-gray-500/10 cursor-pointer'
            : 'text-gray-300 cursor-default'
        }`}
      >
        {/* Logo de Axonaut - Círculo dentro de círculo */}
        <div className={`mr-2 axonaut-circle-outer ${getStatusRingClass()}`}>
          <div className="axonaut-circle-inner">
            <img
              src="/axonaut_logo.png"
              alt="Axonaut"
              className="axonaut-logo-image"
            />
          </div>
        </div>

        <span className="hidden xl:inline">
          {getStatusText()}
        </span>
      </Button>

      {/* Panel de alertas expandido - solo se muestra si hay errores */}
      <AnimatePresence>
        {isExpanded && hasErrors && (
          <motion.div
            data-popup="true"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-europbots-primary/95 backdrop-blur-md rounded-xl shadow-lg border border-europbots-secondary/20 z-[10000]"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="axonaut-circle-outer axonaut-ring-online">
                    <div className="axonaut-circle-inner">
                      <img
                        src="/axonaut_logo.png"
                        alt="Axonaut"
                        className="axonaut-logo-image"
                      />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    État d'Axonaut
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshStatus}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => closePopup(popupId)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Estado de conexión */}
              <div className={`p-3 rounded-lg border-l-4 ${
                status.status === 'online'
                  ? 'bg-green-500/10 border-green-500'
                  : status.status === 'error'
                  ? 'bg-orange-500/10 border-orange-500'
                  : status.status === 'timeout'
                  ? 'bg-yellow-500/10 border-yellow-500'
                  : 'bg-red-500/10 border-red-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="axonaut-circle-outer axonaut-ring-online">
                      <div className="axonaut-circle-inner">
                        <img
                          src="/axonaut_logo.png"
                          alt="Axonaut"
                          className="axonaut-logo-image"
                        />
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      status.status === 'online' ? 'text-green-400' :
                      status.status === 'error' ? 'text-orange-400' :
                      status.status === 'timeout' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {getStatusText()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {status.responseTime}ms
                  </span>
                </div>

                {/* Detalles del estado */}
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>API Key:</span>
                    <span className={status.apiKeyConfigured ? 'text-green-400' : 'text-red-400'}>
                      {status.apiKeyConfigured ? 'Configurée' : 'Non configurée'}
                    </span>
                  </div>

                  {status.errorMessage && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                      <p className="text-xs text-red-300 font-medium">Error:</p>
                      <p className="text-xs text-red-200">{status.errorMessage}</p>
                    </div>
                  )}
                </div>

                {/* Recomendaciones */}
                {status.status !== 'online' && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Recommandations:</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {!status.apiKeyConfigured && (
                        <li className="flex items-center space-x-1">
                          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                          <span>Configurer la clé API d'Axonaut</span>
                        </li>
                      )}
                      <li className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span>Vérifier la connectivité réseau</span>
                      </li>
                      <li className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span>Contacter le support d'Axonaut</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Dernière vérification: {new Date(status.lastCheck).toLocaleTimeString()}</span>
                  <span className={status.status === 'online' ? 'text-green-400' : 'text-red-400'}>
                    {status.status === 'online' ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
