"use client";

import { useNotification } from '@/contexts/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

export function LeadAlerts() {
  const { leadAlerts, removeLeadAlert, clearLeadAlerts } = useNotification();

  if (leadAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[10001] space-y-2">
      <AnimatePresence>
        {leadAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="bg-green-600 text-white rounded-lg shadow-lg border border-green-500/20 backdrop-blur-sm"
            style={{
              minWidth: '300px',
              maxWidth: '400px'
            }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-200" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">
                    {alert.title || 'Leads chargés'}
                  </h4>
                  <p className="text-sm text-green-100 mt-1">
                    {alert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeLeadAlert(alert.id)}
                className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-green-500/20 transition-colors"
                aria-label="Fermer l'alerte"
              >
                <X className="w-4 h-4 text-green-200 hover:text-white" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Botón para cerrar todas las alertas si hay más de una */}
      {leadAlerts.length > 1 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={clearLeadAlerts}
          className="w-full bg-green-700/80 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-md transition-colors backdrop-blur-sm"
        >
          Fermer toutes les alertes ({leadAlerts.length})
        </motion.button>
      )}
    </div>
  );
}
