// src/pages/cliente/mascotas/components/LightboxFotos.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { FotoMascota } from '../../../../services/types/cliente';

interface LightboxFotosProps {
  isOpen: boolean;
  onClose: () => void;
  fotosAntes: FotoMascota[];
  fotosDespues: FotoMascota[];
  servicio: string;
  fecha: string;
}

export const LightboxFotos = ({ isOpen, onClose, fotosAntes, fotosDespues, servicio, fecha }: LightboxFotosProps) => {
  const [activeTab, setActiveTab] = useState<'antes' | 'despues'>('antes');
  const [currentIndex, setCurrentIndex] = useState(0);

  const fotosActuales = activeTab === 'antes' ? fotosAntes : fotosDespues;
  const currentFoto = fotosActuales[currentIndex];

  const handleNext = () => {
    if (currentIndex < fotosActuales.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="w-full max-w-5xl mx-auto p-4">
        {/* Título */}
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold">{servicio}</h3>
          <p className="text-white/50 text-sm">{fecha}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => {
              setActiveTab('antes');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'antes'
                ? 'bg-white text-gray-900'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Antes ({fotosAntes.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('despues');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'despues'
                ? 'bg-white text-gray-900'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Después ({fotosDespues.length})
          </button>
        </div>

        {/* Contenido */}
        {fotosActuales.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            <p>No hay fotos disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="relative">
            {/* Imagen principal */}
            <div className="flex justify-center items-center min-h-[50vh]">
              <img
                src={currentFoto.url}
                alt={`${servicio} - ${activeTab}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Navegación */}
            {fotosActuales.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === fotosActuales.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            {/* Indicador */}
            <div className="text-center mt-4 text-white/50 text-sm">
              {currentIndex + 1} / {fotosActuales.length}
            </div>

            {/* Miniaturas */}
            <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
              {fotosActuales.map((foto, idx) => (
                <button
                  key={foto.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === idx ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={foto.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};