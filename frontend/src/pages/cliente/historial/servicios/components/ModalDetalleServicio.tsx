// src/pages/cliente/historial/servicios/components/ModalDetalleServicio.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ScissorsIcon, 
  UserIcon, 
  ChatBubbleLeftIcon, 
  LightBulbIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { clienteServiciosService } from '../services/cliente.servicios.service';
import type { DetalleServicioResponse } from '../../../../../services/types/cliente';
import { useToast } from '../../../../../hooks/useToast';

interface ModalDetalleServicioProps {
  isOpen: boolean;
  servicioId: number | null;
  onClose: () => void;
}

const getImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  if (url.startsWith('/storage')) return `${baseUrl}${url}`;
  return `${baseUrl}/storage/${url.replace(/^\/?storage\/?/, '')}`;
};

const Lightbox = ({ 
  fotos, 
  initialIndex, 
  onClose 
}: { 
  fotos: Array<{ url: string; tipo: string; fecha: string }>; 
  initialIndex: number; 
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : fotos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < fotos.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <img
          src={getImageUrl(fotos[currentIndex].url)}
          alt="Foto ampliada"
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />
        {fotos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20"
            >
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20"
            >
              <ArrowRightIcon className="h-6 w-6 text-white" />
            </button>
          </>
        )}
        <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
          {currentIndex + 1} / {fotos.length}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const ModalDetalleServicio = ({ isOpen, servicioId, onClose }: ModalDetalleServicioProps) => {
  const [detalle, setDetalle] = useState<DetalleServicioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedFotoIndex, setSelectedFotoIndex] = useState(0);
  const [allFotos, setAllFotos] = useState<Array<{ url: string; tipo: string; fecha: string }>>([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && servicioId) {
      loadDetalle();
    }
  }, [isOpen, servicioId]);

  const loadDetalle = async () => {
    if (!servicioId) return;
    try {
      setIsLoading(true);
      const data = await clienteServiciosService.getServicioDetalle(servicioId);
      setDetalle(data);
      const todas = [...data.fotos.antes, ...data.fotos.despues];
      setAllFotos(todas);
    } catch (error) {
      showToast('Error al cargar detalle del servicio', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFotoClick = (index: number) => {
    setSelectedFotoIndex(index);
    setLightboxOpen(true);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div>
              <h2 className="text-lg font-semibold text-white">Detalle del Servicio</h2>
              <p className="text-xs text-blue-100">{detalle?.fecha}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : detalle ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <ScissorsIcon className="h-4 w-4" />
                      Servicio
                    </div>
                    <p className="text-sm font-medium text-gray-800">{detalle.servicio}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <UserIcon className="h-4 w-4" />
                      Groomer
                    </div>
                    <p className="text-sm font-medium text-gray-800">{detalle.groomer}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <CalendarIcon className="h-4 w-4" />
                      Fecha
                    </div>
                    <p className="text-sm font-medium text-gray-800">{detalle.fecha}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <UserIcon className="h-4 w-4" />
                      Mascota
                    </div>
                    <p className="text-sm font-medium text-gray-800">{detalle.mascota}</p>
                  </div>
                </div>

                {detalle.observaciones && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      Observaciones
                    </div>
                    <p className="text-sm text-gray-700">{detalle.observaciones}</p>
                  </div>
                )}

                {detalle.recomendaciones && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center gap-2 text-xs text-amber-700 mb-1">
                      <LightBulbIcon className="h-4 w-4" />
                      Recomendaciones
                    </div>
                    <p className="text-sm text-amber-800">{detalle.recomendaciones}</p>
                  </div>
                )}

                {/* Fotos */}
                {(detalle.fotos.antes.length > 0 || detalle.fotos.despues.length > 0) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Galería de fotos</h3>
                    
                    {detalle.fotos.antes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Antes del servicio</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {detalle.fotos.antes.map((foto, idx) => (
                            <button
                              key={foto.id}
                              onClick={() => handleFotoClick(allFotos.findIndex(f => f.id === foto.id))}
                              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500"
                            >
                              <img src={getImageUrl(foto.url)} alt="Antes" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {detalle.fotos.despues.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Después del servicio</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {detalle.fotos.despues.map((foto, idx) => (
                            <button
                              key={foto.id}
                              onClick={() => handleFotoClick(allFotos.findIndex(f => f.id === foto.id))}
                              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500"
                            >
                              <img src={getImageUrl(foto.url)} alt="Después" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No se pudo cargar el detalle</div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen && allFotos.length > 0 && (
        <Lightbox fotos={allFotos} initialIndex={selectedFotoIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </>,
    document.body
  );
};