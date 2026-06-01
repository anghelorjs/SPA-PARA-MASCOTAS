import {
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  HeartIcon,
  PhoneIcon,
  ScissorsIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { ClienteRecepcionista } from '../services/recepcionista.clientes.service';

interface Props {
  clientes: ClienteRecepcionista[];
  isLoading: boolean;
  onVerPerfil: (cliente: ClienteRecepcionista) => void;
}

const canalLabel: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  email: 'Email',
  sms: 'SMS',
};

const getCanalIcon = (canal?: string | null) => {
  if (canal === 'email') return <EnvelopeIcon className="h-4 w-4 text-purple-500" />;
  if (canal === 'telegram' || canal === 'sms') return <DevicePhoneMobileIcon className="h-4 w-4 text-blue-500" />;
  return <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-500" />;
};

export const TablaClientesRecepcion = ({ clientes, isLoading, onVerPerfil }: Props) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-gray-500">Cargando clientes...</p>
      </div>
    );
  }

  if (clientes.length === 0) {
    return <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No hay clientes registrados</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nombre', 'Teléfono', 'Email', 'Canal', 'Mascotas', 'Última cita'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <tr
                key={cliente.idCliente}
                onClick={() => onVerPerfil(cliente)}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {cliente.user.nombre} {cliente.user.apellido}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-1">
                    <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                    {cliente.user.telefono || 'No registrado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{cliente.user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                    {getCanalIcon(cliente.canalContacto)}
                    {canalLabel[cliente.canalContacto || 'whatsapp'] || 'No definido'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                    <HeartIcon className="h-4 w-4 text-pink-500" />
                    {cliente.cant_mascotas}
                  </span>
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
                        {cliente.ultimo_servicio || cliente.ultima_cita_servicio || 'Sin servicio'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Sin citas</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
