// src/pages/cliente/perfil/pages/PerfilCliente.tsx
import { usePerfilCliente } from '../hooks/usePerfilCliente';
import { PerfilForm } from '../components/PerfilForm';
import { PasswordForm } from '../components/PasswordForm';
import { NotificacionesList } from '../components/NotificacionesList';
import { MascotasResumen } from '../components/MascotasResumen';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

export const PerfilCliente = () => {
  const {
    perfil,
    isLoading,
    isSaving,
    isChangingPassword,
    updatePerfil,
    changePassword,
    marcarNotificacion,
  } = usePerfilCliente();

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
            direccion: perfil.direccion,
            canal_contacto: perfil.canal_contacto,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mis Mascotas */}
        <MascotasResumen mascotas={perfil.mascotas} />

        {/* Notificaciones */}
        <NotificacionesList
          notificaciones={perfil.notificaciones}
          onMarcarLeida={marcarNotificacion}
        />
      </div>
    </div>
  );
};