// src/pages/admin/grooming/components/FiltroEstadoFichas.tsx
import { CheckCircleIcon, XCircleIcon, CircleStackIcon } from '@heroicons/react/24/outline';

interface FiltroEstadoFichasProps {
  estadoSeleccionado: string;
  onEstadoChange: (estado: string) => void;
  isLoading?: boolean;
}

const ESTADOS = [
  { value: 'todas', label: 'Todas', icon: CircleStackIcon, color: 'text-gray-500' },
  { value: 'abierta', label: 'Abiertas', icon: CheckCircleIcon, color: 'text-green-600' },
  { value: 'cerrada', label: 'Cerradas', icon: XCircleIcon, color: 'text-red-600' },
];

export const FiltroEstadoFichas = ({ estadoSeleccionado, onEstadoChange, isLoading }: FiltroEstadoFichasProps) => {
  return (
    <div className="flex gap-2">
      {ESTADOS.map((estado) => {
        const IconComponent = estado.icon;
        return (
          <button
            key={estado.value}
            onClick={() => onEstadoChange(estado.value)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              estadoSeleccionado === estado.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <IconComponent className={`h-4 w-4 ${estadoSeleccionado === estado.value ? 'text-white' : estado.color}`} />
            {estado.label}
          </button>
        );
      })}
    </div>
  );
};