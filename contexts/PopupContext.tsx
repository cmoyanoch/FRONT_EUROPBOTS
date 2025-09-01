"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface PopupContextType {
  openPopup: (popupId: string) => void;
  closePopup: (popupId: string) => void;
  closeAllPopups: () => void;
  isPopupOpen: (popupId: string) => boolean;
  activePopup: string | null;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  const openPopup = (popupId: string) => {
    // Cerrar todos los pop-ups antes de abrir uno nuevo
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

  // Cerrar pop-ups al presionar ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activePopup) {
        closeAllPopups();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePopup]);

  // Cerrar pop-ups al hacer clic fuera (evento global)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activePopup) {
        // Verificar si el clic fue fuera de cualquier pop-up
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
    <PopupContext.Provider
      value={{
        openPopup,
        closePopup,
        closeAllPopups,
        isPopupOpen,
        activePopup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
