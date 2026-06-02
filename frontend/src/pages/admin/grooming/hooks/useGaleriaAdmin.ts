// src/pages/admin/grooming/hooks/useGaleriaAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { adminGroomingService } from '../services/admin.grooming.service';
import type { FotoAdmin, TipoFoto } from '../../../../services/types/admin';
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

export const useGaleriaAdmin = () => {
  const [fotos, setFotos] = useState<FotoAdmin[]>([]);
  const [tiposFoto, setTiposFoto] = useState<TipoFoto[]>([]);
  const [mascotaSearch, setMascotaSearch] = useState('');
  const [groomerId, setGroomerId] = useState<number | undefined>(undefined);
  const [tipoFoto, setTipoFoto] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadTiposFoto = useCallback(async () => {
    try {
      const data = await adminGroomingService.getTiposFoto();
      setTiposFoto(data);
    } catch (error) {
      console.error('Error al cargar tipos de foto:', error);
    }
  }, []);

  const loadFotos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminGroomingService.getGaleria({
        mascota_search: mascotaSearch || undefined,
        groomer_id: groomerId,
        tipo: tipoFoto || undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        page: currentPage,
      });
      setFotos(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar galería'), 'error');
      setFotos([]);
    } finally {
      setIsLoading(false);
    }
  }, [mascotaSearch, groomerId, tipoFoto, fechaDesde, fechaHasta, currentPage, showToast]);

  const eliminarFoto = useCallback(async (fotoId: number): Promise<boolean> => {
    if (!confirm('¿Estás seguro de eliminar esta foto? Esta acción no se puede deshacer.')) return false;
    
    try {
      await adminGroomingService.deleteFoto(fotoId);
      showToast('Foto eliminada correctamente', 'success');
      await loadFotos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al eliminar foto'), 'error');
      return false;
    }
  }, [loadFotos, showToast]);

  const limpiarFiltros = useCallback(() => {
    setMascotaSearch('');
    setGroomerId(undefined);
    setTipoFoto('');
    setFechaDesde('');
    setFechaHasta('');
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  useEffect(() => {
    loadTiposFoto();
  }, [loadTiposFoto]);

  useEffect(() => {
    loadFotos();
  }, [loadFotos]);

  const tieneFiltrosActivos = mascotaSearch !== '' || groomerId !== undefined || tipoFoto !== '' || fechaDesde !== '' || fechaHasta !== '';

  return {
    fotos,
    tiposFoto,
    mascotaSearch,
    groomerId,
    tipoFoto,
    fechaDesde,
    fechaHasta,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    setMascotaSearch,
    setGroomerId,
    setTipoFoto,
    setFechaDesde,
    setFechaHasta,
    limpiarFiltros,
    cambiarPagina,
    eliminarFoto,
    refresh: loadFotos,
  };
};