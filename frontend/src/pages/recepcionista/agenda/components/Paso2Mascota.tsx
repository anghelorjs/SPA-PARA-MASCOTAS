// src/pages/recepcionista/agenda/components/Paso2Mascota.tsx
import { PlusIcon, HeartIcon } from '@heroicons/react/24/outline';
import type { MascotaData } from '../services/recepcionista.agenda.service';

interface Paso2MascotaProps {
  mascotas: MascotaData[];
  onSelectMascota: (mascota: MascotaData | null) => void;
  onNuevaMascota: () => void;
  selectedMascota: MascotaData | null;
  isLoading: boolean;
}

export const Paso2Mascota = ({
  mascotas,
  onSelectMascota,
  onNuevaMascota,
  selectedMascota,
  isLoading,
}: Paso2MascotaProps) => {
  if (selectedMascota) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900">{selectedMascota.nombre}</p>
            <p className="text-sm text-gray-500">
              {selectedMascota.especie} • {selectedMascota.raza || 'Sin raza'}
            </p>
            <p className="text-sm text-gray-500">Peso: {selectedMascota.peso_kg} kg</p>
            <p className="text-sm text-gray-500">Rango: {selectedMascota.rango_nombre || 'No asignado'}</p>
          </div>
          <button
            onClick={() => onSelectMascota(null)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (mascotas.length === 0) {
    return (
      <div className="text-center py-8">
        <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Este cliente no tiene mascotas registradas</p>
        <button
          onClick={onNuevaMascota}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Registrar nueva mascota
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
      {mascotas.map((mascota) => (
        <button
          key={mascota.id}
          onClick={() => onSelectMascota(mascota)}
          className="text-left p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="flex items-start gap-3">
            <HeartIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{mascota.nombre}</p>
              <p className="text-sm text-gray-500">
                {mascota.especie} • {mascota.raza || 'Sin raza'}
              </p>
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-gray-400">Peso: {mascota.peso_kg} kg</span>
                <span className="text-xs text-gray-400">Rango: {mascota.rango_nombre || 'N/A'}</span>
              </div>
              {mascota.temperamento && (
                <p className="text-xs text-gray-400 mt-1">Temperamento: {mascota.temperamento}</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
