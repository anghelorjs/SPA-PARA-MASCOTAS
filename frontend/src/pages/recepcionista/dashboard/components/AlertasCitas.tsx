// src/pages/recepcionista/dashboard/components/AlertasCitas.tsx
import { BellAlertIcon, ClockIcon, UserIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import type { AlertaCita } from '../../../../services/types/recepcionista';

interface AlertasCitasProps {
  alertas: AlertaCita[];
  isLoading: boolean;
  onCitaClick: (citaId: number) => void;
}

const getUrgencyClass = (minutos: number) => {
  if (minutos <= 10) return 'bg-red-50 border-red-200';
  if (minutos <= 20) return 'bg-orange-50 border-orange-200';
  return 'bg-yellow-50 border-yellow-200';
};

const getUrgencyBadge = (minutos: number) => {
  if (minutos <= 10) return { text: 'URGENTE', color: 'bg-red-500 text-white' };
  if (minutos <= 20) return { text: 'PRÓXIMA', color: 'bg-orange-500 text-white' };
  return { text: `${minutos} min`, color: 'bg-yellow-500 text-white' };
};

export const AlertasCitas = ({ alertas, isLoading, onCitaClick }: AlertasCitasProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (alertas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BellAlertIcon className="h-10 w-10 mx-auto mb-2" />
        <p className="text-sm">No hay citas próximas</p>
        <p className="text-xs mt-1">Las citas próximas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alertas.map((alerta) => {
        const urgencyClass = getUrgencyClass(alerta.minutos_restantes);
        const badge = getUrgencyBadge(alerta.minutos_restantes);
        
        return (
          <button
            key={alerta.id}
            onClick={() => onCitaClick(alerta.id)}
            className={`w-full text-left p-3 rounded-lg border ${urgencyClass} hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{alerta.mascota}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{alerta.hora}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {alerta.groomer}
                  </span>
                  <span className="flex items-center gap-1">
                    <ScissorsIcon className="h-3 w-3" />
                    {alerta.servicio}
                  </span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.text}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};