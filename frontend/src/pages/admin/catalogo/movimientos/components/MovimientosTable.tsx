// src/pages/admin/catalogo/movimientos/components/MovimientosTable.tsx
import { 
  CalendarIcon, 
  CubeIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  PencilSquareIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import type { MovimientoInventario } from '../../../../../services/types/admin';

interface MovimientosTableProps {
  movimientos: MovimientoInventario[];
  isLoading: boolean;
}

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

const TIPO_MOVIMIENTO_CONFIG = {
  entrada: { 
    label: 'Entrada', 
    icon: ArrowTrendingUpIcon, 
    color: 'bg-green-100 text-green-800',
    badgeColor: 'text-green-600'
  },
  salida: { 
    label: 'Salida', 
    icon: ArrowTrendingDownIcon, 
    color: 'bg-red-100 text-red-800',
    badgeColor: 'text-red-600'
  },
  ajuste: { 
    label: 'Ajuste', 
    icon: PencilSquareIcon, 
    color: 'bg-yellow-100 text-yellow-800',
    badgeColor: 'text-yellow-600'
  },
};

export const MovimientosTable = ({ movimientos, isLoading }: MovimientosTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay movimientos registrados
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motivo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Resultante
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movimientos.map((movimiento) => {
              const config = TIPO_MOVIMIENTO_CONFIG[movimiento.tipoMovimiento as keyof typeof TIPO_MOVIMIENTO_CONFIG];
              const IconComponent = config?.icon || DocumentTextIcon;
              const cantidad = toNumber(movimiento.cantidad);
              const stockResultante = movimiento.stock_resultante !== null ? toNumber(movimiento.stock_resultante) : null;
              
              return (
                <tr key={movimiento.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      {new Date(movimiento.fecha).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <CubeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{movimiento.producto_nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config?.color || 'bg-gray-100 text-gray-800'}`}>
                      <IconComponent className="h-3 w-3" />
                      {config?.label || movimiento.tipoMovimiento}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-semibold ${config?.badgeColor || 'text-gray-700'}`}>
                      {movimiento.tipoMovimiento === 'salida' ? '-' : '+'}{cantidad}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-1">
                      <DocumentTextIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 line-clamp-2">{movimiento.motivo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {stockResultante !== null ? (
                      <span className="text-sm font-medium text-gray-800">
                        {stockResultante} unidades
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};