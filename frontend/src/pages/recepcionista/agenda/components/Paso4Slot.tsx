// src/pages/recepcionista/agenda/components/Paso4Slot.tsx
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import type { SlotDisponible } from '../services/recepcionista.agenda.service';
import { formatLocalDate } from '../utils/date';

interface Paso4SlotProps {
  slots: SlotDisponible[];
  onSelectSlot: (slot: SlotDisponible | null) => void;
  selectedSlot: SlotDisponible | null;
  fecha: string;
  isLoading: boolean;
  duracionServicio?: number;
  groomerInicial?: number;
}

export const Paso4Slot = ({
  slots,
  onSelectSlot,
  selectedSlot,
  fecha,
  isLoading,
  duracionServicio,
  groomerInicial,
}: Paso4SlotProps) => {
  const fechaFormateada = formatLocalDate(fecha, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (selectedSlot) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{selectedSlot.groomer_nombre}</p>
              <p className="text-sm text-gray-500">
                {selectedSlot.hora_inicio} - {selectedSlot.hora_fin}
              </p>
              {duracionServicio && (
                <p className="text-xs text-gray-400">Duración: {duracionServicio} minutos</p>
              )}
            </div>
            <button
              onClick={() => onSelectSlot(null)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Cambiar
            </button>
          </div>
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

  if (slots.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
        <p className="text-sm text-gray-400 mt-1">Prueba con otra fecha</p>
      </div>
    );
  }

  // Agrupar slots por groomer
  const slotsPorGroomer = slots.reduce((acc, slot) => {
    if (!acc[slot.groomer_id]) {
      acc[slot.groomer_id] = {
        groomer_nombre: slot.groomer_nombre,
        slots: [],
      };
    }
    acc[slot.groomer_id].slots.push(slot);
    return acc;
  }, {} as Record<number, { groomer_nombre: string; slots: SlotDisponible[] }>);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-700">
          <CalendarIcon className="h-4 w-4 inline mr-1" />
          {fechaFormateada}
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(slotsPorGroomer)
          .sort(([a], [b]) => {
            if (!groomerInicial) return Number(a) - Number(b);
            if (Number(a) === groomerInicial) return -1;
            if (Number(b) === groomerInicial) return 1;
            return Number(a) - Number(b);
          })
          .map(([, groomer]) => (
          <div key={groomer.groomer_nombre} className="border rounded-lg p-3">
            <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              {groomer.groomer_nombre}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {groomer.slots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSlot(slot)}
                  className="p-2 text-sm border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all text-center"
                >
                  <ClockIcon className="h-3 w-3 inline mr-1 text-gray-400" />
                  {slot.hora_inicio}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
