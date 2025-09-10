"use client";

import { Button } from '@/components/ui/button';
import { useNotification } from '@/contexts/NotificationContext';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, RefreshCw, X } from 'lucide-react';

export function PhantombusterAlerts() {
  const { status, isLoading, refreshStatus } = useSystemStatus();
  const { openPopup, closePopup, isPopupOpen } = useNotification();
  const popupId = 'phantombuster-alerts';
  const isExpanded = isPopupOpen(popupId);

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="group relative px-3 py-2 text-sm font-medium text-gray-300 cursor-default transition-all duration-300 overflow-hidden"
      >
        <div className="flex items-center transition-all transform translate-x-12 group-hover:-translate-x-6">
          {/* Skeleton logo - mantiene dimensiones exactas */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded-full animate-pulse transition-all duration-300" />

          {/* Skeleton text - adapta a lógica hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
            <div className="h-4 w-20 bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
      </Button>
    );
  }

  const hasErrors = status.totalErrors > 0;

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
      {/* Botón de estado principal - solo Phantombuster */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTogglePopup}
        className={`group relative px-3 py-2 text-sm font-medium transition-all overflow-hidden ${hasErrors
            ? 'text-gray-300 hover:text-white hover:bg-gray-500/10 cursor-pointer'
            : 'text-gray-300 cursor-default'
          }`}
      >
        <div className="flex items-center transition-all transform translate-x-12 group-hover:-translate-x-6">
          {/* Logo de Phantombuster */}
          <img
            src="https://phantombuster.imgix.net/assets/images/Phantombuster+logo.png?h=256"
            alt="Phantombuster"
            className={`w-5 h-5 sm:w-6 sm:h-6 object-contain transition-all ${status.isOnline
                ? 'phantombuster-logo-online online animate-pulse'
                : status.criticalErrors > 0
                  ? 'duration-300 phantombuster-logo-error'
                  : status.totalErrors > 0
                    ? 'phantombuster-logo-warning animate-[pulse_2.5s_ease-in-out_infinite]'
                    : 'phantombuster-logo-offline opacity-60'
              }`}
          />

          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            {status.isOnline
              ? 'Connecté'
              : status.totalErrors > 0
                ? status.errors.some(error => error.type === 'credits_exhausted')
                  ? 'Crédits Épuisés'
                  : `${status.totalErrors} Erreur${status.totalErrors > 1 ? 's' : ''}`
                : 'Déconnecté'
            }
          </span>
        </div>
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
                  <img
                    src="https://phantombuster.imgix.net/assets/images/Phantombuster+logo.png?h=256"
                    alt="Phantombuster"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-sm font-semibold text-white">
                    État de Phantombuster
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

              {/* Lista de errores */}
              {status.errors.length > 0 ? (
                <div className="space-y-3">
                  {status.errors.map((error, index) => (
                    <motion.div
                      key={error.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border-l-4 ${error.severity === 'critical'
                          ? 'bg-red-500/10 border-red-500'
                          : error.severity === 'high'
                            ? 'bg-orange-500/10 border-orange-500'
                            : error.severity === 'warning'
                              ? 'bg-yellow-500/10 border-yellow-500'
                              : error.severity === 'info'
                                ? 'bg-blue-500/10 border-blue-500'
                                : 'bg-yellow-500/10 border-yellow-500'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src="https://phantombuster.imgix.net/assets/images/Phantombuster+logo.png?h=256"
                              alt="Phantombuster"
                              className="w-4 h-4 object-contain"
                            />
                            <p className="text-sm font-medium text-white">
                              {error.message}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">
                            {new Date(error.timestamp).toLocaleString()}
                          </p>

                          {error.recommendations && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-400 mb-1">Recommandations:</p>
                              <ul className="text-xs text-gray-300 space-y-1">
                                {error.recommendations.slice(0, 2).map((rec, idx) => (
                                  <li key={idx} className="flex items-center space-x-1">
                                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Aucune alerte active</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Dernière vérification: {new Date(status.lastCheck).toLocaleTimeString()}</span>
                  <span>{status.totalErrors} alertes</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
