// src/pages/admin/catalogo/insumos/components/InsumosTable.tsx
import { 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon, 
  CubeIcon, 
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import type { Insumo } from '../../../../../services/types/admin';

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

interface InsumosTableProps {
  insumos: Insumo[];
  isLoading: boolean;
  onEdit: (insumo: Insumo) => void;
  onDelete: (id: number, nombre: string) => void;
  onVerDetalle: (insumo: Insumo) => void;
}

const NIVEL_STOCK_CONFIG = {
  verde: { label: 'Stock óptimo', color: 'bg-green-100 text-green-800', icon: '🟢' },
  amarillo: { label: 'Stock medio', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  rojo: { label: 'Stock crítico', color: 'bg-red-100 text-red-800', icon: '🔴' },
};

export const InsumosTable = ({ insumos, isLoading, onEdit, onDelete, onVerDetalle }: InsumosTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando insumos...</p>
        </div>
      </div>
    );
  }

  if (insumos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay insumos registrados
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
                Insumo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidad
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo Unitario
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {insumos.map((insumo) => {
              const stockActual = toNumber(insumo.stockActual);
              const stockMinimo = toNumber(insumo.stockMinimo);
              const costoUnitario = toNumber(insumo.costoUnitario);
              const nivel = insumo.nivel_stock || (stockActual <= stockMinimo ? 'rojo' : stockActual <= stockMinimo * 2 ? 'amarillo' : 'verde');
              const nivelConfig = NIVEL_STOCK_CONFIG[nivel as keyof typeof NIVEL_STOCK_CONFIG] || NIVEL_STOCK_CONFIG.verde;
              const porcentajeStock = stockMinimo > 0 ? (stockActual / stockMinimo) * 100 : 100;
              
              return (
                <tr key={insumo.idInsumo} className={`hover:bg-gray-50 transition-colors ${insumo.alerta_stock ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{insumo.nombre}</div>
                      {insumo.alerta_stock && (
                        <div className="flex items-center gap-1 mt-1">
                          <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-600">Stock por debajo del mínimo</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {insumo.categoria?.nombre || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{insumo.unidadMedida}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CubeIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span className={`text-sm font-medium ${insumo.alerta_stock ? 'text-red-600' : 'text-gray-700'}`}>
                        {stockActual} / {stockMinimo}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${nivelConfig.color}`}>
                          <span>{nivelConfig.icon}</span>
                          {nivelConfig.label}
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            nivel === 'rojo' ? 'bg-red-500' : nivel === 'amarillo' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(porcentajeStock, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CurrencyDollarIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        Bs. {costoUnitario.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onVerDetalle(insumo)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle / Ajustar stock"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(insumo)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(insumo.idInsumo, insumo.nombre)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
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