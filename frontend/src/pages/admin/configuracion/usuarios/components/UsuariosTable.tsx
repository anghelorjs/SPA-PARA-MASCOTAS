// src/pages/admin/configuracion/usuarios/components/UsuariosTable.tsx
import { PencilIcon, KeyIcon, UserMinusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import type { Usuario } from '../services/admin.usuarios.service';

interface UsuariosTableProps {
  usuarios: Usuario[];
  isLoading: boolean;
  onEdit: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
  onToggleActive: (usuario: Usuario) => void;
  onResendCredentials?: (usuario: Usuario) => void;
}

const rolLabels: Record<string, string> = {
  administrador: 'Administrador',
  recepcionista: 'Recepcionista',
  groomer: 'Groomer',
  cliente: 'Cliente',
};

const rolColors: Record<string, string> = {
  administrador: 'bg-purple-100 text-purple-800',
  recepcionista: 'bg-blue-100 text-blue-800',
  groomer: 'bg-green-100 text-green-800',
  cliente: 'bg-gray-100 text-gray-800',
};

export const UsuariosTable = ({
  usuarios,
  isLoading,
  onEdit,
  onResetPassword,
  onToggleActive,
  onResendCredentials,
}: UsuariosTableProps) => {
  // Manejador con confirmación para activar/desactivar
  const handleToggleActiveClick = (usuario: Usuario) => {
    const action = usuario.activo ? 'desactivar' : 'activar';
    const confirmMessage = `¿Estás seguro de que deseas ${action} al usuario "${usuario.nombre} ${usuario.apellido}"?`;
    
    if (window.confirm(confirmMessage)) {
      onToggleActive(usuario);
    }
  };

  // Manejador para reenviar credenciales
  const handleResendCredentialsClick = (usuario: Usuario) => {
    const confirmMessage = `¿Estás seguro de que deseas reenviar las credenciales a "${usuario.nombre} ${usuario.apellido}"?`;
    
    if (window.confirm(confirmMessage)) {
      onResendCredentials?.(usuario);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay usuarios registrados
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
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email / Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado / Verificación
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.idUsuario} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombre} {usuario.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {usuario.idUsuario}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{usuario.email}</div>
                  <div className="text-sm text-gray-500">{usuario.telefono || 'Sin teléfono'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${rolColors[usuario.rol]}`}>
                    {rolLabels[usuario.rol]}
                  </span>
                  {usuario.rol === 'groomer' && usuario.perfil_datos?.especialidad && (
                    <div className="text-xs text-gray-500 mt-1">
                      {usuario.perfil_datos.especialidad}
                    </div>
                  )}
                  {usuario.rol === 'recepcionista' && usuario.perfil_datos?.turno && (
                    <div className="text-xs text-gray-500 mt-1 capitalize">
                      Turno: {usuario.perfil_datos.turno}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {/* Estado Activo/Inactivo */}
                    <span
                      className={`px-2 py-1 text-xs rounded-full w-fit ${
                        usuario.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    
                    {/* Estado de verificación de email (solo para recepcionistas/groomers) */}
                    {(usuario.rol === 'recepcionista' || usuario.rol === 'groomer') && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full w-fit ${
                          usuario.email_verified_at
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {usuario.email_verified_at ? 'Email verificado' : 'Email pendiente'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(usuario)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const confirmReset = window.confirm(
                          `¿Estás seguro de que deseas resetear la contraseña de "${usuario.nombre} ${usuario.apellido}"?`
                        );
                        if (confirmReset) {
                          onResetPassword(usuario);
                        }
                      }}
                      className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Resetear contraseña"
                    >
                      <KeyIcon className="h-4 w-4" />
                    </button>
                    {/* Botón de reenviar credenciales - solo para recepcionistas/groomers no verificados */}
                    {(usuario.rol === 'recepcionista' || usuario.rol === 'groomer') && !usuario.email_verified_at && onResendCredentials && (
                      <button
                        onClick={() => handleResendCredentialsClick(usuario)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Reenviar credenciales"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleActiveClick(usuario)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        usuario.activo
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={usuario.activo ? 'Desactivar' : 'Activar'}
                    >
                      <UserMinusIcon className="h-4 w-4" />
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