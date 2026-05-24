// src/pages/admin/dashboard/services/admin.dashboard.service.ts
import api from '../../../../services/api';
import type { DashboardAdminResponse } from '../../../../services/types/admin';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminDashboardService = {
  /**
   * Obtener datos del dashboard del administrador
   * @param fecha - Fecha específica para KPIs (formato YYYY-MM-DD)
   * @param fechaInicio - Inicio del período para gráficas (formato YYYY-MM-DD)
   * @param fechaFin - Fin del período para gráficas (formato YYYY-MM-DD)
   */
  async getDashboard(fecha?: string, fechaInicio?: string, fechaFin?: string): Promise<DashboardAdminResponse> {
    const params: Record<string, string> = {};
    if (fecha) params.fecha = fecha;
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;
    const response = await api.get<ApiResponse<DashboardAdminResponse>>('/admin/dashboard', { params });
    return response.data.data;
  },
};