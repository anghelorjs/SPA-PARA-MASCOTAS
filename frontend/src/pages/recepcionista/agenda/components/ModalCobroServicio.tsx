import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { recepcionistaAgendaService } from '../services/recepcionista.agenda.service';
import type { CitaDetalle } from '../services/recepcionista.agenda.service';
import { useToast } from '../../../../hooks/useToast';

interface ModalCobroServicioProps {
  isOpen: boolean;
  cita: CitaDetalle | null;
  onClose: () => void;
  onPagoRegistrado: (cita: CitaDetalle) => void;
}

const MEDIOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'qr', label: 'QR' },
  { value: 'transferencia', label: 'Transferencia' },
];

const formatPrecio = (precio: number | string | null | undefined): string => {
  const n = Number(precio);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  return 'Error al registrar el cobro';
};

export const ModalCobroServicio = ({
  isOpen,
  cita,
  onClose,
  onPagoRegistrado,
}: ModalCobroServicioProps) => {
  const [medioPago, setMedioPago] = useState('efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !cita) return null;

  const handleConfirmar = async () => {
    try {
      setIsSubmitting(true);
      const result = await recepcionistaAgendaService.registrarPago(cita.id, medioPago);
      onPagoRegistrado(result.cita);
      showToast('Cobro registrado correctamente', 'success');
      onClose();
    } catch (error: unknown) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">Cobrar servicio</h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium uppercase text-gray-500">Mascota</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{cita.mascota}</p>
            <p className="text-xs text-gray-500">{cita.cliente}</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium uppercase text-gray-500">Servicio</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{cita.servicio}</p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-xs font-medium uppercase text-green-700">Total a cobrar</p>
            <p className="mt-1 text-xl font-bold text-green-700">Bs. {formatPrecio(cita.precio)}</p>
          </div>

          <div>
            <label htmlFor="medio-pago-servicio" className="text-sm font-medium text-gray-700">
              Medio de pago
            </label>
            <select
              id="medio-pago-servicio"
              value={medioPago}
              onChange={(event) => setMedioPago(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              {MEDIOS_PAGO.map((medio) => (
                <option key={medio.value} value={medio.value}>
                  {medio.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {isSubmitting ? 'Registrando...' : 'Confirmar cobro'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
