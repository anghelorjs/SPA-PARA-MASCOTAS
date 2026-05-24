// src/pages/admin/dashboard/components/TablaTopProductos.tsx
import { CubeIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import type { TopProducto } from '../../../../services/types/admin';

interface TablaTopProductosProps {
  productos: TopProducto[];
  isLoading: boolean;
}

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const TablaTopProductos = ({ productos, isLoading }: TablaTopProductosProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <CubeIcon className="h-10 w-10 mx-auto mb-2" />
        <p className="text-sm">No hay productos vendidos en el período</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidades Vendidas
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ingresos
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {productos.map((producto, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">{idx + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{producto.nombre}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCartIcon className="h-3 w-3 text-blue-500" />
                  <span className="text-sm text-gray-700">{producto.total_vendidos}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-green-600">
                  Bs. {toNumber(producto.ingresos || 0).toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};