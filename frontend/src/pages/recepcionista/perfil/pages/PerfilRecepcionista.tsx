// src/pages/recepcionista/perfil/pages/PerfilRecepcionista.tsx
import { usePerfilRecepcionista } from '../hooks/usePerfilRecepcionista';
import { PerfilForm } from '../components/PerfilForm';
import { PasswordForm } from '../components/PasswordForm';
import { ResumenDia } from '../components/ResumenDia';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

export const PerfilRecepcionista = () => {
  const {
    perfil,
    resumenDia,
    isLoading,
    isLoadingResumen,
    isSaving,
    isChangingPassword,
    updatePerfil,
    changePassword,
  } = usePerfilRecepcionista();

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
            turno_descripcion: perfil.turno_descripcion,
            citas_gestionadas_hoy: perfil.citas_gestionadas_hoy,
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
        {/* Resumen del Día */}
        <ResumenDia data={resumenDia!} isLoading={isLoadingResumen} />
    </div>
  );
};