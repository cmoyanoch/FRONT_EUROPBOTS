import { useEffect, useState } from 'react';

interface RateLimits {
  profileVisitor: {
    current: number;
    limit: number;
    remaining: number;
    exceeded: boolean;
    percentage: number;
  };
  searchAgent: {
    current: number;
    limit: number;
    remaining: number;
    exceeded: boolean;
    percentage: number;
  };
  autoconnect: {
    current: number;
    limit: number;
    remaining: number;
    exceeded: boolean;
    percentage: number;
  };
  messageSender: {
    current: number;
    limit: number;
    remaining: number;
    exceeded: boolean;
    percentage: number;
  };
}

interface RateLimitsResponse {
  success: boolean;
  data: {
    userId: string;
    date: string;
    agents: RateLimits;
    summary: {
      totalUsed: number;
      totalLimit: number;
      totalRemaining: number;
      anyExceeded: boolean;
    };
  };
}

export function useRateLimits() {
  const [rateLimits, setRateLimits] = useState<RateLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRateLimits = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Usar el endpoint de límites diarios desde la web app
      const response = await fetch('/api/rate-limits', {
        method: 'GET'
      });

      if (response.ok) {
        const data: RateLimitsResponse = await response.json();
        if (data.success) {
          setRateLimits(data.data.agents);
        } else {
          setError('Error obteniendo límites');
        }
      } else {
        setError(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching rate limits:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRateLimits();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchRateLimits, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    rateLimits,
    isLoading,
    error,
    refreshRateLimits: fetchRateLimits,
  };
}