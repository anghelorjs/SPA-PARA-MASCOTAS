// src/pages/admin/grooming/components/LightboxGaleria.tsx
import { createPortal } from 'react-dom';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { FotoAdmin } from '../../../../services/types/admin';

interface LightboxGaleriaProps {
  isOpen: boolean;
  fotos: FotoAdmin[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEliminar?: (fotoId: number) => void;
}

export const LightboxGaleria = ({
  isOpen,
  fotos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onEliminar,
}: LightboxGaleriaProps) => {
  if (!isOpen || fotos.length === 0) return null;

  const currentFoto = fotos[currentIndex];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'Escape') onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
        <div className="text-white">
          <p className="text-sm font-medium">{currentFoto.mascota}</p>
          <p className="text-xs text-white/50">{currentFoto.fecha}</p>
        </div>
        <div className="flex gap-2">
          {onEliminar && (
            <button
              onClick={() => onEliminar(currentFoto.id)}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Imagen */}
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <img
          src={currentFoto.url}
          alt={currentFoto.mascota}
          className="max-w-[90vw] max-h-[90vh] object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
          }}
        />
        
        {/* Navegación */}
        {fotos.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowRightIcon className="h-6 w-6 text-white" />
            </button>
          </>
        )}
        
        {/* Contador */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
          {currentIndex + 1} / {fotos.length}
        </div>
      </div>
    </div>,
    document.body
  );
};