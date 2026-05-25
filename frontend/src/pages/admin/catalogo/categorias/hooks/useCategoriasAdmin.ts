// src/pages/admin/catalogo/categorias/hooks/useCategoriasAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { adminCategoriasService } from '../services/admin.categorias.service';
import type { Categoria, CreateCategoriaData, UpdateCategoriaData } from '../../../../../services/types/admin';

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

export const useCategoriasAdmin = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'producto' | 'insumo' | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadCategorias = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminCategoriasService.getCategorias(filtroTipo || undefined, currentPage);
      setCategorias(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar categorías'), 'error');
      setCategorias([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroTipo, currentPage, showToast]);

  const cambiarFiltroTipo = useCallback((tipo: 'producto' | 'insumo' | '') => {
    setFiltroTipo(tipo);
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  const crearCategoria = useCallback(async (data: CreateCategoriaData): Promise<boolean> => {
    try {
      await adminCategoriasService.createCategoria(data);
      showToast('Categoría creada exitosamente', 'success');
      await loadCategorias();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear categoría'), 'error');
      return false;
    }
  }, [loadCategorias, showToast]);

  const actualizarCategoria = useCallback(async (id: number, data: UpdateCategoriaData): Promise<boolean> => {
    try {
      await adminCategoriasService.updateCategoria(id, data);
      showToast('Categoría actualizada exitosamente', 'success');
      await loadCategorias();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar categoría'), 'error');
      return false;
    }
  }, [loadCategorias, showToast]);

  const eliminarCategoria = useCallback(async (id: number, nombre: string): Promise<boolean> => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) return false;
    
    try {
      await adminCategoriasService.deleteCategoria(id);
      showToast('Categoría eliminada exitosamente', 'success');
      await loadCategorias();
      return true;
    } catch (error) {
      const message = getErrorMessage(error, 'Error al eliminar categoría');
      showToast(message, 'error');
      return false;
    }
  }, [loadCategorias, showToast]);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  return {
    categorias,
    filtroTipo,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFiltroTipo,
    cambiarPagina,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    refresh: loadCategorias,
  };
};