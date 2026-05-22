// src/pages/groomer/fichas/components/FiltroFecha.tsx
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FiltroFechaProps {
  search: string;
  fechaDesde: string;
  fechaHasta: string;
  onSearchChange: (value: string) => void;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  onLimpiar: () => void;
  onAplicar: () => void;
}

export const FiltroFecha = ({
  search,
  fechaDesde,
  fechaHasta,
  onSearchChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onLimpiar,
  onAplicar,
}: FiltroFechaProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
      {/* Buscador por mascota */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre de mascota..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Rango de fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onLimpiar}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
          Limpiar
        </button>
        <button
          onClick={onAplicar}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>
      </div>
    </div>
  );
};