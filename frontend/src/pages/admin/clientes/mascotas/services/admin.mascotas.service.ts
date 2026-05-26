// src/pages/admin/clientes/mascotas/services/admin.mascotas.service.ts
import api from '../../../../../services/api';
import type { 
  MascotaAdmin, 
  CreateMascotaAdminData,
  FichaMascotaAdmin
} from '../../../../../services/types/admin';

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

export const adminMascotasService = {
  /**
   * Obtener listado de mascotas
   */
  async getMascotas(params?: {
    search?: string;
    especie?: string;
    page?: number;
  }): Promise<PaginatedResponse<MascotaAdmin>> {
    const response = await api.get<ApiResponse<PaginatedResponse<MascotaAdmin>>>('/admin/mascotas', { params });
    return response.data.data;
  },

  /**
   * Obtener ficha completa de una mascota
   */
  async getMascota(id: number): Promise<FichaMascotaAdmin> {
    const response = await api.get<ApiResponse<FichaMascotaAdmin>>(`/admin/mascotas/${id}`);
    return response.data.data;
  },

  /**
   * Crear nueva mascota
   */
  async createMascota(data: CreateMascotaAdminData): Promise<MascotaAdmin> {
    const response = await api.post<ApiResponse<MascotaAdmin>>('/admin/mascotas', data);
    return response.data.data;
  },

  /**
   * Actualizar mascota
   */
  async updateMascota(id: number, data: Partial<CreateMascotaAdminData>): Promise<MascotaAdmin> {
    const response = await api.put<ApiResponse<MascotaAdmin>>(`/admin/mascotas/${id}`, data);
    return response.data.data;
  },

  /**
   * Obtener historial de grooming de la mascota
   */
  async getHistorialGrooming(id: number): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/admin/mascotas/${id}/historial-grooming`);
    return response.data.data;
  },
};