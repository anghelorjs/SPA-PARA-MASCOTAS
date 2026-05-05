// src/pages/cliente/perfil/hooks/usePerfilCliente.ts
import { useState, useEffect, useCallback } from 'react';
import { clientePerfilService } from '../services/cliente.perfil.service';
import type {
  PerfilClienteData,
  UpdatePerfilData,
  UpdatePasswordData
} from '../services/cliente.perfil.service';
import { useToast } from '../../../../hooks/useToast';

export const usePerfilCliente = () => {
  const [perfil, setPerfil] = useState<PerfilClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { showToast } = useToast();

  // Cargar perfil
  const loadPerfil = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clientePerfilService.getPerfil();
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
      const updated = await clientePerfilService.updatePerfil(data);
      setPerfil(prev => prev ? {
        ...prev,
        ...updated,
      } : null);
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
      await clientePerfilService.updatePassword(data);
      showToast('Contraseña actualizada correctamente', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Error al cambiar la contraseña', 'error');
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Marcar notificación como leída
  const marcarNotificacion = async (notificacionId: number) => {
    try {
      await clientePerfilService.marcarNotificacion(notificacionId);
      setPerfil(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notificaciones: prev.notificaciones.map(notif =>
            notif.id === notificacionId ? { ...notif, leida: true } : notif
          ),
        };
      });
      showToast('Notificación marcada como leída', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error al marcar la notificación', 'error');
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
    marcarNotificacion,
    loadPerfil,
  };
};
