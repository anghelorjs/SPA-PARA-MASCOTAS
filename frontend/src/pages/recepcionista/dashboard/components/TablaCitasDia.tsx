// src/pages/recepcionista/dashboard/components/TablaCitasDia.tsx
import { CalendarIcon, EyeIcon, ClockIcon, UserIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import type { CitaDashboardRecepcion } from '../../../../services/types/recepcionista';

interface TablaCitasDiaProps {
  citas: CitaDashboardRecepcion[];
  isLoading: boolean;
  onCitaClick: (citaId: number) => void;
}

export const TablaCitasDia = ({ citas, isLoading, onCitaClick }: TablaCitasDiaProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (citas.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay citas programadas para hoy</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mascota / Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groomer
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {citas.map((cita) => (
              <tr key={cita.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onCitaClick(cita.id)}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                    {cita.hora_inicio}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {cita.duracion} min
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{cita.mascota}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <UserIcon className="h-3 w-3" />
                    {cita.cliente}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <ScissorsIcon className="h-3.5 w-3.5 text-gray-400" />
                    {cita.servicio}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{cita.groomer}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{ backgroundColor: `${cita.color}20`, color: cita.color }}
                  >
                    {cita.estado === 'programada' ? 'Programada' :
                     cita.estado === 'confirmada' ? 'Confirmada' :
                     cita.estado === 'en_curso' ? 'En curso' :
                     cita.estado === 'completada' ? 'Completada' :
                     cita.estado === 'cancelada' ? 'Cancelada' : cita.estado}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCitaClick(cita.id);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalle"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};