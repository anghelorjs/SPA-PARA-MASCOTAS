// src/pages/cliente/perfil/components/NotificacionesList.tsx
import { 
  BellIcon, 
  CheckCircleIcon, 
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  ScissorsIcon,
  ClipboardDocumentCheckIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import type { NotificacionData } from '../services/cliente.perfil.service';

interface NotificacionesListProps {
  notificaciones: NotificacionData[];
  onMarcarLeida: (id: number) => Promise<void>;
  onConfirmarCita?: (citaId: number, notificacionId: number) => Promise<void>;
}

interface TipoConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const tipoConfig: Record<string, TipoConfig> = {
  confirmacion: {
    icon: <CheckCircleIcon className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  recordatorio: {
    icon: <ClockIcon className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  listo_para_recoger: {
    icon: <ScissorsIcon className="h-5 w-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  encuesta: {
    icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  cancelacion: {
    icon: <XCircleIcon className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  reprogramacion: {
    icon: <ArrowPathIcon className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  pendiente_confirmacion: {
    icon: <ExclamationCircleIcon className="h-5 w-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
};

const defaultConfig: TipoConfig = {
  icon: <CircleStackIcon className="h-5 w-5" />,
  color: 'text-gray-500',
  bgColor: 'bg-gray-50',
  borderColor: 'border-gray-200',
};

export const NotificacionesList = ({ 
  notificaciones, 
  onMarcarLeida,
  onConfirmarCita,
}: NotificacionesListProps) => {
  if (notificaciones.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h3>
        <div className="text-center py-8 text-gray-500">
          <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No tienes notificaciones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notificaciones.map((notif) => {
          const config = tipoConfig[notif.tipo] || defaultConfig;
          
          return (
            <div
              key={notif.id}
              className={`p-3 rounded-lg border transition-all ${
                notif.leida
                  ? 'bg-gray-50 border-gray-200'
                  : `${config.bgColor} ${config.borderColor}`
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1">
                  <div className={`flex-shrink-0 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${notif.leida ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {notif.mensaje}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-400">{notif.fecha}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {/* Botón confirmar para citas pendientes */}
                  {notif.tipo === 'pendiente_confirmacion' && !notif.leida && notif.cita_id != null && onConfirmarCita && (
                    <button
                      onClick={() => onConfirmarCita(notif.cita_id!, notif.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckIcon className="h-3 w-3" />
                      Confirmar cita
                    </button>
                  )}
                  {!notif.leida && notif.tipo !== 'pendiente_confirmacion' && (
                    <button
                      onClick={() => onMarcarLeida(notif.id)}
                      className="text-green-600 hover:text-green-700 transition-colors"
                      title="Marcar como leída"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                  {notif.leida && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3" />
                      Leída
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};