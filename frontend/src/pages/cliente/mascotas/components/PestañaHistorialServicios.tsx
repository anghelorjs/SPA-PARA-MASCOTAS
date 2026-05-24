// src/pages/cliente/mascotas/components/PestañaHistorialServicios.tsx
import { useState } from 'react';
import { 
  CalendarIcon, 
  ScissorsIcon, 
  UserIcon, 
  ChatBubbleLeftIcon, 
  LightBulbIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import type { HistorialServicio } from '../../../../services/types/cliente';
import { LightboxFotos } from './LightboxFotos';

interface PestañaHistorialServiciosProps {
  historial: HistorialServicio[];
  isLoading: boolean;
}

export const PestañaHistorialServicios = ({ historial, isLoading }: PestañaHistorialServiciosProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedFotos, setSelectedFotos] = useState<{ antes: any[]; despues: any[]; servicio: string; fecha: string }>({
    antes: [],
    despues: [],
    servicio: '',
    fecha: '',
  });

  const handleVerFotos = (servicio: HistorialServicio) => {
    setSelectedFotos({
      antes: servicio.fotos.filter(f => f.tipo === 'antes'),
      despues: servicio.fotos.filter(f => f.tipo === 'despues'),
      servicio: servicio.servicio,
      fecha: servicio.fecha,
    });
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <ScissorsIcon className="h-12 w-12 mx-auto mb-3" />
        <p className="text-sm">No hay servicios registrados</p>
        <p className="text-xs mt-1">Los servicios completados aparecerán aquí</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {historial.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Cabecera */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>{item.fecha}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <ScissorsIcon className="h-4 w-4 text-gray-400" />
                  <span>{item.servicio}</span>
                </div>
              </div>
              {item.fotos.length > 0 && (
                <button
                  onClick={() => handleVerFotos(item)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <PhotoIcon className="h-4 w-4" />
                  {item.fotos.length} foto(s)
                </button>
              )}
            </div>

            {/* Groomer */}
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <span>{item.groomer}</span>
            </div>

            {/* Observaciones */}
            {item.observaciones && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ChatBubbleLeftIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Observaciones del groomer</span>
                </div>
                <p className="text-sm text-gray-700">{item.observaciones}</p>
              </div>
            )}

            {/* Recomendaciones */}
            {item.recomendaciones && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <LightBulbIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">Recomendaciones</span>
                </div>
                <p className="text-sm text-amber-800">{item.recomendaciones}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <LightboxFotos
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        fotosAntes={selectedFotos.antes}
        fotosDespues={selectedFotos.despues}
        servicio={selectedFotos.servicio}
        fecha={selectedFotos.fecha}
      />
    </>
  );
};
