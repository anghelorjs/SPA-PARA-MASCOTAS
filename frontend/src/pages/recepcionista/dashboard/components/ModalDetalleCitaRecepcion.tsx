// src/pages/recepcionista/dashboard/components/ModalDetalleCitaRecepcion.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  CalendarIcon,
  ScissorsIcon,
  UserIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { DetalleCitaRecepcion } from '../../../../services/types/recepcionista';
import { recepcionistaDashboardService } from '../services/recepcionista.dashboard.service';
import { useToast } from '../../../../hooks/useToast';

interface ModalDetalleCitaRecepcionProps {
  isOpen: boolean;
  citaId: number | null;
  onClose: () => void;
  onConfirmar?: (citaId: number) => Promise<void>;
  onCancelar?: (citaId: number) => Promise<void>;
  onVerFicha?: (fichaId: number) => void;
  onRefresh?: () => void;
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

const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    programada: 'Programada',
    pendiente_confirmacion: 'Pendiente',
    confirmada: 'Confirmada',
    en_curso: 'En curso',
    completada: 'Completada',
    cancelada: 'Cancelada',
  };
  return labels[estado] || estado;
};

export const ModalDetalleCitaRecepcion = ({
  isOpen,
  citaId,
  onClose,
  onConfirmar,
  onCancelar,
  onVerFicha,
  onRefresh,
}: ModalDetalleCitaRecepcionProps) => {
  const [cita, setCita] = useState<DetalleCitaRecepcion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && citaId) {
      loadDetalle();
    }
  }, [isOpen, citaId]);

  const loadDetalle = async () => {
    if (!citaId) return;
    try {
      setIsLoading(true);
      const data = await recepcionistaDashboardService.getDetalleCita(citaId);
      setCita(data);
    } catch (error) {
      showToast('Error al cargar detalle de la cita', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmar = async () => {
    if (!citaId || !onConfirmar) return;
    try {
      setIsConfirming(true);
      await onConfirmar(citaId);
      showToast('Cita confirmada exitosamente', 'success');
      onClose();
      onRefresh?.();
    } catch (error) {
      showToast('Error al confirmar cita', 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelar = async () => {
    if (!citaId || !onCancelar) return;
    try {
      setIsCancelling(true);
      await onCancelar(citaId);
      showToast('Cita cancelada exitosamente', 'success');
      onClose();
      onRefresh?.();
    } catch (error) {
      showToast('Error al cancelar cita', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleVerFicha = () => {
    if (cita?.id_ficha && onVerFicha) {
      onVerFicha(cita.id_ficha);
      onClose();
    }
  };

  if (!isOpen) return null;

  const puedeConfirmar = cita?.estado === 'programada';
  const puedeCancelar = cita ? ['programada', 'confirmada'].includes(cita.estado) : false;
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
                  {getEstadoLabel(cita.estado)}
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
                  <p className="text-sm font-medium text-gray-900">Fecha y Hora</p>
                  <p className="text-sm text-gray-600">{cita.hora_inicio}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-500">Finaliza: {cita.hora_fin}</p>
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
              onClick={handleConfirmar}
              disabled={isConfirming}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-sm font-medium text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {isConfirming ? 'Confirmando...' : 'Confirmar cita'}
            </button>
          )}
          {puedeCancelar && (
            <button
              onClick={handleCancelar}
              disabled={isCancelling}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-sm font-medium text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <XCircleIcon className="h-4 w-4" />
              {isCancelling ? 'Cancelando...' : 'Cancelar cita'}
            </button>
          )}
          {puedeVerFicha && (
            <button
              onClick={handleVerFicha}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentTextIcon className="h-4 w-4" />
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