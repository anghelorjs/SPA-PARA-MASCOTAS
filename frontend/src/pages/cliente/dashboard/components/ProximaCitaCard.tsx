// src/pages/cliente/dashboard/components/ProximaCitaCard.tsx
import { CalendarIcon, ClockIcon, ScissorsIcon, UserIcon, HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { ProximaCitaCliente } from '../../../../services/types/cliente';

interface ProximaCitaCardProps {
  cita: ProximaCitaCliente;
  onVerDetalle: () => void;
}

export const ProximaCitaCard = ({ cita, onVerDetalle }: ProximaCitaCardProps) => {
  const estadoTexto = cita.estado === 'programada' ? 'Programada' : 'Confirmada';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Próxima Cita</h3>
          <span
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{ backgroundColor: `${cita.estado_color}20`, color: cita.estado_color }}
          >
            {estadoTexto}
          </span>
        </div>

        <div className="space-y-3">
          {/* Fecha y hora */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <CalendarIcon className="h-4 w-4" />
              <span>{cita.fecha}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <ClockIcon className="h-4 w-4" />
              <span>{cita.hora} hs</span>
            </div>
          </div>

          {/* Servicio */}
          <div className="flex items-center gap-2 text-sm">
            <ScissorsIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{cita.servicio}</span>
          </div>

          {/* Groomer */}
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{cita.groomer}</span>
          </div>

          {/* Mascota */}
          <div className="flex items-center gap-2 text-sm">
            <HeartIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{cita.mascota}</span>
          </div>
        </div>

        <button
          onClick={onVerDetalle}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Ver detalle
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};