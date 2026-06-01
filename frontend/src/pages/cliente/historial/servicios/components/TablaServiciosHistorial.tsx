// src/pages/cliente/historial/servicios/components/TablaServiciosHistorial.tsx
import { 
  CalendarIcon, 
  ScissorsIcon, 
  UserIcon, 
  ChatBubbleLeftIcon, 
  LightBulbIcon,
  PhotoIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import type { ServicioHistorial } from '../../../../../services/types/cliente';

interface TablaServiciosHistorialProps {
  servicios: ServicioHistorial[];
  isLoading: boolean;
  onVerDetalle: (id: number) => void;
}

export const TablaServiciosHistorial = ({ servicios, isLoading, onVerDetalle }: TablaServiciosHistorialProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  if (servicios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay servicios registrados
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mascota</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groomer</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recomendaciones</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Fotos</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {servicio.fecha}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-800">{servicio.mascota}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <ScissorsIcon className="h-4 w-4 text-gray-400" />
                    {servicio.servicio}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    {servicio.groomer}
                  </div>
                </td>
                {/* <td className="px-6 py-4">
                  {servicio.observaciones ? (
                    <div className="flex items-start gap-1 text-sm text-gray-600 max-w-xs">
                      <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{servicio.observaciones}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td> */}
                <td className="px-6 py-4">
                  {servicio.recomendaciones ? (
                    <div className="flex items-start gap-1 text-sm text-amber-600 max-w-xs">
                      <LightBulbIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{servicio.recomendaciones}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {servicio.tiene_fotos ? (
                    <PhotoIcon className="h-5 w-5 text-blue-500 mx-auto" />
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onVerDetalle(servicio.id)}
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