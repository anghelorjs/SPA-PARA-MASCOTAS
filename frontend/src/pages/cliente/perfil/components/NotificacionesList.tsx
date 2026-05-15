// src/pages/cliente/perfil/components/NotificacionesList.tsx
import { BellIcon, CheckCircleIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { NotificacionData } from '../services/cliente.perfil.service';

interface NotificacionesListProps {
  notificaciones: NotificacionData[];
  onMarcarLeida: (id: number) => Promise<void>;
  onConfirmarCita?: (citaId: number, notificacionId: number) => Promise<void>; // ← NUEVO
}

const tipoIconos: Record<string, string> = {
  confirmacion: '✅',
  recordatorio: '⏰',
  listo_para_recoger: '🐕',
  encuesta: '📝',
  cancelacion: '❌',
  reprogramacion: '🔄',
  pendiente_confirmacion: '⏳', // ← NUEVO
};

const tipoColores: Record<string, string> = {
  confirmacion: 'bg-green-50 border-green-200',
  recordatorio: 'bg-blue-50 border-blue-200',
  listo_para_recoger: 'bg-purple-50 border-purple-200',
  encuesta: 'bg-yellow-50 border-yellow-200',
  cancelacion: 'bg-red-50 border-red-200',
  reprogramacion: 'bg-orange-50 border-orange-200',
  pendiente_confirmacion: 'bg-amber-50 border-amber-200', // ← NUEVO
};

export const NotificacionesList = ({ 
  notificaciones, 
  onMarcarLeida,
  onConfirmarCita, // ← NUEVO
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
        {notificaciones.map((notif) => (
          <div
            key={notif.id}
            className={`p-3 rounded-lg border transition-all ${
              notif.leida
                ? 'bg-gray-50 border-gray-200'
                : tipoColores[notif.tipo] || 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3 flex-1">
                <span className="text-xl">{tipoIconos[notif.tipo] || '🔔'}</span>
                <div className="flex-1">
                  <p className={`text-sm ${notif.leida ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {notif.mensaje}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{notif.fecha}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* ← NUEVO: Botón confirmar para citas pendientes */}
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
                  <span className="text-xs text-gray-400">✓ Leída</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
