// src/pages/admin/configuracion/usuarios/pages/UsuariosPage.tsx
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useUsuarios } from '../hooks/useUsuarios';
import { UsuariosTable } from '../components/UsuariosTable';
import { FiltrosUsuarios } from '../components/FiltrosUsuarios';
import { UsuarioFormModal } from '../components/UsuarioFormModal';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import Pagination from '../../../../../components/common/Pagination';
import type { CreateUsuarioData, UpdateUsuarioData, Usuario } from '../services/admin.usuarios.service';

export const UsuariosPage = () => {
  const {
    usuarios,
    isLoading,
    total,
    currentPage,
    lastPage,
    roles,
    filtros,
    createUsuario,
    updateUsuario,
    resetPassword,
    changePage,
    changeFiltros,
  } = useUsuarios();

  const [modalOpen, setModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleNewUser = () => {
    setSelectedUsuario(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleResetPassword = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setResetModalOpen(true);
  };

  const handleToggleActive = async (usuario: Usuario) => {
    await updateUsuario(usuario.idUsuario, { activo: !usuario.activo });
  };

  const handleSaveUser = async (data: CreateUsuarioData | UpdateUsuarioData) => {
    if (isEditing && selectedUsuario) {
      return await updateUsuario(selectedUsuario.idUsuario, data);
    } else {
      return await createUsuario(data as CreateUsuarioData);
    }
  };

  const handleReset = async (newPassword: string) => {
    if (selectedUsuario) {
      return await resetPassword(selectedUsuario.idUsuario, newPassword);
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de usuarios y roles del sistema
          </p>
        </div>
        <button
          onClick={handleNewUser}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      <FiltrosUsuarios
        roles={roles}
        filtros={filtros}
        onFiltroChange={changeFiltros}
      />

      <UsuariosTable
        usuarios={usuarios}
        isLoading={isLoading}
        onEdit={handleEdit}
        onResetPassword={handleResetPassword}
        onToggleActive={handleToggleActive}
      />

      {lastPage > 1 && (
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          onPageChange={changePage}
        />
      )}

      <UsuarioFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        usuario={selectedUsuario}
        roles={roles}
        isEditing={isEditing}
      />

      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onReset={handleReset}
        usuario={selectedUsuario}
      />
    </div>
  );
};
