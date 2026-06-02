// src/pages/admin/grooming/components/TablaTodasFichas.tsx
import { 
  EyeIcon, 
  CalendarIcon, 
  UserIcon, 
  HeartIcon, 
  ScissorsIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import type { FichaTodasAdmin } from '../../../../services/types/admin';

interface TablaTodasFichasProps {
  fichas: FichaTodasAdmin[];
  isLoading: boolean;
  onVerDetalle: (id: number) => void;
}

export const TablaTodasFichas = ({ fichas, isLoading, onVerDetalle }: TablaTodasFichasProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando fichas...</p>
        </div>
      </div>
    );
  }

  if (fichas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay fichas registradas
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Apertura</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groomer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mascota</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fichas.map((ficha) => (
              <tr key={ficha.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-800">{ficha.fecha_apertura}</div>
                      {ficha.fecha_cierre && (
                        <div className="text-xs text-gray-400">Cierre: {ficha.fecha_cierre}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-800">{ficha.groomer}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-pink-400" />
                    <span className="text-sm font-medium text-gray-800">{ficha.mascota}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <ScissorsIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{ficha.servicio}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                    ficha.estado === 'abierta'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ficha.estado === 'abierta' ? (
                      <CheckCircleIcon className="h-3 w-3" />
                    ) : (
                      <XCircleIcon className="h-3 w-3" />
                    )}
                    {ficha.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onVerDetalle(ficha.id)}
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