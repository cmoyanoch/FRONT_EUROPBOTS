import { useEffect, useState } from 'react';

interface AxonautConnectionStatus {
  isConnected: boolean;
  lastCheck: string;
  responseTime: number;
  apiKeyConfigured: boolean;
  errorMessage?: string;
  errorCode?: string;
  status: 'online' | 'offline' | 'error' | 'timeout';
}

export function useAxonautStatus() {
  const [status, setStatus] = useState<AxonautConnectionStatus>({
    isConnected: false,
    lastCheck: new Date().toISOString(),
    responseTime: 0,
    apiKeyConfigured: false,
    status: 'offline'
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAxonautStatus = async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();

      // Usar el endpoint local de la API de Phantombuster
      const baseUrl = process.env.NEXT_PUBLIC_PHANTOMBUSTER_API_URL || 'http://localhost:3001';
      const apiKey = process.env.NEXT_PUBLIC_PHANTOMBUSTER_API_KEY || 'dev-api-key-12345';

      const response = await fetch(`${baseUrl}/api/axonaut/test-connection`, {
        headers: {
          'X-API-Key': apiKey
        },
        signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStatus({
            isConnected: true,
            lastCheck: new Date().toISOString(),
            responseTime,
            apiKeyConfigured: data.data.api_key === 'configured',
            status: 'online'
          });
        } else {
          setStatus({
            isConnected: false,
            lastCheck: new Date().toISOString(),
            responseTime,
            apiKeyConfigured: data.data.api_key === 'configured',
            errorMessage: data.message,
            status: 'error'
          });
        }
      } else {
        setStatus({
          isConnected: false,
          lastCheck: new Date().toISOString(),
          responseTime,
          apiKeyConfigured: false,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`,
          errorCode: response.status.toString(),
          status: 'error'
        });
      }

    } catch (error) {
      console.error('Error fetching Axonaut status:', error);
      setStatus({
        isConnected: false,
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        apiKeyConfigured: false,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        status: 'offline'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAxonautStatus();

    // Actualizar cada 60 segundos (menos frecuente que Phantombuster)
    const interval = setInterval(fetchAxonautStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const refreshStatus = () => {
    fetchAxonautStatus();
  };

  return {
    status,
    isLoading,
    refreshStatus,
  };
}
