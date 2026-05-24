// src/pages/cliente/dashboard/components/NotificacionesRecientes.tsx
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  ArrowRightIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import type { NotificacionReciente } from '../../../../services/types/cliente';

interface NotificacionesRecientesProps {
  notificaciones: NotificacionReciente[];
  totalNoLeidas: number;
  isLoading: boolean;
  onVerTodas: () => void;
  onMarcarLeida?: (id: number) => void;
}

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'confirmacion':
      return { icon: CheckCircleIcon, color: 'text-green-500', bgColor: 'bg-green-50' };
    case 'cancelacion':
      return { icon: ExclamationCircleIcon, color: 'text-red-500', bgColor: 'bg-red-50' };
    case 'reprogramacion':
      return { icon: InformationCircleIcon, color: 'text-blue-500', bgColor: 'bg-blue-50' };
    case 'listo_para_recoger':
      return { icon: BellAlertIcon, color: 'text-purple-500', bgColor: 'bg-purple-50' };
    default:
      return { icon: BellIcon, color: 'text-gray-500', bgColor: 'bg-gray-50' };
  }
};

export const NotificacionesRecientes = ({ 
  notificaciones, 
  totalNoLeidas, 
  isLoading, 
  onVerTodas,
  onMarcarLeida 
}: NotificacionesRecientesProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (notificaciones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BellIcon className="h-10 w-10 mx-auto mb-2" />
        <p className="text-sm">No tienes notificaciones nuevas</p>
        <p className="text-xs mt-1">Las notificaciones aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-800">Notificaciones Recientes</h3>
          {totalNoLeidas > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
              {totalNoLeidas}
            </span>
          )}
        </div>
        <button
          onClick={onVerTodas}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Ver todas
          <ArrowRightIcon className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-2">
        {notificaciones.map((notificacion) => {
          const { icon: IconComponent, color, bgColor } = getTipoIcon(notificacion.tipo);
          
          return (
            <div
              key={notificacion.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${bgColor} border border-gray-100 hover:shadow-sm transition-shadow`}
            >
              <div className="flex-shrink-0">
                <IconComponent className={`h-5 w-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{notificacion.mensaje_resumido}</p>
                <p className="text-xs text-gray-400 mt-1">{notificacion.fecha}</p>
              </div>
              {!notificacion.leida && onMarcarLeida && (
                <button
                  onClick={() => onMarcarLeida(notificacion.id)}
                  className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar leída
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};