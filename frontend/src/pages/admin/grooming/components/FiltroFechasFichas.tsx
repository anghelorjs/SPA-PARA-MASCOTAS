// src/pages/admin/grooming/components/FiltroFechasFichas.tsx
import { CalendarIcon } from '@heroicons/react/24/outline';

interface FiltroFechasFichasProps {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (fecha: string) => void;
  onFechaHastaChange: (fecha: string) => void;
  isLoading?: boolean;
}

export const FiltroFechasFichas = ({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  isLoading,
}: FiltroFechasFichasProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-600">Desde:</span>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => onFechaDesdeChange(e.target.value)}
          disabled={isLoading}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Hasta:</span>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => onFechaHastaChange(e.target.value)}
          disabled={isLoading}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
    </div>
  );
};