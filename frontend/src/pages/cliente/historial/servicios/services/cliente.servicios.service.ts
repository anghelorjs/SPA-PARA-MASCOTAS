// src/pages/cliente/historial/servicios/services/cliente.servicios.service.ts
import api from '../../../../../services/api';
import type { ServiciosResponse, DetalleServicioResponse } from '../../../../../services/types/cliente';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const clienteServiciosService = {
  /**
   * Obtener historial de servicios
   */
  async getServicios(mascotaId?: number, page: number = 1): Promise<ServiciosResponse> {
    const params: Record<string, any> = { page, per_page: 15 };
    if (mascotaId) params.mascota_id = mascotaId;
    const response = await api.get<ApiResponse<ServiciosResponse>>('/cliente/historial/servicios', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de un servicio con sus fotos
   */
  async getServicioDetalle(id: number): Promise<DetalleServicioResponse> {
    const response = await api.get<ApiResponse<DetalleServicioResponse>>(`/cliente/historial/servicios/${id}`);
    return response.data.data;
  },
};