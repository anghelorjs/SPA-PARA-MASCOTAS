// src/pages/recepcionista/dashboard/services/recepcionista.dashboard.service.ts
import api from '../../../../services/api';
import type { 
  DashboardRecepcionResponse, 
  DetalleCitaRecepcion 
} from '../../../../services/types/recepcionista';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const recepcionistaDashboardService = {
  /**
   * Obtener datos del dashboard del recepcionista
   * @param fecha - Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)
   */
  async getDashboard(fecha?: string): Promise<DashboardRecepcionResponse> {
    const params: { fecha?: string } = {};
    if (fecha) params.fecha = fecha;
    const response = await api.get<ApiResponse<DashboardRecepcionResponse>>('/recepcionista/dashboard', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de una cita
   * @param citaId - ID de la cita
   */
  async getDetalleCita(citaId: number): Promise<DetalleCitaRecepcion> {
    const response = await api.get<ApiResponse<DetalleCitaRecepcion>>(`/recepcionista/citas/${citaId}/detalle`);
    return response.data.data;
  },
};