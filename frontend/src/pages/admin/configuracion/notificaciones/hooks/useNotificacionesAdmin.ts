// src/pages/admin/configuracion/notificaciones/hooks/useNotificacionesAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { adminNotificacionesService } from '../services/admin.notificaciones.service';
import type { 
  NotificacionAdmin, 
  TipoNotificacionOption, 
  CanalNotificacionOption 
} from '../../../../../services/types/admin';
import { toDateInputValue } from '../../../../recepcionista/agenda/utils/date';

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

export const useNotificacionesAdmin = () => {
  const [notificaciones, setNotificaciones] = useState<NotificacionAdmin[]>([]);
  const [tipos, setTipos] = useState<TipoNotificacionOption[]>([]);
  const [canales, setCanales] = useState<CanalNotificacionOption[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroCanal, setFiltroCanal] = useState<string>('');
  const [filtroEntregada, setFiltroEntregada] = useState<boolean | undefined>(undefined);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
  const [filtroClienteSearch, setFiltroClienteSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadNotificaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminNotificacionesService.getNotificaciones({
        tipo: filtroTipo || undefined,
        canal: filtroCanal || undefined,
        entregada: filtroEntregada,
        fecha_desde: filtroFechaDesde || undefined,
        fecha_hasta: filtroFechaHasta || undefined,
        cliente_search: filtroClienteSearch || undefined,
        page: currentPage,
      });
      setNotificaciones(response.notificaciones.data);
      setTipos(response.tipos);
      setCanales(response.canales);
      setLastPage(response.notificaciones.last_page);
      setTotal(response.notificaciones.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar notificaciones'), 'error');
      setNotificaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroTipo, filtroCanal, filtroEntregada, filtroFechaDesde, filtroFechaHasta, filtroClienteSearch, currentPage, showToast]);

  const cambiarFiltroTipo = useCallback((tipo: string) => {
    setFiltroTipo(tipo);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroCanal = useCallback((canal: string) => {
    setFiltroCanal(canal);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroEntregada = useCallback((entregada: boolean | undefined) => {
    setFiltroEntregada(entregada);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroFechaDesde = useCallback((fecha: string) => {
    setFiltroFechaDesde(fecha);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroFechaHasta = useCallback((fecha: string) => {
    setFiltroFechaHasta(fecha);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroClienteSearch = useCallback((search: string) => {
    setFiltroClienteSearch(search);
    setCurrentPage(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltroTipo('');
    setFiltroCanal('');
    setFiltroEntregada(undefined);
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroClienteSearch('');
    setCurrentPage(1);
  }, []);

  const reenviarNotificacion = useCallback(async (id: number): Promise<boolean> => {
    try {
      await adminNotificacionesService.reenviarNotificacion(id);
      showToast('Notificación reenviada correctamente', 'success');
      await loadNotificaciones();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al reenviar notificación'), 'error');
      return false;
    }
  }, [loadNotificaciones, showToast]);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  useEffect(() => {
    loadNotificaciones();
  }, [loadNotificaciones]);

  const tieneFiltrosActivos = filtroTipo !== '' || filtroCanal !== '' || filtroEntregada !== undefined || 
                              filtroFechaDesde !== '' || filtroFechaHasta !== '' || filtroClienteSearch !== '';

  return {
    notificaciones,
    tipos,
    canales,
    filtroTipo,
    filtroCanal,
    filtroEntregada,
    filtroFechaDesde,
    filtroFechaHasta,
    filtroClienteSearch,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    cambiarFiltroTipo,
    cambiarFiltroCanal,
    cambiarFiltroEntregada,
    cambiarFiltroFechaDesde,
    cambiarFiltroFechaHasta,
    cambiarFiltroClienteSearch,
    limpiarFiltros,
    reenviarNotificacion,
    cambiarPagina,
    refresh: loadNotificaciones,
  };
};