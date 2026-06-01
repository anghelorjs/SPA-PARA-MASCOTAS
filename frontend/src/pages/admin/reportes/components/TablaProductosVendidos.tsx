// src/pages/admin/reportes/components/TablaProductosVendidos.tsx
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import type { ProductoVendidoReporte } from '../../../../services/types/admin';

interface TablaProductosVendidosProps {
  data: ProductoVendidoReporte[];
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

export const TablaProductosVendidos = ({ data, isLoading }: TablaProductosVendidosProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ShoppingCartIcon className="h-10 w-10 mx-auto mb-2" />
        <p>No hay productos vendidos en el período</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Producto</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Unidades Vendidas</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Ingresos</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((producto, idx) => {
            const ingresos = toNumber(producto.ingresos);
            return (
              <tr key={producto.producto_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
                    {producto.nombre}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">
                  {producto.unidades_vendidas}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                  Bs. {ingresos.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
       </table>
    </div>
  );
};
