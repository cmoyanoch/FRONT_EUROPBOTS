"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    className: "bg-green-500/20 border-green-500/30 text-green-300",
    iconColor: "text-green-400"
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-500/20 border-red-500/30 text-red-300",
    iconColor: "text-red-400"
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300",
    iconColor: "text-yellow-400"
  },
  info: {
    icon: Info,
    className: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    iconColor: "text-blue-400"
  }
};

export default function ToastNotification({ toast, onRemove }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className={`
            relative w-80 p-4 rounded-xl border backdrop-blur-sm shadow-2xl
            ${config.className}
          `}
        >
          {/* Progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-current rounded-b-xl opacity-30"
          />

          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${config.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold">{toast.title}</h3>
              {toast.message && (
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
              )}
              
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium mt-2 hover:underline focus:outline-none"
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}