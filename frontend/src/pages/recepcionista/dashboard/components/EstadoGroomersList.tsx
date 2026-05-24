// src/pages/recepcionista/dashboard/components/EstadoGroomersList.tsx
import { 
  UserIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import type { EstadoGroomer } from '../../../../services/types/recepcionista';

interface EstadoGroomersListProps {
  groomers: EstadoGroomer[];
  isLoading: boolean;
}

const getEstadoConfig = (estado: string) => {
  switch (estado) {
    case 'libre':
      return { 
        label: 'Libre', 
        icon: CheckCircleIcon, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    case 'ocupado':
      return { 
        label: 'Ocupado', 
        icon: ClockIcon, 
        color: 'text-red-600', 
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    case 'con_citas':
      return { 
        label: 'Con Citas', 
        icon: CalendarIcon, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    case 'ausente':
      return { 
        label: 'Ausente', 
        icon: XCircleIcon, 
        color: 'text-gray-500', 
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    default:
      return { 
        label: 'Desconocido', 
        icon: UserIcon, 
        color: 'text-gray-500', 
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
  }
};

export const EstadoGroomersList = ({ groomers, isLoading }: EstadoGroomersListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (groomers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <UserIcon className="h-10 w-10 mx-auto mb-2" />
        <p className="text-sm">No hay groomers registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groomers.map((groomer) => {
        const config = getEstadoConfig(groomer.estado);
        const IconComponent = config.icon;
        
        return (
          <div
            key={groomer.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-full shadow-sm">
                <UserIcon className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{groomer.nombre}</p>
                <p className="text-xs text-gray-500">
                  {groomer.total_citas_hoy} cita{groomer.total_citas_hoy !== 1 ? 's' : ''} hoy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <IconComponent className={`h-4 w-4 ${config.color}`} />
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};