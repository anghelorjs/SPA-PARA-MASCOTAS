// src/pages/groomer/dashboard/services/groomer.dashboard.service.ts
import api from '../../../../services/api';
import type { DashboardGroomerResponse } from '../../../../services/types/groomer';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const groomerDashboardService = {
  /**
   * Obtener datos del dashboard del groomer
   * @param fecha - Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)
   */
  async getDashboard(fecha?: string): Promise<DashboardGroomerResponse> {
    const params: { fecha?: string } = {};
    if (fecha) params.fecha = fecha;
    const response = await api.get<ApiResponse<DashboardGroomerResponse>>('/groomer/dashboard', { params });
    return response.data.data;
  },
};