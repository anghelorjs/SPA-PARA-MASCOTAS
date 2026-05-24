// src/pages/cliente/mascotas/hooks/useMascotasCliente.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { clienteMascotasService } from '../services/cliente.mascotas.service';
import type { Mascota, DetalleMascotaResponse, CreateMascotaData, UpdateMascotaData, RangoPesoCliente } from '../../../../services/types/cliente';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
};

export const useMascotasCliente = () => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [rangosPeso, setRangosPeso] = useState<RangoPesoCliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRangos, setIsLoadingRangos] = useState(true);
  const { showToast } = useToast();

  const loadMascotas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clienteMascotasService.getMascotas();
      setMascotas(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar mascotas'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const loadRangosPeso = useCallback(async () => {
    try {
      setIsLoadingRangos(true);
      const data = await clienteMascotasService.getRangosPeso();
      setRangosPeso(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar rangos de peso'), 'error');
    } finally {
      setIsLoadingRangos(false);
    }
  }, [showToast]);

  const crearMascota = useCallback(async (data: CreateMascotaData): Promise<boolean> => {
    try {
      const result = await clienteMascotasService.createMascota(data);
      showToast(`Mascota "${result.nombre}" creada exitosamente`, 'success');
      await loadMascotas();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear mascota'), 'error');
      return false;
    }
  }, [loadMascotas, showToast]);

  const actualizarMascota = useCallback(async (id: number, data: UpdateMascotaData): Promise<boolean> => {
    try {
      await clienteMascotasService.updateMascota(id, data);
      showToast('Mascota actualizada exitosamente', 'success');
      await loadMascotas();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar mascota'), 'error');
      return false;
    }
  }, [loadMascotas, showToast]);

  const subirFotoPerfil = useCallback(async (id: number, file: File): Promise<string | null> => {
    try {
      const result = await clienteMascotasService.uploadFotoPerfil(id, file);
      showToast('Foto de perfil actualizada', 'success');
      await loadMascotas();
      return result.url;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al subir foto'), 'error');
      return null;
    }
  }, [loadMascotas, showToast]);

  useEffect(() => {
    loadMascotas();
    loadRangosPeso();
  }, [loadMascotas, loadRangosPeso]);

  return {
    mascotas,
    rangosPeso,
    isLoading,
    isLoadingRangos,
    crearMascota,
    actualizarMascota,
    subirFotoPerfil,
    refresh: loadMascotas,
    refreshRangos: loadRangosPeso,
  };
};

export const useDetalleMascota = (mascotaId: number | undefined) => {
  const [detalle, setDetalle] = useState<DetalleMascotaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadDetalle = useCallback(async () => {
    if (!mascotaId) return;
    try {
      setIsLoading(true);
      const data = await clienteMascotasService.getMascota(mascotaId);
      setDetalle(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar detalle de mascota'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [mascotaId, showToast]);

  useEffect(() => {
    loadDetalle();
  }, [loadDetalle]);

  return {
    detalle,
    isLoading,
    refresh: loadDetalle,
  };
};
