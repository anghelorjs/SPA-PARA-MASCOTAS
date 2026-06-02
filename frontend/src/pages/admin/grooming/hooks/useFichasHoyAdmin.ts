// src/pages/admin/grooming/hooks/useFichasHoyAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { adminGroomingService } from '../services/admin.grooming.service';
import type { FichaHoyAdmin } from '../../../../services/types/admin';
import { toDateInputValue } from '../../../recepcionista/agenda/utils/date';

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

export const useFichasHoyAdmin = () => {
  const [fichas, setFichas] = useState<FichaHoyAdmin[]>([]);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const [groomerId, setGroomerId] = useState<number | undefined>(undefined);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadFichas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminGroomingService.getFichasHoy({
        fecha,
        groomer_id: groomerId,
        estado: filtroEstado !== 'todas' ? filtroEstado : undefined,
      });
      setFichas(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar fichas del día'), 'error');
      setFichas([]);
    } finally {
      setIsLoading(false);
    }
  }, [fecha, groomerId, filtroEstado, showToast]);

  const cambiarFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha);
  }, []);

  const cambiarGroomer = useCallback((id: number | undefined) => {
    setGroomerId(id);
  }, []);

  const cambiarFiltroEstado = useCallback((estado: string) => {
    setFiltroEstado(estado);
  }, []);

  useEffect(() => {
    loadFichas();
  }, [loadFichas]);

  return {
    fichas,
    fecha,
    groomerId,
    filtroEstado,
    isLoading,
    cambiarFecha,
    cambiarGroomer,
    cambiarFiltroEstado,
    refresh: loadFichas,
  };
};