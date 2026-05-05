// src/pages/groomer/perfil/hooks/usePerfilGroomer.ts
import { useState, useEffect, useCallback } from 'react';
import { groomerPerfilService } from '../services/groomer.perfil.service';
import type {
  PerfilGroomerData,
  UpdatePerfilData,
  UpdatePasswordData
} from '../services/groomer.perfil.service';
import { useToast } from '../../../../hooks/useToast';

export const usePerfilGroomer = () => {
  const [perfil, setPerfil] = useState<PerfilGroomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { showToast } = useToast();

  // Cargar perfil
  const loadPerfil = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await groomerPerfilService.getPerfil();
      setPerfil(data);
    } catch (error: any) {
      showToast(error.message || 'Error al cargar el perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Actualizar perfil (solo teléfono)
  const updatePerfil = async (data: UpdatePerfilData) => {
    try {
      setIsSaving(true);
      const updated = await groomerPerfilService.updatePerfil(data);
      setPerfil(prev => prev ? { ...prev, ...updated } : null);
      showToast('Perfil actualizado correctamente', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar el perfil', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Cambiar contraseña
  const changePassword = async (data: UpdatePasswordData) => {
    try {
      setIsChangingPassword(true);
      await groomerPerfilService.updatePassword(data);
      showToast('Contraseña actualizada correctamente', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Error al cambiar la contraseña', 'error');
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    loadPerfil();
  }, [loadPerfil]);

  return {
    perfil,
    isLoading,
    isSaving,
    isChangingPassword,
    updatePerfil,
    changePassword,
    loadPerfil,
  };
};
