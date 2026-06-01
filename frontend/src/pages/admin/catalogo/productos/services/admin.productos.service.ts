// src/pages/admin/catalogo/productos/services/admin.productos.service.ts
import api from '../../../../../services/api';
import type { 
  Producto, 
  VarianteProducto,
  CreateProductoData, 
  UpdateProductoData,
  CreateVarianteData,
  UpdateVarianteData
} from '../../../../../services/types/admin';

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

const buildProductoFormData = (data: CreateProductoData | UpdateProductoData): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'variantes') return;

    if (key === 'imagen' && value instanceof File) {
      formData.append('imagen', value);
      return;
    }

    if (key === 'imagenUrl' && data.imagen instanceof File) return;

    formData.append(key, String(value));
  });

  if ('variantes' in data && Array.isArray(data.variantes)) {
    data.variantes.forEach((variante, index) => {
      formData.append(`variantes[${index}][nombreVariante]`, variante.nombreVariante);
      formData.append(`variantes[${index}][precio]`, String(variante.precio));
      formData.append(`variantes[${index}][stock]`, String(variante.stock));
    });
  }

  return formData;
};

const hasImagenFile = (data: CreateProductoData | UpdateProductoData): boolean => data.imagen instanceof File;

export const adminProductosService = {
  /**
   * Obtener listado de productos
   */
  async getProductos(params?: {
    categoria?: string;
    search?: string;
    activo?: boolean;
    page?: number;
  }): Promise<PaginatedResponse<Producto>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Producto>>>('/admin/catalogo/productos', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de un producto
   */
  async getProducto(id: number): Promise<Producto> {
    const response = await api.get<ApiResponse<Producto>>(`/admin/catalogo/productos/${id}`);
    return response.data.data;
  },

  /**
   * Crear nuevo producto
   */
  async createProducto(data: CreateProductoData): Promise<Producto> {
    const payload = hasImagenFile(data) ? buildProductoFormData(data) : data;
    const response = await api.post<ApiResponse<Producto>>('/admin/catalogo/productos', payload, hasImagenFile(data) ? {
      headers: { 'Content-Type': 'multipart/form-data' },
    } : undefined);
    return response.data.data;
  },

  /**
   * Actualizar producto
   */
  async updateProducto(id: number, data: UpdateProductoData): Promise<Producto> {
    if (hasImagenFile(data)) {
      const payload = buildProductoFormData(data);
      payload.append('_method', 'PUT');
      const response = await api.post<ApiResponse<Producto>>(`/admin/catalogo/productos/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    }

    const response = await api.put<ApiResponse<Producto>>(`/admin/catalogo/productos/${id}`, data);
    return response.data.data;
  },

  /**
   * Activar/Desactivar producto
   */
  async toggleProducto(id: number): Promise<Producto> {
    const response = await api.post<ApiResponse<Producto>>(`/admin/catalogo/productos/${id}/toggle`);
    return response.data.data;
  },

  /**
   * Eliminar producto (soft delete - desactivar)
   */
  async deleteProducto(id: number): Promise<void> {
    await api.delete(`/admin/catalogo/productos/${id}`);
  },

  // ==================== VARIANTES ====================

  /**
   * Crear variante
   */
  async createVariante(productoId: number, data: CreateVarianteData): Promise<VarianteProducto> {
    const response = await api.post<ApiResponse<VarianteProducto>>(`/admin/catalogo/productos/${productoId}/variantes`, data);
    return response.data.data;
  },

  /**
   * Actualizar variante
   */
  async updateVariante(varianteId: number, data: UpdateVarianteData): Promise<VarianteProducto> {
    const response = await api.put<ApiResponse<VarianteProducto>>(`/admin/catalogo/variantes/${varianteId}`, data);
    return response.data.data;
  },

  /**
   * Eliminar variante
   */
  async deleteVariante(varianteId: number): Promise<void> {
    await api.delete(`/admin/catalogo/variantes/${varianteId}`);
  },
};
