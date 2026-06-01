// src/pages/admin/reportes/services/admin.reportes.service.ts
import api from '../../../../services/api';
import type { 
  ReporteAgendaResponse,
  ReporteIngresosResponse,
  ReporteInventarioResponse,
  ReporteClientesResponse
} from '../../../../services/types/admin';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminReportesService = {
  /**
   * Generar reporte de agenda
   */
  async getReporteAgenda(params: {
    fecha_desde: string;
    fecha_hasta: string;
    groomer_id?: number;
  }): Promise<ReporteAgendaResponse> {
    const response = await api.get<ApiResponse<ReporteAgendaResponse>>('/admin/reportes/agenda', { params });
    return response.data.data;
  },

  /**
   * Generar reporte de ingresos
   */
  async getReporteIngresos(params: {
    fecha_desde: string;
    fecha_hasta: string;
    groomer_id?: number;
  }): Promise<ReporteIngresosResponse> {
    const response = await api.get<ApiResponse<ReporteIngresosResponse>>('/admin/reportes/ingresos', { params });
    return response.data.data;
  },

  /**
   * Generar reporte de inventario
   */
  async getReporteInventario(params: {
    fecha_desde?: string;
    fecha_hasta?: string;
    categoria_id?: number;
  }): Promise<ReporteInventarioResponse> {
    const response = await api.get<ApiResponse<ReporteInventarioResponse>>('/admin/reportes/inventario', { params });
    return response.data.data;
  },

  /**
   * Generar reporte de clientes
   */
  async getReporteClientes(params: {
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<ReporteClientesResponse> {
    const response = await api.get<ApiResponse<ReporteClientesResponse>>('/admin/reportes/clientes', { params });
    return response.data.data;
  },
};