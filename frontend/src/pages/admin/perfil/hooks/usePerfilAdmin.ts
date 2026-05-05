// src/pages/admin/perfil/hooks/usePerfilAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { adminPerfilService } from '../services/admin.perfil.service';
import type { PerfilAdminData, UpdatePerfilData, UpdatePasswordData, ReporteData } from '../services/admin.perfil.service';
import { useToast } from '../../../../hooks/useToast';

export const usePerfilAdmin = () => {
  const [perfil, setPerfil] = useState<PerfilAdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [reportes, setReportes] = useState<ReporteData | null>(null);
  const [isLoadingReportes, setIsLoadingReportes] = useState(false);
  const { showToast } = useToast();

  // Cargar perfil
  const loadPerfil = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminPerfilService.getPerfil();
      setPerfil(data);
    } catch (error: any) {
      showToast(error.message || 'Error al cargar el perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Actualizar perfil
  const updatePerfil = async (data: UpdatePerfilData) => {
    try {
      setIsSaving(true);
      const updated = await adminPerfilService.updatePerfil(data);
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
      await adminPerfilService.updatePassword(data);
      showToast('Contraseña actualizada correctamente', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Error al cambiar la contraseña', 'error');
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Cargar reportes
  const loadReportes = useCallback(async (page: number = 1, tipoReporte?: string) => {
    try {
      setIsLoadingReportes(true);
      const data = await adminPerfilService.getReportes(page, tipoReporte);
      setReportes(data);
    } catch (error: any) {
      showToast(error.message || 'Error al cargar los reportes', 'error');
    } finally {
      setIsLoadingReportes(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPerfil();
  }, [loadPerfil]);

  return {
    perfil,
    isLoading,
    isSaving,
    isChangingPassword,
    reportes,
    isLoadingReportes,
    updatePerfil,
    changePassword,
    loadReportes,
    loadPerfil,
  };
};
