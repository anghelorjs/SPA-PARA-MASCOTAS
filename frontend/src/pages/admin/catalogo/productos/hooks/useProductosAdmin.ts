// src/pages/admin/catalogo/productos/hooks/useProductosAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { adminProductosService } from '../services/admin.productos.service';
import type { 
  Producto, 
  VarianteProducto,
  CreateProductoData, 
  UpdateProductoData,
  CreateVarianteData,
  UpdateVarianteData
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

export const useProductosAdmin = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSearch, setFiltroSearch] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadProductos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminProductosService.getProductos({
        categoria: filtroCategoria || undefined,
        search: filtroSearch || undefined,
        activo: filtroActivo,
        page: currentPage,
      });
      setProductos(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar productos'), 'error');
      setProductos([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroCategoria, filtroSearch, filtroActivo, currentPage, showToast]);

  const cambiarFiltroCategoria = useCallback((categoria: string) => {
    setFiltroCategoria(categoria);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroSearch = useCallback((search: string) => {
    setFiltroSearch(search);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroActivo = useCallback((activo: boolean | undefined) => {
    setFiltroActivo(activo);
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  const crearProducto = useCallback(async (data: CreateProductoData): Promise<boolean> => {
    try {
      await adminProductosService.createProducto(data);
      showToast('Producto creado exitosamente', 'success');
      await loadProductos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear producto'), 'error');
      return false;
    }
  }, [loadProductos, showToast]);

  const actualizarProducto = useCallback(async (id: number, data: UpdateProductoData): Promise<boolean> => {
    try {
      await adminProductosService.updateProducto(id, data);
      showToast('Producto actualizado exitosamente', 'success');
      await loadProductos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar producto'), 'error');
      return false;
    }
  }, [loadProductos, showToast]);

  const toggleProducto = useCallback(async (id: number): Promise<boolean> => {
    try {
      const producto = await adminProductosService.toggleProducto(id);
      showToast(`Producto ${producto.activo ? 'activado' : 'desactivado'} correctamente`, 'success');
      await loadProductos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cambiar estado'), 'error');
      return false;
    }
  }, [loadProductos, showToast]);

  const eliminarProducto = useCallback(async (id: number, nombre: string): Promise<boolean> => {
    if (!confirm(`¿Estás seguro de desactivar el producto "${nombre}"?`)) return false;
    
    try {
      await adminProductosService.deleteProducto(id);
      showToast('Producto desactivado correctamente', 'success');
      await loadProductos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al eliminar producto'), 'error');
      return false;
    }
  }, [loadProductos, showToast]);

  // ==================== VARIANTES ====================

  const crearVariante = useCallback(async (productoId: number, data: CreateVarianteData): Promise<VarianteProducto | null> => {
    try {
      const variante = await adminProductosService.createVariante(productoId, data);
      showToast('Variante creada exitosamente', 'success');
      await loadProductos();
      return variante;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear variante'), 'error');
      return null;
    }
  }, [loadProductos, showToast]);

  const actualizarVariante = useCallback(async (varianteId: number, data: UpdateVarianteData): Promise<VarianteProducto | null> => {
    try {
      const variante = await adminProductosService.updateVariante(varianteId, data);
      showToast('Variante actualizada exitosamente', 'success');
      await loadProductos();
      return variante;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar variante'), 'error');
      return null;
    }
  }, [loadProductos, showToast]);

  const eliminarVariante = useCallback(async (varianteId: number): Promise<boolean> => {
    if (!confirm('¿Estás seguro de eliminar esta variante?')) return false;
    
    try {
      await adminProductosService.deleteVariante(varianteId);
      showToast('Variante eliminada correctamente', 'success');
      await loadProductos();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al eliminar variante'), 'error');
      return false;
    }
  }, [loadProductos, showToast]);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  return {
    productos,
    filtroCategoria,
    filtroSearch,
    filtroActivo,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFiltroCategoria,
    cambiarFiltroSearch,
    cambiarFiltroActivo,
    cambiarPagina,
    crearProducto,
    actualizarProducto,
    toggleProducto,
    eliminarProducto,
    crearVariante,
    actualizarVariante,
    eliminarVariante,
    refresh: loadProductos,
  };
};