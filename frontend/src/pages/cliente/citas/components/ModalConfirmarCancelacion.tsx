// src/pages/cliente/citas/components/ModalConfirmarCancelacion.tsx
import { createPortal } from 'react-dom';
import { XMarkIcon, ExclamationTriangleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { CitaCliente } from '../../../../services/types/cliente';

interface ModalConfirmarCancelacionProps {
  isOpen: boolean;
  cita: CitaCliente | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirmar: () => void;
}

export const ModalConfirmarCancelacion = ({ 
  isOpen, 
  cita, 
  isLoading, 
  onClose, 
  onConfirmar 
}: ModalConfirmarCancelacionProps) => {
  if (!isOpen || !cita) return null;

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
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Cancelar Cita</h3>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <h4 className="text-center text-lg font-semibold text-gray-900 mb-2">
            ¿Estás seguro de cancelar esta cita?
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-800">{cita.fecha} - {cita.hora_inicio}</p>
                <p className="text-sm text-gray-600">{cita.mascota} - {cita.servicio}</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Esta acción no se puede deshacer. La cita será eliminada del sistema.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            No, volver
          </button>
          <button
            onClick={onConfirmar}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Cancelando...' : 'Sí, cancelar cita'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};