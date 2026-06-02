// src/pages/admin/configuracion/notificaciones/components/TablaNotificacionesAdmin.tsx
import { 
  EyeIcon, 
  ArrowPathIcon, 
  ChatBubbleLeftRightIcon, 
  DevicePhoneMobileIcon, 
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import type { NotificacionAdmin } from '../../../../../services/types/admin';

interface TablaNotificacionesAdminProps {
  notificaciones: NotificacionAdmin[];
  isLoading: boolean;
  onVerDetalle: (id: number) => void;
  onReenviar: (id: number) => void;
}

const getTipoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    confirmacion: 'Confirmación',
    recordatorio: 'Recordatorio',
    listo_para_recoger: 'Listo para recoger',
    encuesta: 'Encuesta',
    cancelacion: 'Cancelación',
    reprogramacion: 'Reprogramación',
  };
  return labels[tipo] || tipo;
};

const getCanalIcon = (canal: string) => {
  switch (canal) {
    case 'whatsapp':
      return { icon: <ChatBubbleLeftRightIcon className="h-4 w-4" />, color: 'text-green-600', bgColor: 'bg-green-100' };
    case 'telegram':
      return { icon: <DevicePhoneMobileIcon className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    case 'email':
      return { icon: <EnvelopeIcon className="h-4 w-4" />, color: 'text-purple-600', bgColor: 'bg-purple-100' };
    default:
      return { icon: <DevicePhoneMobileIcon className="h-4 w-4" />, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
};

export const TablaNotificacionesAdmin = ({ notificaciones, isLoading, onVerDetalle, onReenviar }: TablaNotificacionesAdminProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (notificaciones.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay notificaciones registradas
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notificaciones.map((notificacion) => {
              const canalInfo = getCanalIcon(notificacion.canal);
              
              return (
                <tr key={notificacion.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{notificacion.cliente}</div>
                        {notificacion.cita_id && (
                          <div className="text-xs text-gray-400">Cita ID: {notificacion.cita_id}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {getTipoLabel(notificacion.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${canalInfo.bgColor} ${canalInfo.color}`}>
                      {canalInfo.icon}
                      {notificacion.canal === 'whatsapp' ? 'WhatsApp' : 
                       notificacion.canal === 'telegram' ? 'Telegram' :
                       notificacion.canal === 'email' ? 'Email' : 'SMS'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-md line-clamp-2">{notificacion.mensaje}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      {notificacion.fecha_creacion}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {notificacion.entregada ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3" />
                        Leída
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-blue-800">
                        <XCircleIcon className="h-3 w-3" />
                        Entregada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onVerDetalle(notificacion.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ver detalle"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {!notificacion.entregada && (
                        <button
                          onClick={() => onReenviar(notificacion.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Reenviar notificación"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};