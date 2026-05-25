// src/pages/admin/catalogo/movimientos/hooks/useMovimientosAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { adminMovimientosService } from '../services/admin.movimientos.service';
import type { 
  MovimientoInventario, 
  CreateMovimientoData,
  TipoMovimiento,
  ProductoMovimiento
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

// ✅ Función helper para convertir a número
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const useMovimientosAdmin = () => {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [tiposMovimiento, setTiposMovimiento] = useState<TipoMovimiento[]>([]);
  const [filtroProducto, setFiltroProducto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadMovimientos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminMovimientosService.getMovimientos({
        producto_search: filtroProducto || undefined,
        tipoMovimiento: filtroTipo || undefined,
        fecha_desde: filtroFechaDesde || undefined,
        fecha_hasta: filtroFechaHasta || undefined,
        page: currentPage,
      });
      setMovimientos(response.movimientos.data);
      setTiposMovimiento(response.tipos_movimiento);
      setLastPage(response.movimientos.last_page);
      setTotal(response.movimientos.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar movimientos'), 'error');
      setMovimientos([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroProducto, filtroTipo, filtroFechaDesde, filtroFechaHasta, currentPage, showToast]);

  const cambiarFiltroProducto = useCallback((producto: string) => {
    setFiltroProducto(producto);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroTipo = useCallback((tipo: string) => {
    setFiltroTipo(tipo);
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

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltroProducto('');
    setFiltroTipo('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setCurrentPage(1);
  }, []);

  const crearMovimiento = useCallback(async (data: CreateMovimientoData): Promise<boolean> => {
    try {
      await adminMovimientosService.createMovimiento(data);
      showToast('Movimiento registrado correctamente', 'success');
      await loadMovimientos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al registrar movimiento'), 'error');
      return false;
    }
  }, [loadMovimientos, showToast]);

  useEffect(() => {
    loadMovimientos();
  }, [loadMovimientos]);

  const tieneFiltrosActivos = filtroProducto || filtroTipo || filtroFechaDesde || filtroFechaHasta;

  return {
    movimientos,
    tiposMovimiento,
    filtroProducto,
    filtroTipo,
    filtroFechaDesde,
    filtroFechaHasta,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    cambiarFiltroProducto,
    cambiarFiltroTipo,
    cambiarFiltroFechaDesde,
    cambiarFiltroFechaHasta,
    cambiarPagina,
    limpiarFiltros,
    crearMovimiento,
    refresh: loadMovimientos,
  };
};