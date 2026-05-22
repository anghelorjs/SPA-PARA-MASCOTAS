// src/pages/groomer/agenda/components/HistorialMascotaDrawer.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PhotoIcon, CalendarIcon, ScissorsIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { groomerAgendaService } from '../services/groomer.agenda.service';
import type { HistorialMascotaResponse } from '../../../../services/types/groomer';

interface HistorialMascotaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mascotaId: number;
  mascotaNombre: string;
}

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"%3E%3Crect width="80" height="80" fill="%23f1f5f9"/%3E%3Cpath d="M24 52l12-14 8 10 6-7 10 11H24z" fill="%23cbd5e1"/%3E%3Ccircle cx="50" cy="30" r="5" fill="%23cbd5e1"/%3E%3C/svg%3E';

const ImgWithFallback = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative w-full h-full ${className ?? ''}`}>
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={errored ? PLACEHOLDER : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => { setErrored(true); setLoaded(true); }}
      />
    </div>
  );
};

export const HistorialMascotaDrawer = ({
  isOpen,
  onClose,
  mascotaId,
  mascotaNombre,
}: HistorialMascotaDrawerProps) => {
  const [data, setData] = useState<HistorialMascotaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !mascotaId) return;

    const controller = new AbortController();

    const fetchHistorial = async () => {
      try {
        setIsLoading(true);
        const response = await groomerAgendaService.getHistorialMascota(mascotaId);
        if (!controller.signal.aborted) {
          setData(response);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error al cargar historial:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchHistorial();

    return () => {
      controller.abort();
    };
  }, [isOpen, mascotaId]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={onClose} />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r from-blue-600 to-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-bold">{mascotaNombre}</h2>
            <p className="text-sm text-blue-100">Historial de servicios</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Datos mascota */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>🐾</span> Datos de la mascota
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Especie:</span> {data.mascota.especie}</div>
                  <div><span className="text-gray-500">Raza:</span> {data.mascota.raza || 'No especificada'}</div>
                  <div><span className="text-gray-500">Peso:</span> {data.mascota.peso_kg} kg</div>
                  <div><span className="text-gray-500">Rango:</span> {data.mascota.rango_nombre || 'No asignado'}</div>
                </div>
                {(data.mascota.temperamento || data.mascota.alergias || data.mascota.restricciones || data.mascota.vacunas) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
                    {data.mascota.temperamento && <p><span className="text-gray-500">Temperamento:</span> {data.mascota.temperamento}</p>}
                    {data.mascota.alergias && <p><span className="text-gray-500">Alergias:</span> {data.mascota.alergias}</p>}
                    {data.mascota.restricciones && <p><span className="text-gray-500">Restricciones:</span> {data.mascota.restricciones}</p>}
                    {data.mascota.vacunas && <p><span className="text-gray-500">Vacunas:</span> {data.mascota.vacunas}</p>}
                  </div>
                )}
              </div>

              {/* Historial */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  Historial de servicios
                </h3>
                {data.historial.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No hay servicios previos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.historial.map((ficha) => (
                      <div key={ficha.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ScissorsIcon className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-gray-900">{ficha.servicio}</span>
                          </div>
                          <span className="text-xs text-gray-400">{ficha.fecha}</span>
                        </div>

                        {ficha.observaciones && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                              <ChatBubbleLeftIcon className="h-3 w-3" />
                              <span>Observaciones del groomer</span>
                            </div>
                            <p className="text-sm text-gray-700">{ficha.observaciones}</p>
                          </div>
                        )}

                        {ficha.recomendaciones && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                              <span>💡</span><span>Recomendaciones</span>
                            </div>
                            <p className="text-sm text-blue-800">{ficha.recomendaciones}</p>
                          </div>
                        )}

                        {ficha.fotos.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <PhotoIcon className="h-3 w-3" />
                              <span>Fotos ({ficha.fotos.length})</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {ficha.fotos.map((foto) => (
                                <button
                                  key={foto.id}
                                  onClick={() => setSelectedFoto(foto.url)}
                                  className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 hover:opacity-80 transition-opacity border-2 border-gray-200"
                                >
                                  <ImgWithFallback
                                    src={foto.url}
                                    alt={`${ficha.servicio} - ${foto.tipo}`}
                                  />
                                  <span className="absolute bottom-0 right-0 text-[10px] bg-black/60 text-white px-1 rounded-tl pointer-events-none">
                                    {foto.tipo === 'antes' ? '📸' : '✨'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No se pudo cargar el historial</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedFoto && (
        <div
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center"
          onClick={() => setSelectedFoto(null)}
        >
          <img
            src={selectedFoto}
            alt="Foto ampliada"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          <button
            onClick={() => setSelectedFoto(null)}
            aria-label="Cerrar imagen"
            title="Cerrar imagen"
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </>,
    document.body
  );
};