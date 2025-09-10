import { useEffect, useState } from 'react';

interface SystemError {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'warning' | 'info';
  timestamp: string;
  recommendations?: string[];
  affectedAgents?: string[];
}

interface SystemStatus {
  isOnline: boolean;
  lastCheck: string;
  errors: SystemError[];
  totalErrors: number;
  criticalErrors: number;
  hasActiveErrors: boolean;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    isOnline: false,
    lastCheck: new Date().toISOString(),
    errors: [],
    totalErrors: 0,
    criticalErrors: 0,
    hasActiveErrors: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar estado cached al inicializar
  useEffect(() => {
    const cachedStatus = localStorage.getItem('phantombuster-system-status');
    if (cachedStatus) {
      try {
        const parsed = JSON.parse(cachedStatus);
        // Solo usar cache si es reciente (menos de 2 minutos)
        const cacheAge = Date.now() - new Date(parsed.lastCheck).getTime();
        if (cacheAge < 120000) { // 2 minutos
          setStatus(parsed);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn('Error parsing cached status:', error);
      }
    }
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true);

      // Usar el endpoint local de la web app
      const response = await fetch('/api/system-status', {
        signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('🔍 System Status Data:', data.data);
          setStatus(data.data);
          // Guardar en cache para próxima carga
          localStorage.setItem('phantombuster-system-status', JSON.stringify(data.data));
        } else {
          console.error('❌ System Status Error:', data);
          // Si hay error, establecer estado offline
          setStatus(prev => ({
            ...prev,
            isOnline: false,
            lastCheck: new Date().toISOString(),
            hasActiveErrors: true,
          }));
        }
      } else {
        console.error('❌ System Status Response not ok:', response.status);
        // Si la respuesta no es ok, establecer estado offline
        setStatus(prev => ({
          ...prev,
          isOnline: false,
          lastCheck: new Date().toISOString(),
          hasActiveErrors: true,
        }));
      }

    } catch (error) {
      console.error('Error fetching system status:', error);
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastCheck: new Date().toISOString(),
        hasActiveErrors: true,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchSystemStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshStatus = () => {
    fetchSystemStatus();
  };

  return {
    status,
    isLoading,
    refreshStatus,
  };
}
