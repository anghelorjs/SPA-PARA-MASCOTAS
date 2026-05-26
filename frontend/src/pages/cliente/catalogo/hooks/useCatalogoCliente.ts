// src/pages/cliente/catalogo/hooks/useCatalogoCliente.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { clienteCatalogoService } from '../services/cliente.catalogo.service';
import type { ProductoCatalogo, CategoriaCatalogo } from '../../../../services/types/cliente';

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

export const useCatalogoCliente = () => {
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadProductos = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: { search?: string; categoria_id?: number } = {};
      if (searchTerm) params.search = searchTerm;
      if (categoriaSeleccionada) params.categoria_id = categoriaSeleccionada;
      
      const data = await clienteCatalogoService.getProductos(params);
      // ✅ Asegurar que los precios sean números
      const productosFormateados = data.map(producto => ({
        ...producto,
        precio_desde: toNumber(producto.precio_desde),
        variantes: producto.variantes.map(variante => ({
          ...variante,
          precio: toNumber(variante.precio)
        }))
      }));
      setProductos(productosFormateados);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar productos'), 'error');
      setProductos([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoriaSeleccionada, showToast]);

  const loadCategorias = useCallback(async () => {
    try {
      const data = await clienteCatalogoService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const limpiarFiltros = useCallback(() => {
    setSearchTerm('');
    setCategoriaSeleccionada(null);
  }, []);

  return {
    productos,
    categorias,
    searchTerm,
    categoriaSeleccionada,
    isLoading,
    setSearchTerm,
    setCategoriaSeleccionada,
    limpiarFiltros,
    refresh: loadProductos,
  };
};