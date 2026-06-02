// src/pages/admin/configuracion/notificaciones/services/admin.notificaciones.service.ts
import api from '../../../../../services/api';
import type { 
  NotificacionesResponse, 
  DetalleNotificacionResponse,
  ClienteNotificacionOption,
  CitaNotificacionOption,
  EnviarNotificacionData,
  VistaPreviaResponse
} from '../../../../../services/types/admin';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminNotificacionesService = {
  /**
   * Obtener listado de notificaciones con filtros
   */
  async getNotificaciones(params?: {
    tipo?: string;
    canal?: string;
    entregada?: boolean;
    fecha_desde?: string;
    fecha_hasta?: string;
    cliente_search?: string;
    page?: number;
  }): Promise<NotificacionesResponse> {
    const response = await api.get<ApiResponse<NotificacionesResponse>>('/admin/configuracion/notificaciones', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de una notificación
   */
  async getNotificacion(id: number): Promise<DetalleNotificacionResponse> {
    const response = await api.get<ApiResponse<DetalleNotificacionResponse>>(`/admin/configuracion/notificaciones/${id}`);
    return response.data.data;
  },

  /**
   * Reenviar notificación fallida
   */
  async reenviarNotificacion(id: number): Promise<void> {
    await api.post(`/admin/configuracion/notificaciones/${id}/reenviar`);
  },

  /**
   * Enviar notificación manual
   */
  async enviarNotificacion(data: EnviarNotificacionData): Promise<any> {
    const response = await api.post('/admin/configuracion/notificaciones/enviar', data);
    return response.data.data;
  },

  /**
   * Obtener clientes para selector
   */
  async getClientesList(search?: string): Promise<ClienteNotificacionOption[]> {
    const params: { search?: string } = {};
    if (search) params.search = search;
    const response = await api.get<ApiResponse<ClienteNotificacionOption[]>>('/admin/configuracion/notificaciones/clientes', { params });
    return response.data.data;
  },

  /**
   * Obtener citas para selector
   */
  async getCitasList(clienteId: number): Promise<CitaNotificacionOption[]> {
    const response = await api.get<ApiResponse<CitaNotificacionOption[]>>('/admin/configuracion/notificaciones/citas', { params: { cliente_id: clienteId } });
    return response.data.data;
  },

  /**
   * Obtener vista previa del mensaje
   */
  async getVistaPrevia(tipo: string): Promise<string> {
    const response = await api.post<ApiResponse<VistaPreviaResponse>>('/admin/configuracion/notificaciones/vista-previa', { tipo });
    return response.data.data.vista_previa;
  },
};