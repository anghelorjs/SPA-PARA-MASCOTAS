// src/pages/cliente/historial/compras/components/FiltroFechasCompras.tsx
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FiltroFechasComprasProps {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (fecha: string) => void;
  onFechaHastaChange: (fecha: string) => void;
  onLimpiar: () => void;
}

export const FiltroFechasCompras = ({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  onLimpiar,
}: FiltroFechasComprasProps) => {
  const tieneFechas = fechaDesde !== '' || fechaHasta !== '';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">Desde:</span>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => onFechaDesdeChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Hasta:</span>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => onFechaHastaChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {tieneFechas && (
        <button
          onClick={onLimpiar}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <XMarkIcon className="h-4 w-4" />
          Limpiar fechas
        </button>
      )}
    </div>
  );
};