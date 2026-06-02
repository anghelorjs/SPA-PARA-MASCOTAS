// src/pages/admin/grooming/components/GridGaleriaFotos.tsx
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { FotoAdmin } from '../../../../services/types/admin';

interface GridGaleriaFotosProps {
  fotos: FotoAdmin[];
  isLoading: boolean;
  onFotoClick: (foto: FotoAdmin, index: number) => void;
  onEliminarFoto: (fotoId: number) => void;
}

export const GridGaleriaFotos = ({ fotos, isLoading, onFotoClick, onEliminarFoto }: GridGaleriaFotosProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (fotos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <PhotoIcon className="h-12 w-12 mx-auto mb-3" />
        <p className="text-sm">No hay fotos disponibles</p>
        <p className="text-xs mt-1">Ajusta los filtros para encontrar más resultados</p>
      </div>
    );
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'perfil': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Perfil' };
      case 'antes': return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Antes' };
      case 'despues': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Después' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: tipo };
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {fotos.map((foto, idx) => {
        const badge = getTipoBadge(foto.tipo);
        return (
          <div key={foto.id} className="relative group">
            <button
              onClick={() => onFotoClick(foto, idx)}
              className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all"
            >
              <img
                src={foto.url}
                alt={foto.mascota}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
                }}
              />
            </button>
            
            {/* Badge de tipo */}
            <div className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </div>
            
            {/* Nombre de mascota al hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center truncate opacity-0 group-hover:opacity-100 transition-opacity">
              {foto.mascota}
            </div>
            
            {/* Fecha */}
            <div className="absolute bottom-0 right-0 text-[10px] bg-black/50 text-white px-1 rounded-tl">
              {foto.fecha}
            </div>
            
            {/* Botón eliminar (solo admin) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEliminarFoto(foto.id);
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              title="Eliminar foto"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};