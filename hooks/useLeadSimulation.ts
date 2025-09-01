import { useNotification } from '@/contexts/NotificationContext';
import { useEffect } from 'react';

export function useLeadSimulation() {
  const { addLeadAlert } = useNotification();

  // Simular carga de leads para demostrar las alertas
  useEffect(() => {
    // Simular carga de leads después de 3 segundos
    const timer1 = setTimeout(() => {
      addLeadAlert('6 leads trouvés', 6);
    }, 3000);

    // Simular otra carga después de 6 segundos
    const timer2 = setTimeout(() => {
      addLeadAlert('12 leads trouvés', 12);
    }, 6000);

    // Simular una tercera carga después de 9 segundos
    const timer3 = setTimeout(() => {
      addLeadAlert('8 leads trouvés', 8);
    }, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [addLeadAlert]);

  // Función para simular carga manual de leads
  const simulateLeadLoad = (count: number) => {
    addLeadAlert(`${count} leads trouvés`, count);
  };

  return { simulateLeadLoad };
}
