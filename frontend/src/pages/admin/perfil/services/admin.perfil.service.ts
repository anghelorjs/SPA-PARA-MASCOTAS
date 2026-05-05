// src/pages/admin/perfil/services/admin.perfil.service.ts
import api from '../../../../services/api';

export interface PerfilAdminData {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: string;
  activo: boolean;
  creadoEn: string;
  ultimos_reportes: Array<{
    idReporte: number;
    tipoReporte: string;
    fechaGenerado: string;
    fechaDesde: string;
    fechaHasta: string;
  }>;
}

export interface UpdatePerfilData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
}

export interface UpdatePasswordData {
  password_actual: string;
  password_nuevo: string;
  password_nuevo_confirmation: string;
}

export interface ReporteData {
  current_page: number;
  data: Array<{
    idReporte: number;
    tipoReporte: string;
    fechaDesde: string;
    fechaHasta: string;
    generadoEn: string;
  }>;
  last_page: number;
  per_page: number;
  total: number;
}

export const adminPerfilService = {
  /**
   * Obtener perfil del administrador
   */
  async getPerfil(): Promise<PerfilAdminData> {
    const response = await api.get('/admin/perfil');
    return response.data.data;
  },

  /**
   * Actualizar datos personales
   */
  async updatePerfil(data: UpdatePerfilData): Promise<{ nombre: string; apellido: string; email: string; telefono: string }> {
    const response = await api.put('/admin/perfil', data);
    return response.data.data;
  },

  /**
   * Cambiar contraseña
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    await api.post('/admin/perfil/password', data);
  },

  /**
   * Obtener historial de reportes
   */
  async getReportes(page: number = 1, tipoReporte?: string): Promise<ReporteData> {
    const params: Record<string, string | number> = { page };
    if (tipoReporte && tipoReporte !== 'todos') {
      params.tipoReporte = tipoReporte;
    }
    const response = await api.get('/admin/perfil/reportes', { params });
    return response.data.data;
  },
};