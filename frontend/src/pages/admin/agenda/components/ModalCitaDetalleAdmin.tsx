// src/pages/admin/agenda/components/ModalCitaDetalleAdmin.tsx
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  CalendarIcon,
  ScissorsIcon,
  UserIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { CitaDetalle } from '../types';
import { ESTADO_LABELS } from '../types';

interface ModalCitaDetalleAdminProps {
  isOpen: boolean;
  cita: CitaDetalle | null;
  isLoading: boolean;
  isConfirming: boolean;
  isCancelling: boolean;
  onClose: () => void;
  onConfirmar: () => void;
  onCancelar: () => void;
  onReprogramar: () => void;
  onVerFicha: (fichaId: number) => void;
}

const formatPrecio = (precio: number | string | null | undefined): string => {
  const n = Number(precio);
  return isNaN(n) ? '0.00' : n.toFixed(2);
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

export const ModalCitaDetalleAdmin = ({
  isOpen,
  cita,
  isLoading,
  isConfirming,
  isCancelling,
  onClose,
  onConfirmar,
  onCancelar,
  onReprogramar,
  onVerFicha,
}: ModalCitaDetalleAdminProps) => {
  if (!isOpen) return null;

  const estadosEditables = ['programada', 'pendiente_confirmacion', 'confirmada'];
  const puedeConfirmar = cita ? ['programada', 'pendiente_confirmacion'].includes(cita.estado) : false;
  const puedeCancelar = cita ? estadosEditables.includes(cita.estado) : false;
  const puedeReprogramar = cita ? estadosEditables.includes(cita.estado) : false;
  const puedeVerFicha = Boolean(cita?.tiene_ficha);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-4">
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
                  {ESTADO_LABELS[cita.estado as keyof typeof ESTADO_LABELS] || cita.estado}
                </span>
                <span className="text-xs text-gray-400">ID: {cita.id}</span>
              </div>

              {/* Mascota */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <HeartIcon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Mascota</p>
                  <p className="text-sm text-gray-600">{cita.mascota}</p>
                  <p className="text-xs text-gray-400">Dueño: {cita.cliente}</p>
                </div>
              </div>

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
                  <p className="text-sm font-medium text-gray-900">Fecha</p>
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
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No se pudo cargar el detalle de la cita</p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
          {puedeConfirmar && (
            <button
              onClick={onConfirmar}
              disabled={isConfirming}
              className="px-4 py-2 bg-green-600 text-sm font-medium text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isConfirming ? 'Confirmando...' : 'Confirmar cita'}
            </button>
          )}
          {puedeCancelar && (
            <button
              onClick={onCancelar}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-600 text-sm font-medium text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isCancelling ? 'Cancelando...' : 'Cancelar cita'}
            </button>
          )}
          {puedeReprogramar && (
            <button
              onClick={onReprogramar}
              className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reprogramar
            </button>
          )}
          {puedeVerFicha && cita?.id_ficha && (
            <button
              onClick={() => onVerFicha(cita.id_ficha!)}
              className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver ficha grooming
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
