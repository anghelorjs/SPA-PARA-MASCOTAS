// src/pages/admin/clientes/mascotas/components/TablaMascotas.tsx
import { 
  EyeIcon, 
  PencilIcon, 
  HeartIcon, 
  ScaleIcon, 
  TagIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import type { MascotaAdmin } from '../../../../../services/types/admin';

interface TablaMascotasProps {
  mascotas: MascotaAdmin[];
  isLoading: boolean;
  onVerDetalle: (mascota: MascotaAdmin) => void;
  onEditar: (mascota: MascotaAdmin) => void;
}

export const TablaMascotas = ({ mascotas, isLoading, onVerDetalle, onEditar }: TablaMascotasProps) => {
  const getRangoNombre = (mascota: MascotaAdmin) => mascota.rangoPeso?.nombre || mascota.rango_nombre || 'No asignado';
  const getFechaNacimiento = (mascota: MascotaAdmin) => mascota.fechaNacimiento || mascota.fecha_nacimiento;
  const formatDate = (value?: string | null) => {
    if (!value) return 'No registrada';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando mascotas...</p>
        </div>
      </div>
    );
  }

  if (mascotas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay mascotas registradas
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mascota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dueño
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especie / Raza
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rango
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nacimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Cita
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mascotas.map((mascota) => (
              <tr key={mascota.idMascota} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <HeartIcon className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {mascota.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {mascota.idMascota}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                    {mascota.cliente?.user.nombre} {mascota.cliente?.user.apellido}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-800">{mascota.especie}</div>
                    <div className="text-xs text-gray-500">{mascota.raza || 'Raza no especificada'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ScaleIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{mascota.pesoKg} kg</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    <TagIcon className="h-3 w-3" />
                    {getRangoNombre(mascota)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                    {formatDate(getFechaNacimiento(mascota))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {mascota.ultima_cita ? (
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                        {mascota.ultima_cita}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {mascota.ultimo_servicio || 'Sin servicio'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Sin citas</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onVerDetalle(mascota)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver ficha completa"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditar(mascota)}
                      className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Editar mascota"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
