// src/pages/admin/clientes/clientes/components/TablaClientes.tsx
import { 
  EyeIcon, 
  PencilIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  ScissorsIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon as EmailIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import type { ClienteAdmin } from '../../../../../services/types/admin';

interface TablaClientesProps {
  clientes: ClienteAdmin[];
  isLoading: boolean;
  onVerDetalle: (cliente: ClienteAdmin) => void;
  onEditar: (cliente: ClienteAdmin) => void;
}

const getCanalIcon = (canal: string | null): { icon: React.ReactNode; color: string } => {
  switch (canal) {
    case 'whatsapp':
      return { icon: <ChatBubbleLeftRightIcon className="h-4 w-4" />, color: 'text-green-500' };
    case 'telegram':
      return { icon: <DevicePhoneMobileIcon className="h-4 w-4" />, color: 'text-blue-500' };
    case 'email':
      return { icon: <EmailIcon className="h-4 w-4" />, color: 'text-purple-500' };
    case 'sms':
      return { icon: <DevicePhoneMobileIcon className="h-4 w-4" />, color: 'text-gray-500' };
    default:
      return { icon: <QuestionMarkCircleIcon className="h-4 w-4" />, color: 'text-gray-400' };
  }
};

export const TablaClientes = ({ clientes, isLoading, onVerDetalle, onEditar }: TablaClientesProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay clientes registrados
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
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Canal
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mascotas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Cita
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map((cliente) => {
              const canalInfo = getCanalIcon(cliente.canalContacto);
              
              return (
                <tr key={cliente.idCliente} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.user.nombre} {cliente.user.apellido}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {cliente.idUsuario}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {cliente.user.telefono && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                        {cliente.user.telefono}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <EnvelopeIcon className="h-3.5 w-3.5 text-gray-400" />
                      {cliente.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <span className={`${canalInfo.color}`} title={cliente.canalContacto || 'No definido'}>
                        {canalInfo.icon}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <HeartIcon className="h-4 w-4 text-pink-400" />
                      <span className="text-sm font-medium text-gray-700">{cliente.cant_mascotas}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {cliente.ultima_cita ? (
                      <div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                          {cliente.ultima_cita}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <ScissorsIcon className="h-3 w-3" />
                          {cliente.ultima_cita_servicio || 'Sin servicio'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin citas</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      cliente.user.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onVerDetalle(cliente)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver perfil completo"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditar(cliente)}
                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Editar cliente"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
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