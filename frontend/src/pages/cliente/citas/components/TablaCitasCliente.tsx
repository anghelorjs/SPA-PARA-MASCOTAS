// src/pages/cliente/citas/components/TablaCitasCliente.tsx
import { 
  CalendarIcon, 
  ClockIcon, 
  ScissorsIcon, 
  UserIcon, 
  HeartIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import type { CitaCliente } from '../../../../services/types/cliente';

interface TablaCitasClienteProps {
  citas: CitaCliente[];
  isLoading: boolean;
  tipoActivo: 'proximas' | 'pasadas' | 'canceladas';
  onVerDetalle: (citaId: number) => void;
  onCancelar: (cita: CitaCliente) => void;
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

export const TablaCitasCliente = ({ 
  citas, 
  isLoading, 
  tipoActivo, 
  onVerDetalle, 
  onCancelar 
}: TablaCitasClienteProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando citas...</p>
        </div>
      </div>
    );
  }

  if (citas.length === 0) {
    const mensajes = {
      proximas: 'No tienes citas programadas próximamente',
      pasadas: 'No hay citas pasadas para mostrar',
      canceladas: 'No hay citas canceladas para mostrar',
    };
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center text-gray-400">
          <CalendarIcon className="h-12 w-12 mx-auto mb-3" />
          <p className="text-sm">{mensajes[tipoActivo]}</p>
          {tipoActivo === 'proximas' && (
            <p className="text-xs mt-1">¡Agenda una nueva cita para tu mascota!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mascota</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groomer</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Duración</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {citas.map((cita) => {
              const precio = toNumber(cita.precio);
              
              return (
                <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{cita.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{cita.hora_inicio} - {cita.hora_fin}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <HeartIcon className="h-4 w-4 text-pink-400" />
                      <span className="text-sm font-medium text-gray-800">{cita.mascota}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ScissorsIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{cita.servicio}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{cita.groomer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">{cita.duracion} min</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CurrencyDollarIcon className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-sm font-semibold text-green-600">
                        Bs. {precio.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                      style={{ backgroundColor: `${cita.estado_color}20`, color: cita.estado_color }}
                    >
                      {cita.estado === 'programada' ? 'Programada' :
                       cita.estado === 'confirmada' ? 'Confirmada' :
                       cita.estado === 'en_curso' ? 'En curso' :
                       cita.estado === 'completada' ? 'Completada' :
                       cita.estado === 'cancelada' ? 'Cancelada' :
                       cita.estado === 'pendiente_confirmacion' ? 'Pendiente' : cita.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onVerDetalle(cita.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {cita.puede_cancelar && tipoActivo === 'proximas' && (
                        <button
                          onClick={() => onCancelar(cita)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar cita"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};