// src/pages/admin/grooming/components/FiltroTipoFoto.tsx
import { PhotoIcon } from '@heroicons/react/24/outline';
import type { TipoFoto } from '../../../../services/types/admin';

interface FiltroTipoFotoProps {
  tiposFoto: TipoFoto[];
  tipoSeleccionado: string;
  onTipoChange: (tipo: string) => void;
  isLoading?: boolean;
}

export const FiltroTipoFoto = ({ tiposFoto, tipoSeleccionado, onTipoChange, isLoading }: FiltroTipoFotoProps) => {
  return (
    <div className="flex items-center gap-2">
      <PhotoIcon className="h-5 w-5 text-gray-400" />
      <select
        value={tipoSeleccionado}
        onChange={(e) => onTipoChange(e.target.value)}
        disabled={isLoading}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-w-[140px]"
      >
        <option value="">Todos los tipos</option>
        {tiposFoto.map((tipo) => (
          <option key={tipo.id} value={tipo.id}>
            {tipo.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};