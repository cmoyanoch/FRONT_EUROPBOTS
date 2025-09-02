"use client";

import { PhantombusterAlerts } from './phantombuster-alerts';

export function SystemAlerts() {
  return (
    <div className="flex items-center space-x-2">
      {/* Componente de Phantombuster */}
      <PhantombusterAlerts />

      {/* Componente de Axonaut - OCULTO TEMPORALMENTE */}
      {/* <AxonautAlerts /> */}
    </div>
  );
}
