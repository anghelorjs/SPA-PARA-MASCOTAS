// src/pages/admin/dashboard/components/AlertasStock.tsx
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AlertasStockProps {
  data: Array<{
    idProducto?: number;
    idInsumo?: number;
    nombre: string;
    stock_total?: number;
    stock_actual?: number;
    tipo: string;
  }>;
}

export const AlertasStock = ({ data }: AlertasStockProps) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
        Alertas de Stock Bajo
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="bg-red-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.tipo === 'producto' ? 'Producto' : 'Insumo'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold text-right">
                  {item.tipo === 'producto' ? item.stock_total : item.stock_actual}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};