// src/pages/groomer/perfil/pages/PerfilGroomer.tsx
import { usePerfilGroomer } from '../hooks/usePerfilGroomer';
import { PerfilForm } from '../components/PerfilForm';
import { PasswordForm } from '../components/PasswordForm';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

export const PerfilGroomer = () => {
  const {
    perfil,
    isLoading,
    isSaving,
    isChangingPassword,
    updatePerfil,
    changePassword,
  } = usePerfilGroomer();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!perfil) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos Personales */}
        <PerfilForm
          initialData={{
            nombre: perfil.nombre,
            apellido: perfil.apellido,
            email: perfil.email,
            telefono: perfil.telefono,
            especialidad: perfil.especialidad,
            max_servicios_simultaneos: perfil.max_servicios_simultaneos,
          }}
          onSave={updatePerfil}
          isSaving={isSaving}
        />

        {/* Cambiar Contraseña */}
        <PasswordForm
          onChangePassword={changePassword}
          isChangingPassword={isChangingPassword}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          📌 Nota: Solo el teléfono puede ser editado. La especialidad y el máximo de servicios simultáneos son gestionados por el administrador.
        </p>
      </div>
    </div>
  );
};