// src/pages/admin/catalogo/movimientos/services/admin.movimientos.service.ts
import api from '../../../../../services/api';
import type { 
  MovimientoInventario, 
  CreateMovimientoData,
  TipoMovimiento,
  ProductoMovimiento,
  MovimientosResponse
} from '../../../../../services/types/admin';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminMovimientosService = {
  /**
   * Obtener listado de movimientos con filtros
   */
  async getMovimientos(params?: {
    producto_search?: string;
    tipoMovimiento?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    page?: number;
  }): Promise<MovimientosResponse> {
    const response = await api.get<ApiResponse<MovimientosResponse>>('/admin/catalogo/movimientos', { params });
    return response.data.data;
  },

  /**
   * Obtener lista de productos para selector
   */
  async getProductosList(search?: string): Promise<ProductoMovimiento[]> {
    const params: { search?: string } = {};
    if (search) params.search = search;
    const response = await api.get<ApiResponse<ProductoMovimiento[]>>('/admin/catalogo/productos-lista', { params });
    return response.data.data;
  },

  /**
   * Registrar movimiento manual
   */
  async createMovimiento(data: CreateMovimientoData): Promise<MovimientoInventario> {
    const response = await api.post<ApiResponse<MovimientoInventario>>('/admin/catalogo/movimientos', data);
    return response.data.data;
  },
};