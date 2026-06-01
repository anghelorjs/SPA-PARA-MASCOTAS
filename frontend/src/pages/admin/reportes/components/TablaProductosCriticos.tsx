// src/pages/admin/reportes/components/TablaProductosCriticos.tsx
import { ExclamationTriangleIcon, CubeIcon } from '@heroicons/react/24/outline';
import type { ProductoCritico } from '../../../../services/types/admin';

interface TablaProductosCriticosProps {
  data: ProductoCritico[];
  isLoading: boolean;
}

export const TablaProductosCriticos = ({ data, isLoading }: TablaProductosCriticosProps) => {
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
        <CubeIcon className="h-10 w-10 mx-auto mb-2" />
        <p>No hay productos con stock crítico</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Producto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Categoría</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Stock Actual</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Stock Mínimo</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((producto) => (
            <tr key={producto.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-800">{producto.nombre}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{producto.categoria}</td>
              <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{producto.stock_actual}</td>
              <td className="px-4 py-3 text-sm text-right text-gray-500">{producto.stock_minimo}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  Crítico
                </span>
               </td>
             </tr>
          ))}
        </tbody>
       </table>
    </div>
  );
};