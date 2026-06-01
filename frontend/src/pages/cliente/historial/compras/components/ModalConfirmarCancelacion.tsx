// src/pages/cliente/historial/compras/components/ModalConfirmarCancelacion.tsx
import { createPortal } from 'react-dom';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ModalConfirmarCancelacionProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirmar: () => void;
}

export const ModalConfirmarCancelacion = ({ isOpen, isLoading, onClose, onConfirmar }: ModalConfirmarCancelacionProps) => {
  if (!isOpen) return null;

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
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Cancelar Pedido</h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h4 className="text-center text-lg font-semibold text-gray-900 mb-2">
            ¿Cancelar este pedido?
          </h4>
          <p className="text-sm text-gray-500 text-center">
            Esta acción no se puede deshacer. El pedido será cancelado y no se procesará.
          </p>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            No, volver
          </button>
          <button
            onClick={onConfirmar}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Cancelando...' : 'Sí, cancelar pedido'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};