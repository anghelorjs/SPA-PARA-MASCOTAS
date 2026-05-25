// src/pages/admin/catalogo/insumos/hooks/useInsumosAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { adminInsumosService } from '../services/admin.insumos.service';
import type { 
  Insumo, 
  CreateInsumoData, 
  UpdateInsumoData,
  AjustarStockData,
  ConsumoHistorico
} from '../../../../../services/types/admin';

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

export const useInsumosAdmin = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSearch, setFiltroSearch] = useState('');
  const [filtroBajoStock, setFiltroBajoStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadInsumos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminInsumosService.getInsumos({
        categoria: filtroCategoria || undefined,
        search: filtroSearch || undefined,
        bajo_stock: filtroBajoStock || undefined,
        page: currentPage,
      });
      setInsumos(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar insumos'), 'error');
      setInsumos([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroCategoria, filtroSearch, filtroBajoStock, currentPage, showToast]);

  const cambiarFiltroCategoria = useCallback((categoria: string) => {
    setFiltroCategoria(categoria);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroSearch = useCallback((search: string) => {
    setFiltroSearch(search);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroBajoStock = useCallback((bajoStock: boolean) => {
    setFiltroBajoStock(bajoStock);
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  const crearInsumo = useCallback(async (data: CreateInsumoData): Promise<boolean> => {
    try {
      await adminInsumosService.createInsumo(data);
      showToast('Insumo creado exitosamente', 'success');
      await loadInsumos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear insumo'), 'error');
      return false;
    }
  }, [loadInsumos, showToast]);

  const actualizarInsumo = useCallback(async (id: number, data: UpdateInsumoData): Promise<boolean> => {
    try {
      await adminInsumosService.updateInsumo(id, data);
      showToast('Insumo actualizado exitosamente', 'success');
      await loadInsumos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar insumo'), 'error');
      return false;
    }
  }, [loadInsumos, showToast]);

  const ajustarStock = useCallback(async (id: number, data: AjustarStockData): Promise<boolean> => {
    try {
      await adminInsumosService.ajustarStock(id, data);
      showToast('Stock ajustado correctamente', 'success');
      await loadInsumos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al ajustar stock'), 'error');
      return false;
    }
  }, [loadInsumos, showToast]);

  const eliminarInsumo = useCallback(async (id: number, nombre: string): Promise<boolean> => {
    if (!confirm(`¿Estás seguro de eliminar el insumo "${nombre}"?`)) return false;
    
    try {
      await adminInsumosService.deleteInsumo(id);
      showToast('Insumo eliminado correctamente', 'success');
      await loadInsumos();
      return true;
    } catch (error) {
      const message = getErrorMessage(error, 'Error al eliminar insumo');
      showToast(message, 'error');
      return false;
    }
  }, [loadInsumos, showToast]);

  useEffect(() => {
    loadInsumos();
  }, [loadInsumos]);

  return {
    insumos,
    filtroCategoria,
    filtroSearch,
    filtroBajoStock,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFiltroCategoria,
    cambiarFiltroSearch,
    cambiarFiltroBajoStock,
    cambiarPagina,
    crearInsumo,
    actualizarInsumo,
    ajustarStock,
    eliminarInsumo,
    refresh: loadInsumos,
  };
};