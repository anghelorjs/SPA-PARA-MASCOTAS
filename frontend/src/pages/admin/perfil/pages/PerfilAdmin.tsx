// src/pages/admin/perfil/pages/PerfilAdmin.tsx
import { useState, useEffect } from 'react';
import { usePerfilAdmin } from '../hooks/usePerfilAdmin';
import { PerfilForm } from '../components/PerfilForm';
import { PasswordForm } from '../components/PasswordForm';
import { ReportesGenerados } from '../components/ReportesGenerados';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

export const PerfilAdmin = () => {
  const {
    perfil,
    isLoading,
    isSaving,
    isChangingPassword,
    reportes,
    isLoadingReportes,
    updatePerfil,
    changePassword,
    loadReportes,
  } = usePerfilAdmin();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTipo, setSelectedTipo] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadReportes(currentPage, selectedTipo);
  }, [currentPage, selectedTipo, loadReportes]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTipoChange = (tipo: string | undefined) => {
    setSelectedTipo(tipo);
    setCurrentPage(1);
  };

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

      {/* Reportes Generados */}
      <ReportesGenerados
        reportes={reportes?.data || []}
        total={reportes?.total || 0}
        currentPage={reportes?.current_page || 1}
        lastPage={reportes?.last_page || 1}
        onPageChange={handlePageChange}
        onTipoChange={handleTipoChange}
        isLoading={isLoadingReportes}
      />
    </div>
  );
};