// src/pages/admin/reportes/components/TablaInsumosConsumidos.tsx
import { BeakerIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import type { InsumoConsumido } from '../../../../services/types/admin';

interface TablaInsumosConsumidosProps {
  data: InsumoConsumido[];
  isLoading: boolean;
}

export const TablaInsumosConsumidos = ({ data, isLoading }: TablaInsumosConsumidosProps) => {
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
        <BeakerIcon className="h-10 w-10 mx-auto mb-2" />
        <p>No hay consumo de insumos registrado en el período</p>
        <p className="text-xs mt-1">Los insumos aparecerán aquí cuando se utilicen en fichas de grooming</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Insumo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Consumido
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidad
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              % del Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((insumo) => {
            const totalGeneral = data.reduce((sum, i) => sum + i.total_consumido, 0);
            const porcentaje = totalGeneral > 0 ? (insumo.total_consumido / totalGeneral) * 100 : 0;
            
            return (
              <tr key={insumo.insumo_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BeakerIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-800">{insumo.nombre}</span>
                  </div>
                 </td>
                <td className="px-4 py-3 text-sm text-gray-500">{insumo.categoria}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-600">
                      {insumo.total_consumido.toFixed(2)}
                    </span>
                  </div>
                 </td>
                <td className="px-4 py-3 text-sm text-gray-500">{insumo.unidad_medida}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center gap-1">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{porcentaje.toFixed(1)}%</span>
                  </div>
                 </td>
               </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-700">
              Total General
            </td>
            <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">
              {data.reduce((sum, i) => sum + i.total_consumido, 0).toFixed(2)}
            </td>
            <td colSpan={2} className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
