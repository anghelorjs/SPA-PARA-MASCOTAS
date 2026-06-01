// src/pages/admin/reportes/components/TablaTopClientes.tsx
import { UserIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { TopClienteReporte } from '../../../../services/types/admin';

interface TablaTopClientesProps {
  data: TopClienteReporte[];
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

export const TablaTopClientes = ({ data, isLoading }: TablaTopClientesProps) => {
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
        <UserIcon className="h-10 w-10 mx-auto mb-2" />
        <p>No hay clientes registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Cliente</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Total Citas</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Gastado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((cliente) => {
            const totalGastado = toNumber(cliente.total_gastado);
            return (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{cliente.nombre}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{cliente.telefono || 'Sin teléfono'}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {cliente.total_citas}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 text-sm font-semibold text-green-600">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Bs. {totalGastado.toFixed(2)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
       </table>
    </div>
  );
};
