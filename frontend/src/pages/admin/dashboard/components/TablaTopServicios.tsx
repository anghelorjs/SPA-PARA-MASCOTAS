// src/pages/admin/dashboard/components/TablaTopServicios.tsx
import { ScissorsIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import type { TopServicio } from '../../../../services/types/admin';

interface TablaTopServiciosProps {
  servicios: TopServicio[];
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

export const TablaTopServicios = ({ servicios, isLoading }: TablaTopServiciosProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (servicios.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ScissorsIcon className="h-10 w-10 mx-auto mb-2" />
        <p className="text-sm">No hay servicios registrados en el período</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Servicio
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad de Citas
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ingresos
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {servicios.map((servicio, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{servicio.nombre}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />
                  <span className="text-sm text-gray-700">{servicio.total}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-green-600">
                  Bs. {toNumber(servicio.ingresos || 0).toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};