// src/pages/cliente/mascotas/components/MascotaCard.tsx
import { 
  PencilIcon, 
  EyeIcon, 
  ScaleIcon, 
  TagIcon 
} from '@heroicons/react/24/outline';
import type { Mascota } from '../../../../services/types/cliente';

interface MascotaCardProps {
  mascota: Mascota;
  onEditar: (mascota: Mascota) => void;
  onVerDetalle: (mascotaId: number) => void;
}

export const MascotaCard = ({ mascota, onEditar, onVerDetalle }: MascotaCardProps) => {
  const getEspecieIcon = (especie: string) => {
    switch (especie.toLowerCase()) {
      case 'perro':
        return '🐕';
      case 'gato':
        return '🐱';
      default:
        return '🐾';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Foto de perfil */}
      <div className="relative h-32 bg-gradient-to-r from-blue-400 to-purple-500">
        {mascota.foto_perfil_url ? (
          <img
            src={mascota.foto_perfil_url}
            alt={mascota.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{getEspecieIcon(mascota.especie)}</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{mascota.nombre}</h3>
            <p className="text-sm text-gray-500">
              {mascota.especie} • {mascota.raza || 'Raza no especificada'}
            </p>
          </div>
          {mascota.tamanio && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {mascota.tamanio}
            </span>
          )}
        </div>

        {/* Peso y rango */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ScaleIcon className="h-4 w-4 text-gray-400" />
            <span>{mascota.peso_kg} kg</span>
          </div>
          <div className="flex items-center gap-1">
            <TagIcon className="h-4 w-4 text-gray-400" />
            <span>{mascota.rango_nombre || 'Sin rango'}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEditar(mascota)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => onVerDetalle(mascota.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            Ver ficha completa
          </button>
        </div>
      </div>
    </div>
  );
};
