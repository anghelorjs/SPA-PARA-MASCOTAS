// src/pages/cliente/mascotas/components/PestañaGaleriaFotos.tsx
import { useState } from 'react';
import { PhotoIcon, CalendarIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import type { GaleriaGrupo } from '../../../../services/types/cliente';
import { LightboxFotos } from './LightboxFotos';

interface PestañaGaleriaFotosProps {
  galeria: GaleriaGrupo[] | Record<string, GaleriaGrupo> | null | undefined;
  isLoading: boolean;
}

export const PestañaGaleriaFotos = ({ galeria, isLoading }: PestañaGaleriaFotosProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GaleriaGrupo | null>(null);
  const grupos = Array.isArray(galeria)
    ? galeria
    : galeria
      ? Object.values(galeria)
      : [];

  const handleVerGrupo = (grupo: GaleriaGrupo) => {
    setSelectedGroup(grupo);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (grupos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <PhotoIcon className="h-12 w-12 mx-auto mb-3" />
        <p className="text-sm">No hay fotos disponibles</p>
        <p className="text-xs mt-1">Las fotos de los servicios aparecerán aquí</p>
      </div>
    );
  }

  // Separar fotos con y sin ficha asociada
  const gruposConServicio = grupos.filter(g => g.ficha_id !== null);
  const gruposGenerales = grupos.filter(g => g.ficha_id === null);

  return (
    <>
      <div className="space-y-6">
        {/* Grupos con servicio asociado */}
        {gruposConServicio.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <ScissorsIcon className="h-4 w-4 text-gray-400" />
              Fotos por servicio
            </h3>
            <div className="space-y-4">
              {gruposConServicio.map((grupo, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>{grupo.fecha}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-1">{grupo.servicio}</p>
                    </div>
                    <button
                      onClick={() => handleVerGrupo(grupo)}
                      className="px-3 py-1 text-xs bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                    >
                      Ver {grupo.fotos.length} foto(s)
                    </button>
                  </div>

                  {/* Miniaturas */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {grupo.fotos.slice(0, 4).map((foto) => (
                      <button
                        key={foto.id}
                        onClick={() => handleVerGrupo(grupo)}
                        className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200 hover:border-pink-500 transition-colors"
                      >
                        <img
                          src={foto.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 text-[10px] bg-black/60 text-white px-1 rounded-tl">
                          {foto.tipo === 'antes' ? '📸' : '✨'}
                        </span>
                      </button>
                    ))}
                    {grupo.fotos.length > 4 && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm flex-shrink-0">
                        +{grupo.fotos.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fotos generales (sin ficha) */}
        {gruposGenerales.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <PhotoIcon className="h-4 w-4 text-gray-400" />
              Otras fotos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gruposGenerales.flatMap(grupo => 
                grupo.fotos.map(foto => (
                  <button
                    key={foto.id}
                    onClick={() => handleVerGrupo(grupo)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-pink-500 transition-colors group"
                  >
                    <img
                      src={foto.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {grupo.fecha}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedGroup && (
        <LightboxFotos
          isOpen={lightboxOpen}
          onClose={() => {
            setLightboxOpen(false);
            setSelectedGroup(null);
          }}
          fotosAntes={selectedGroup.fotos.filter(f => f.tipo === 'antes')}
          fotosDespues={selectedGroup.fotos.filter(f => f.tipo === 'despues')}
          servicio={selectedGroup.servicio}
          fecha={selectedGroup.fecha}
        />
      )}
    </>
  );
};
