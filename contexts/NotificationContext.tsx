"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'popup';
  title?: string;
  message: string;
  duration?: number; // Para notificaciones automáticas
  persistent?: boolean; // Para pop-ups que no se cierran automáticamente
  data?: any; // Datos adicionales específicos del tipo
}

interface NotificationContextType {
  // Gestión de pop-ups (como antes)
  openPopup: (popupId: string) => void;
  closePopup: (popupId: string) => void;
  closeAllPopups: () => void;
  isPopupOpen: (popupId: string) => boolean;
  activePopup: string | null;

  // Gestión de notificaciones
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Gestión de alertas de leads
  leadAlerts: Notification[];
  addLeadAlert: (message: string, count?: number) => void;
  removeLeadAlert: (id: string) => void;
  clearLeadAlerts: () => void;

  // Control de notificaciones de página
  hasShownLeadsNotification: boolean;
  setHasShownLeadsNotification: (value: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leadAlerts, setLeadAlerts] = useState<Notification[]>([]);
  const [hasShownLeadsNotification, setHasShownLeadsNotification] = useState(false);

  // Gestión de pop-ups (mantiene la funcionalidad anterior)
  const openPopup = (popupId: string) => {
    // Cerrar cualquier pop-up abierto antes de abrir uno nuevo
    if (activePopup && activePopup !== popupId) {
      // Closing previous popup before opening new one
      setActivePopup(null); // Cerrar el pop-up anterior
    }
    // Abrir el nuevo pop-up
    setActivePopup(popupId);
  };

  const closePopup = (popupId: string) => {
    if (activePopup === popupId) {
      setActivePopup(null);
    }
  };

  const closeAllPopups = () => {
    setActivePopup(null);
  };

  const isPopupOpen = (popupId: string) => {
    return activePopup === popupId;
  };

  // Gestión de notificaciones generales
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // 5 segundos por defecto
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover notificaciones no persistentes
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Gestión específica de alertas de leads
  const addLeadAlert = (message: string, count?: number) => {
    const id = `lead-alert-${Date.now()}-${Math.random()}`;
    const newAlert: Notification = {
      id,
      type: 'success',
      title: 'Leads chargés',
      message: count ? `${count} leads trouvés` : message,
      persistent: true, // Las alertas de leads son persistentes hasta que el usuario las cierre
      data: { count }
    };

    setLeadAlerts(prev => [...prev, newAlert]);
  };

  const removeLeadAlert = (id: string) => {
    setLeadAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearLeadAlerts = () => {
    setLeadAlerts([]);
  };

  // Cerrar pop-ups al presionar ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activePopup) {
          closeAllPopups();
        } else if (leadAlerts.length > 0) {
          clearLeadAlerts();
        } else if (notifications.length > 0) {
          clearAllNotifications();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePopup, leadAlerts.length, notifications.length]);

  // Cerrar pop-ups al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activePopup) {
        const target = event.target as Element;
        const isInsidePopup = target.closest('[data-popup]');

        if (!isInsidePopup) {
          closeAllPopups();
        }
      }
    };

    if (activePopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activePopup]);

  return (
    <NotificationContext.Provider
      value={{
        // Pop-ups
        openPopup,
        closePopup,
        closeAllPopups,
        isPopupOpen,
        activePopup,

        // Notificaciones
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,

        // Alertas de leads
        leadAlerts,
        addLeadAlert,
        removeLeadAlert,
        clearLeadAlerts,

        // Control de notificaciones de página
        hasShownLeadsNotification,
        setHasShownLeadsNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
