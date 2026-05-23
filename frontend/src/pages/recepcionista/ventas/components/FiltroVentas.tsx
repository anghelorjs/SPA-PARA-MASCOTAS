// src/pages/recepcionista/ventas/components/FiltroVentas.tsx
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

// ✅ Función helper para convertir a número
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

interface FiltroVentasProps {
  fecha: string;
  filtroEstado: string;
  totalDia: number;
  onFechaChange: (fecha: string) => void;
  onFiltroEstadoChange: (estado: string) => void;
  onLimpiarFiltros?: () => void;
}

export const FiltroVentas = ({
  fecha,
  filtroEstado,
  totalDia,
  onFechaChange,
  onFiltroEstadoChange,
  onLimpiarFiltros,
}: FiltroVentasProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const estadosDisponibles = [
    { value: 'todas', label: 'Todas', color: 'bg-gray-100 text-gray-700' },
    { value: 'pagado', label: 'Pagadas', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Canceladas', color: 'bg-red-100 text-red-800' },
  ];

  const handleLimpiar = () => {
    if (onLimpiarFiltros) {
      onLimpiarFiltros();
    }
  };

  const tieneFiltrosActivos = filtroEstado !== 'todas';

  // ✅ Convertir totalDia a número seguro
  const totalDiaNumero = toNumber(totalDia);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header del filtro - siempre visible */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <FunnelIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
            {tieneFiltrosActivos && (
              <p className="text-xs text-blue-600 mt-0.5">
                Filtros activos aplicados
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tieneFiltrosActivos && onLimpiarFiltros && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLimpiar();
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Limpiar filtros"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Selector de fecha */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Seleccionar fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => onFechaChange(e.target.value)}
              aria-label="Seleccionar fecha de ventas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Selector de estado */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Estado de venta
            </label>
            <div className="flex gap-2">
              {estadosDisponibles.map((estado) => (
                <button
                  key={estado.value}
                  type="button"
                  onClick={() => onFiltroEstadoChange(estado.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    filtroEstado === estado.value
                      ? estado.value === 'pagado'
                        ? 'bg-green-600 text-white shadow-md'
                        : estado.value === 'cancelado'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-blue-600 text-white shadow-md'
                      : estado.color
                  }`}
                >
                  {estado.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resumen del día */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Total del día</p>
                {/* ✅ Usar totalDiaNumero en lugar de totalDia directamente */}
                <p className="text-lg font-bold text-green-700">Bs. {totalDiaNumero.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Fecha seleccionada</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(fecha).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de limpiar filtros */}
          {tieneFiltrosActivos && onLimpiarFiltros && (
            <button
              onClick={handleLimpiar}
              className="w-full py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};