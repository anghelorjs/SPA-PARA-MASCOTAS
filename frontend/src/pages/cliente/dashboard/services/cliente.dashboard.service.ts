// src/pages/cliente/dashboard/services/cliente.dashboard.service.ts
import api from '../../../../services/api';
import type { DashboardClienteResponse } from '../../../../services/types/cliente';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const clienteDashboardService = {
  /**
   * Obtener datos del dashboard del cliente
   */
  async getDashboard(): Promise<DashboardClienteResponse> {
    const response = await api.get<ApiResponse<DashboardClienteResponse>>('/cliente/dashboard');
    return response.data.data;
  },
};