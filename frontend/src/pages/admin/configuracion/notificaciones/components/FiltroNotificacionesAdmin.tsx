// src/pages/admin/configuracion/notificaciones/components/FiltroNotificacionesAdmin.tsx
import { MagnifyingGlassIcon, CalendarIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import type { TipoNotificacionOption, CanalNotificacionOption } from '../../../../../services/types/admin';

interface FiltroNotificacionesAdminProps {
  tipos: TipoNotificacionOption[];
  canales: CanalNotificacionOption[];
  filtroTipo: string;
  filtroCanal: string;
  filtroEntregada: boolean | undefined;
  filtroFechaDesde: string;
  filtroFechaHasta: string;
  filtroClienteSearch: string;
  isLoading: boolean;
  tieneFiltrosActivos: boolean;
  onTipoChange: (tipo: string) => void;
  onCanalChange: (canal: string) => void;
  onEntregadaChange: (entregada: boolean | undefined) => void;
  onFechaDesdeChange: (fecha: string) => void;
  onFechaHastaChange: (fecha: string) => void;
  onClienteSearchChange: (search: string) => void;
  onLimpiar: () => void;
}

export const FiltroNotificacionesAdmin = ({
  tipos,
  canales,
  filtroTipo,
  filtroCanal,
  filtroEntregada,
  filtroFechaDesde,
  filtroFechaHasta,
  filtroClienteSearch,
  isLoading,
  tieneFiltrosActivos,
  onTipoChange,
  onCanalChange,
  onEntregadaChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClienteSearchChange,
  onLimpiar,
}: FiltroNotificacionesAdminProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Fila superior: buscador y botón limpiar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            value={filtroClienteSearch}
            onChange={(e) => onClienteSearchChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
        {tieneFiltrosActivos && (
          <button
            onClick={onLimpiar}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <XMarkIcon className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Tipo */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            value={filtroTipo}
            onChange={(e) => onTipoChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Todos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Canal */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Canal</label>
          <select
            value={filtroCanal}
            onChange={(e) => onCanalChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {canales.map((canal) => (
              <option key={canal.id} value={canal.id}>
                {canal.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Estado de entrega */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select
            value={filtroEntregada === undefined ? '' : filtroEntregada ? 'entregada' : 'fallida'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'entregada') onEntregadaChange(true);
              else if (val === 'fallida') onEntregadaChange(false);
              else onEntregadaChange(undefined);
            }}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="entregada">Entregadas</option>
            <option value="fallida">Fallidas</option>
          </select>
        </div>

        {/* Fecha desde */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};