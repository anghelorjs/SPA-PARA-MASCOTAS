// src/pages/admin/reportes/components/TablaTopMascotas.tsx
import { HeartIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { TopMascotaReporte } from '../../../../services/types/admin';

interface TablaTopMascotasProps {
  data: TopMascotaReporte[];
  isLoading: boolean;
}

export const TablaTopMascotas = ({ data, isLoading }: TablaTopMascotasProps) => {
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
        <HeartIcon className="h-10 w-10 mx-auto mb-2" />
        <p>No hay mascotas registradas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Mascota</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Dueño</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Total Citas</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((mascota) => (
            <tr key={mascota.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-800">{mascota.nombre}</div>
                  <div className="text-xs text-gray-400">{mascota.especie} • {mascota.raza || 'Sin raza'}</div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{mascota.dueno}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  {mascota.total_citas}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
       </table>
    </div>
  );
};
