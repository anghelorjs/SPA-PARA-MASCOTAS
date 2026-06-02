// src/pages/admin/grooming/services/admin.grooming.service.ts
import api from '../../../../services/api';
import type { 
  FichaHoyAdmin, 
  FichaTodasAdmin, 
  DetalleFichaAdmin,
  GaleriaResponse,
  TipoFoto,
  GaleriaMascotaResponse
} from '../../../../services/types/admin';

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

export const adminGroomingService = {
  // ==================== FICHAS ====================

  /**
   * Obtener fichas del día
   */
  async getFichasHoy(params?: {
    fecha?: string;
    groomer_id?: number;
    estado?: string;
  }): Promise<FichaHoyAdmin[]> {
    const response = await api.get<ApiResponse<FichaHoyAdmin[]>>('/admin/grooming/fichas/hoy', { params });
    return response.data.data;
  },

  /**
   * Obtener todas las fichas (histórico)
   */
  async getTodasFichas(params?: {
    search?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    groomer_id?: number;
    estado?: string;
    page?: number;
  }): Promise<PaginatedResponse<FichaTodasAdmin>> {
    const response = await api.get<ApiResponse<PaginatedResponse<FichaTodasAdmin>>>('/admin/grooming/fichas/todas', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de una ficha
   */
  async getDetalleFicha(id: number): Promise<DetalleFichaAdmin> {
    const response = await api.get<ApiResponse<DetalleFichaAdmin>>(`/admin/grooming/fichas/${id}`);
    return response.data.data;
  },

  // ==================== GALERÍA ====================

  /**
   * Obtener galería de fotos con filtros
   */
  async getGaleria(params?: {
    mascota_search?: string;
    groomer_id?: number;
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    page?: number;
  }): Promise<GaleriaResponse> {
    const response = await api.get<ApiResponse<GaleriaResponse>>('/admin/grooming/fotos', { params });
    return response.data.data;
  },

  /**
   * Obtener tipos de foto para filtros
   */
  async getTiposFoto(): Promise<TipoFoto[]> {
    const response = await api.get<ApiResponse<TipoFoto[]>>('/admin/grooming/tipos-foto');
    return response.data.data;
  },

  /**
   * Obtener galería por mascota
   */
  async getGaleriaPorMascota(mascotaId: number): Promise<GaleriaMascotaResponse> {
    const response = await api.get<ApiResponse<GaleriaMascotaResponse>>(`/admin/grooming/mascotas/${mascotaId}/fotos`);
    return response.data.data;
  },

  /**
   * Eliminar foto
   */
  async deleteFoto(fotoId: number): Promise<void> {
    await api.delete(`/admin/grooming/fotos/${fotoId}`);
  },
};