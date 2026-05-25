// src/pages/admin/catalogo/movimientos/components/FiltrosMovimientos.tsx
import { MagnifyingGlassIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { TipoMovimiento } from '../../../../../services/types/admin';

interface FiltrosMovimientosProps {
  filtroProducto: string;
  filtroTipo: string;
  filtroFechaDesde: string;
  filtroFechaHasta: string;
  tiposMovimiento: TipoMovimiento[];
  tieneFiltrosActivos: boolean;
  onProductoChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  onLimpiar: () => void;
}

export const FiltrosMovimientos = ({
  filtroProducto,
  filtroTipo,
  filtroFechaDesde,
  filtroFechaHasta,
  tiposMovimiento,
  tieneFiltrosActivos,
  onProductoChange,
  onTipoChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onLimpiar,
}: FiltrosMovimientosProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
        {/* Buscador por producto */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Producto
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por producto..."
              value={filtroProducto}
              onChange={(e) => onProductoChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filtro por tipo */}
        <div className="w-40">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Tipo
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => onTipoChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {tiposMovimiento.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro fecha desde */}
        <div className="w-40">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Desde
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filtro fecha hasta */}
        <div className="w-40">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Hasta
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {tieneFiltrosActivos && (
          <button
            onClick={onLimpiar}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};