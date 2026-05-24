// src/pages/groomer/dashboard/components/ListaCitasDia.tsx
import { CalendarIcon } from '@heroicons/react/24/outline';
import type { CitaDashboard } from '../../../../services/types/groomer';
import { CitaCardGroomer } from './CitaCardGroomer';

interface ListaCitasDiaProps {
  citas: CitaDashboard[];
  isLoading: boolean;
  onAbrirFicha: (citaId: number, fichaId?: number | null) => void;
}

export const ListaCitasDia = ({ citas, isLoading, onAbrirFicha }: ListaCitasDiaProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (citas.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay citas programadas para hoy</p>
        <p className="text-sm text-gray-400 mt-1">¡Disfruta tu día!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {citas.map((cita) => (
        <CitaCardGroomer
          key={cita.id}
          cita={cita}
          onAbrirFicha={onAbrirFicha}
        />
      ))}
    </div>
  );
};