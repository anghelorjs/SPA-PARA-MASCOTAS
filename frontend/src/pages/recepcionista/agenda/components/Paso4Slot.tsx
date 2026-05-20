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
  error?: string | null;
}

export const Paso4Slot = ({
  slots,
  onSelectSlot,
  selectedSlot,
  fecha,
  isLoading,
  duracionServicio,
  groomerInicial,
  error,
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

  // Agrupar por hora evita que un horario se vea como una sola opcion ambigua.
  // Cada boton conserva el groomer_id real que se enviara al backend.
  const slotsPorHora = slots.reduce((acc, slot) => {
    if (!acc[slot.hora_inicio]) {
      acc[slot.hora_inicio] = [];
    }
    acc[slot.hora_inicio].push(slot);
    return acc;
  }, {} as Record<string, SlotDisponible[]>);

  const horasOrdenadas = Object.keys(slotsPorHora).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-700">
          <CalendarIcon className="h-4 w-4 inline mr-1" />
          {fechaFormateada}
        </p>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {horasOrdenadas.map((hora) => {
          const opciones = [...slotsPorHora[hora]].sort((a, b) => {
            if (!groomerInicial) return a.groomer_nombre.localeCompare(b.groomer_nombre);
            if (a.groomer_id === groomerInicial) return -1;
            if (b.groomer_id === groomerInicial) return 1;
            return a.groomer_nombre.localeCompare(b.groomer_nombre);
          });

          return (
          <div key={hora} className="border rounded-lg p-3">
            <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              {hora}
              <span className="text-xs font-normal text-gray-400">
                {opciones.length === 1 ? '1 groomer disponible' : `${opciones.length} groomers disponibles`}
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {opciones.map((slot) => (
                <button
                  key={`${slot.groomer_id}-${slot.hora_inicio}`}
                  onClick={() => onSelectSlot(slot)}
                  className="p-2 text-sm border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all text-left"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="h-3 w-3 text-gray-400 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium text-gray-800 truncate">{slot.groomer_nombre}</span>
                      <span className="block text-xs text-gray-400">{slot.hora_inicio} - {slot.hora_fin}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};
