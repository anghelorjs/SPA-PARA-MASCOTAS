// src/pages/cliente/historial/servicios/components/FiltroMascotaServicios.tsx
import { HeartIcon } from '@heroicons/react/24/outline';
import type { MascotaFiltro } from '../../../../../services/types/cliente';

interface FiltroMascotaServiciosProps {
  mascotas: MascotaFiltro[];
  mascotaSeleccionada: number | undefined;
  onMascotaChange: (mascotaId: number | undefined) => void;
}

export const FiltroMascotaServicios = ({
  mascotas,
  mascotaSeleccionada,
  onMascotaChange,
}: FiltroMascotaServiciosProps) => {
  if (mascotas.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <HeartIcon className="h-5 w-5 text-pink-500" />
      <select
        value={mascotaSeleccionada || ''}
        onChange={(e) => {
          const value = e.target.value;
          onMascotaChange(value ? parseInt(value) : undefined);
        }}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
      >
        <option value="">Todas las mascotas</option>
        {mascotas.map((mascota) => (
          <option key={mascota.id} value={mascota.id}>
            {mascota.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};