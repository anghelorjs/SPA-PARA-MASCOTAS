import api from '../../../../../services/api';

export interface LogUser {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol?: string;
}

export interface LogData {
  id: number;
  user_id: number | null;
  action: string;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  old_data: Record<string, unknown> | unknown[] | null;
  new_data: Record<string, unknown> | unknown[] | null;
  created_at: string;
  user: LogUser | null;
}

export interface LogsResponse {
  current_page: number;
  data: LogData[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface UsuarioOption {
  id: number;
  nombre: string;
  email?: string;
}

export interface LogsStats {
  actividad_por_dia: Array<{ fecha: string; total: number }>;
  top_usuarios: Array<{ usuario: string; total: number }>;
  top_acciones: Array<{ action: string; total: number }>;
  total_logs: number;
  logs_hoy: number;
}

export interface LogsFiltersParams {
  page?: number;
  per_page?: number;
  user_id?: string;
  action?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
}

export const adminLogsService = {
  async getLogs(params?: LogsFiltersParams): Promise<{
    logs: LogsResponse;
    usuarios: UsuarioOption[];
    acciones: string[];
  }> {
    const response = await api.get('/admin/configuracion/logs', { params });
    return response.data.data;
  },

  async getLog(id: number): Promise<LogData> {
    const response = await api.get(`/admin/configuracion/logs/${id}`);
    return response.data.data;
  },

  async getStats(fechaInicio?: string, fechaFin?: string): Promise<LogsStats> {
    const params: { fecha_inicio?: string; fecha_fin?: string } = {};

    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;

    const response = await api.get('/admin/configuracion/logs-stats', { params });
    return response.data.data;
  },
};
