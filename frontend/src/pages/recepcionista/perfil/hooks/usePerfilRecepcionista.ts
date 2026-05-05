// src/pages/recepcionista/perfil/hooks/usePerfilRecepcionista.ts
import { useState, useEffect, useCallback } from 'react';
import { recepcionistaPerfilService } from '../services/recepcionista.perfil.service';
import type {
  PerfilRecepcionistaData,
  UpdatePerfilData,
  UpdatePasswordData,
  ResumenDiaData
} from '../services/recepcionista.perfil.service';
import { useToast } from '../../../../hooks/useToast';

export const usePerfilRecepcionista = () => {
  const [perfil, setPerfil] = useState<PerfilRecepcionistaData | null>(null);
  const [resumenDia, setResumenDia] = useState<ResumenDiaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResumen, setIsLoadingResumen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { showToast } = useToast();

  // Cargar perfil
  const loadPerfil = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await recepcionistaPerfilService.getPerfil();
      setPerfil(data);
    } catch (error: any) {
      showToast(error.message || 'Error al cargar el perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Cargar resumen del día
  const loadResumenDia = useCallback(async () => {
    try {
      setIsLoadingResumen(true);
      const data = await recepcionistaPerfilService.getResumenDia();
      setResumenDia(data);
    } catch (error: any) {
      showToast(error.message || 'Error al cargar el resumen del día', 'error');
    } finally {
      setIsLoadingResumen(false);
    }
  }, [showToast]);

  // Actualizar perfil
  const updatePerfil = async (data: UpdatePerfilData) => {
    try {
      setIsSaving(true);
      const updated = await recepcionistaPerfilService.updatePerfil(data);
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
      await recepcionistaPerfilService.updatePassword(data);
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
    loadResumenDia();
  }, [loadPerfil, loadResumenDia]);

  return {
    perfil,
    resumenDia,
    isLoading,
    isLoadingResumen,
    isSaving,
    isChangingPassword,
    updatePerfil,
    changePassword,
    loadPerfil,
    loadResumenDia,
  };
};
