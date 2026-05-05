// src/pages/cliente/perfil/components/NotificacionesList.tsx
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { NotificacionData } from '../services/cliente.perfil.service';

interface NotificacionesListProps {
  notificaciones: NotificacionData[];
  onMarcarLeida: (id: number) => Promise<void>;
}

const tipoIconos: Record<string, string> = {
  confirmacion: '📅',
  recordatorio: '⏰',
  listo_para_recoger: '✅',
  encuesta: '📝',
  cancelacion: '❌',
  reprogramacion: '🔄',
};

export const NotificacionesList = ({ notificaciones, onMarcarLeida }: NotificacionesListProps) => {
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
        {notificaciones.map((notif) => (
          <div
            key={notif.id}
            className={`p-3 rounded-lg border transition-all ${
              notif.leida
                ? 'bg-gray-50 border-gray-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <span className="text-xl">{tipoIconos[notif.tipo] || '🔔'}</span>
                <div className="flex-1">
                  <p className={`text-sm ${notif.leida ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {notif.mensaje}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{notif.fecha}</p>
                </div>
              </div>
              {!notif.leida && (
                <button
                  onClick={() => onMarcarLeida(notif.id)}
                  className="text-green-600 hover:text-green-700 transition-colors"
                  title="Marcar como leída"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};