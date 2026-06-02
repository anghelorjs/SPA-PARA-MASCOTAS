// src/pages/admin/grooming/hooks/useTodasFichasAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { adminGroomingService } from '../services/admin.grooming.service';
import type { FichaTodasAdmin } from '../../../../services/types/admin';

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

export const useTodasFichasAdmin = () => {
  const [fichas, setFichas] = useState<FichaTodasAdmin[]>([]);
  const [search, setSearch] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [groomerId, setGroomerId] = useState<number | undefined>(undefined);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadFichas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminGroomingService.getTodasFichas({
        search: search || undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        groomer_id: groomerId,
        estado: filtroEstado !== 'todas' ? filtroEstado : undefined,
        page: currentPage,
      });
      setFichas(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar fichas'), 'error');
      setFichas([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, fechaDesde, fechaHasta, groomerId, filtroEstado, currentPage, showToast]);

  const aplicarFiltros = useCallback(() => {
    setCurrentPage(1);
    loadFichas();
  }, [loadFichas]);

  const limpiarFiltros = useCallback(() => {
    setSearch('');
    setFechaDesde('');
    setFechaHasta('');
    setGroomerId(undefined);
    setFiltroEstado('todas');
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  useEffect(() => {
    loadFichas();
  }, [loadFichas]);

  const tieneFiltrosActivos = search !== '' || fechaDesde !== '' || fechaHasta !== '' || groomerId !== undefined || filtroEstado !== 'todas';

  return {
    fichas,
    search,
    fechaDesde,
    fechaHasta,
    groomerId,
    filtroEstado,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    setSearch,
    setFechaDesde,
    setFechaHasta,
    setGroomerId,
    setFiltroEstado,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    refresh: loadFichas,
  };
};