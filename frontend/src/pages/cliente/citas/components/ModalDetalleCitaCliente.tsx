// src/pages/cliente/citas/components/ModalDetalleCitaCliente.tsx
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  CalendarIcon,
  ScissorsIcon,
  UserIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  FaceSmileIcon,
  ExclamationCircleIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import type { DetalleCitaCliente } from '../../../../services/types/cliente';

interface ModalDetalleCitaClienteProps {
  isOpen: boolean;
  cita: DetalleCitaCliente | null;
  isLoading: boolean;
  onClose: () => void;
}

const formatPrecio = (precio: number | string | null | undefined): string => {
  const n = Number(precio);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    programada: 'Programada',
    pendiente_confirmacion: 'Pendiente de confirmación',
    confirmada: 'Confirmada',
    en_curso: 'En curso',
    completada: 'Completada',
    cancelada: 'Cancelada',
  };
  return labels[estado] || estado;
};

const getEstadoColor = (estado: string): string => {
  const colors: Record<string, string> = {
    programada: 'bg-blue-100 text-blue-800',
    pendiente_confirmacion: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-green-100 text-green-800',
    en_curso: 'bg-orange-100 text-orange-800',
    completada: 'bg-gray-100 text-gray-800',
    cancelada: 'bg-red-100 text-red-800',
  };
  return colors[estado] || 'bg-gray-100 text-gray-800';
};

export const ModalDetalleCitaCliente = ({ isOpen, cita, isLoading, onClose }: ModalDetalleCitaClienteProps) => {
  if (!isOpen) return null;

  const datosClinicos = [
    { label: 'Temperamento', value: cita?.mascota.temperamento, icon: FaceSmileIcon, color: 'text-amber-600' },
    { label: 'Alergias', value: cita?.mascota.alergias?.join(', '), icon: ExclamationCircleIcon, color: 'text-red-500' },
    { label: 'Restricciones', value: cita?.mascota.restricciones?.join(', '), icon: NoSymbolIcon, color: 'text-orange-500' },
  ].filter(d => d.value);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Detalle de la Cita</h3>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : cita ? (
            <div className="space-y-4">
              {/* Estado + ID */}
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEstadoColor(cita.estado)}`}>
                  {getEstadoLabel(cita.estado)}
                </span>
                <span className="text-xs text-gray-400">ID: {cita.id}</span>
              </div>

              {/* Mascota */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <HeartIcon className="h-5 w-5 text-pink-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Mascota</p>
                  <p className="text-sm text-gray-800">{cita.mascota.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {cita.mascota.especie} • {cita.mascota.raza || 'Raza no especificada'}
                  </p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>Peso: {cita.mascota.peso_kg} kg</span>
                    <span>Rango: {cita.mascota.rango_nombre || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Datos clínicos */}
              {datosClinicos.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-1 text-xs text-amber-700 font-medium mb-1.5">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    <span>Datos importantes de la mascota</span>
                  </div>
                  <div className="space-y-1">
                    {datosClinicos.map((dato, idx) => {
                      const IconComponent = dato.icon;
                      return (
                        <div key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <IconComponent className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${dato.color}`} />
                          <span className="font-medium">{dato.label}:</span>
                          <span className="truncate">{dato.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Servicio */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <ScissorsIcon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Servicio</p>
                  <p className="text-sm text-gray-600">{cita.servicio}</p>
                  <p className="text-xs text-gray-400">Duración: {cita.duracion} min</p>
                </div>
              </div>

              {/* Groomer */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Groomer</p>
                  <p className="text-sm text-gray-600">{cita.groomer}</p>
                </div>
              </div>

              {/* Fecha y hora */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha y Hora</p>
                  <p className="text-sm text-gray-600">{cita.fecha}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-500">
                      {cita.hora_inicio} - {cita.hora_fin}
                    </p>
                  </div>
                </div>
              </div>

              {/* Precio */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Precio</p>
                  <p className="text-sm font-semibold text-green-600">
                    Bs. {formatPrecio(cita.precio)}
                  </p>
                </div>
              </div>

              {/* Observaciones */}
              {cita.observaciones && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Observaciones</p>
                  <p className="text-sm text-yellow-700">{cita.observaciones}</p>
                </div>
              )}

              {/* Canal de notificación */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BellAlertIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Notificaciones</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Recibirás confirmaciones por: <span className="font-medium">{cita.canal_notificacion}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No se pudo cargar el detalle de la cita</p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};