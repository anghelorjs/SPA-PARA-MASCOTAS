// src/pages/admin/catalogo/insumos/services/admin.insumos.service.ts
import api from '../../../../../services/api';
import type { 
  Insumo, 
  CreateInsumoData, 
  UpdateInsumoData,
  AjustarStockData,
  ConsumoHistorico
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

interface InsumoDetalleResponse {
  insumo: Insumo;
  consumo_historico: PaginatedResponse<ConsumoHistorico>;
}

export const adminInsumosService = {
  /**
   * Obtener listado de insumos
   */
  async getInsumos(params?: {
    categoria?: string;
    search?: string;
    bajo_stock?: boolean;
    page?: number;
  }): Promise<PaginatedResponse<Insumo>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Insumo>>>('/admin/catalogo/insumos', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de un insumo con historial de consumo
   */
  async getInsumo(id: number): Promise<InsumoDetalleResponse> {
    const response = await api.get<ApiResponse<InsumoDetalleResponse>>(`/admin/catalogo/insumos/${id}`);
    return response.data.data;
  },

  /**
   * Crear nuevo insumo
   */
  async createInsumo(data: CreateInsumoData): Promise<Insumo> {
    const response = await api.post<ApiResponse<Insumo>>('/admin/catalogo/insumos', data);
    return response.data.data;
  },

  /**
   * Actualizar insumo
   */
  async updateInsumo(id: number, data: UpdateInsumoData): Promise<Insumo> {
    const response = await api.put<ApiResponse<Insumo>>(`/admin/catalogo/insumos/${id}`, data);
    return response.data.data;
  },

  /**
   * Ajustar stock de insumo
   */
  async ajustarStock(id: number, data: AjustarStockData): Promise<Insumo> {
    const response = await api.post<ApiResponse<Insumo>>(`/admin/catalogo/insumos/${id}/stock`, data);
    return response.data.data;
  },

  /**
   * Eliminar insumo
   */
  async deleteInsumo(id: number): Promise<void> {
    await api.delete(`/admin/catalogo/insumos/${id}`);
  },
};