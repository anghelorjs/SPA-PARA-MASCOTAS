// src/pages/groomer/agenda/hooks/useAgendaGroomer.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { groomerAgendaService } from '../services/groomer.agenda.service';
import { getFiltroQuery, type FiltroEstado } from '../types';
import type { CitaGroomer } from '../../../../services/types/groomer';
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

export const useAgendaGroomer = () => {
  // ✅ CORREGIDO: inicializar citas como array vacío
  const [citas, setCitas] = useState<CitaGroomer[]>([]);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { showToast } = useToast();

  // Cargar citas
  const loadCitas = useCallback(async () => {
    try {
      setIsLoading(true);
      const estadoQuery = getFiltroQuery(filtroEstado);
      const response = await groomerAgendaService.getCitas(fecha, estadoQuery, currentPage);
      
      // ✅ Asegurar que siempre sea un array
      setCitas(response.data || []);
      setLastPage(response.last_page || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      showToast(getErrorMessage(error, 'Error al cargar las citas'), 'error');
      setCitas([]); // ✅ En caso de error, array vacío
    } finally {
      setIsLoading(false);
    }
  }, [fecha, filtroEstado, currentPage, showToast]);

  // Cambiar fecha
  const cambiarFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha);
    setCurrentPage(1);
  }, []);

  // Cambiar filtro de estado
  const cambiarFiltroEstado = useCallback((nuevoFiltro: FiltroEstado) => {
    setFiltroEstado(nuevoFiltro);
    setCurrentPage(1);
  }, []);

  // Cambiar página
  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  // Iniciar servicio (crear ficha)
  const iniciarServicio = useCallback(async (citaId: number): Promise<number | null> => {
    try {
      setIsLoadingAction(true);
      const response = await groomerAgendaService.iniciarServicio(citaId);
      showToast('Servicio iniciado correctamente. Redirigiendo a la ficha...', 'success');
      await loadCitas();
      return response.ficha_id;
    } catch (error) {
      console.error('Error al iniciar servicio:', error);
      showToast(getErrorMessage(error, 'Error al iniciar el servicio'), 'error');
      return null;
    } finally {
      setIsLoadingAction(false);
    }
  }, [loadCitas, showToast]);

  // Recargar después de acciones externas
  const refresh = useCallback(() => {
    loadCitas();
  }, [loadCitas]);

  // Cargar citas al montar o cuando cambien dependencias
  useEffect(() => {
    loadCitas();
  }, [loadCitas]);

  return {
    // Estado
    citas,
    fecha,
    filtroEstado,
    isLoading,
    isLoadingAction,
    currentPage,
    lastPage,
    total,
    
    // Acciones
    cambiarFecha,
    cambiarFiltroEstado,
    cambiarPagina,
    iniciarServicio,
    refresh,
  };
};