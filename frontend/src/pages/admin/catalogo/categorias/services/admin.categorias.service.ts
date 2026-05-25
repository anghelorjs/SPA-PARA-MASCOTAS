// src/pages/admin/catalogo/categorias/services/admin.categorias.service.ts
import api from '../../../../../services/api';
import type { Categoria, CreateCategoriaData, UpdateCategoriaData } from '../../../../../services/types/admin';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const adminCategoriasService = {
  /**
   * Obtener listado de categorías
   * @param tipo - Filtrar por tipo ('producto' o 'insumo')
   * @param page - Número de página
   */
  async getCategorias(tipo?: string, page: number = 1): Promise<PaginatedResponse<Categoria>> {
    const params: Record<string, any> = { page, per_page: 15 };
    if (tipo) params.tipo = tipo;
    const response = await api.get<ApiResponse<PaginatedResponse<Categoria>>>('/admin/catalogo/categorias', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de una categoría
   * @param id - ID de la categoría
   */
  async getCategoria(id: number): Promise<Categoria> {
    const response = await api.get<ApiResponse<Categoria>>(`/admin/catalogo/categorias/${id}`);
    return response.data.data;
  },

  /**
   * Crear nueva categoría
   * @param data - Datos de la categoría
   */
  async createCategoria(data: CreateCategoriaData): Promise<Categoria> {
    const response = await api.post<ApiResponse<Categoria>>('/admin/catalogo/categorias', data);
    return response.data.data;
  },

  /**
   * Actualizar categoría
   * @param id - ID de la categoría
   * @param data - Datos a actualizar
   */
  async updateCategoria(id: number, data: UpdateCategoriaData): Promise<Categoria> {
    const response = await api.put<ApiResponse<Categoria>>(`/admin/catalogo/categorias/${id}`, data);
    return response.data.data;
  },

  /**
   * Eliminar categoría
   * @param id - ID de la categoría
   */
  async deleteCategoria(id: number): Promise<void> {
    await api.delete(`/admin/catalogo/categorias/${id}`);
  },
};