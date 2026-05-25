// src/pages/cliente/citas/hooks/useCitasCliente.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { clienteCitasService } from '../services/cliente.citas.service';
import type { CitaCliente, DetalleCitaCliente } from '../../../../services/types/cliente';

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

export const useCitasCliente = () => {
  const [citas, setCitas] = useState<CitaCliente[]>([]);
  const [tipoActivo, setTipoActivo] = useState<'proximas' | 'pasadas' | 'canceladas'>('proximas');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadCitas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clienteCitasService.getCitas(tipoActivo);
      setCitas(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar citas'), 'error');
      setCitas([]);
    } finally {
      setIsLoading(false);
    }
  }, [tipoActivo, showToast]);

  const cambiarTipo = useCallback((tipo: 'proximas' | 'pasadas' | 'canceladas') => {
    setTipoActivo(tipo);
  }, []);

  const cancelarCita = useCallback(async (id: number): Promise<boolean> => {
    try {
      await clienteCitasService.cancelarCita(id);
      showToast('Cita cancelada exitosamente', 'success');
      await loadCitas();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cancelar cita'), 'error');
      return false;
    }
  }, [loadCitas, showToast]);

  useEffect(() => {
    loadCitas();
  }, [loadCitas]);

  return {
    citas,
    tipoActivo,
    isLoading,
    cambiarTipo,
    cancelarCita,
    refresh: loadCitas,
  };
};

export const useDetalleCitaCliente = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cita, setCita] = useState<DetalleCitaCliente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const loadDetalle = useCallback(async (citaId: number) => {
    try {
      setIsLoading(true);
      const data = await clienteCitasService.getCita(citaId);
      setCita(data);
      setIsOpen(true);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar detalle de cita'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const cerrar = useCallback(() => {
    setIsOpen(false);
    setCita(null);
  }, []);

  return {
    isOpen,
    cita,
    isLoading,
    loadDetalle,
    cerrar,
  };
};