// src/pages/cliente/mascotas/services/cliente.mascotas.service.ts
import api from '../../../../services/api';
import type { 
  Mascota, 
  DetalleMascotaResponse, 
  CreateMascotaData,
  UpdateMascotaData,
  FotosSesionResponse,
  RangoPesoCliente
} from '../../../../services/types/cliente';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const clienteMascotasService = {
  /**
   * Obtener todas las mascotas del cliente
   */
  async getMascotas(): Promise<Mascota[]> {
    const response = await api.get<ApiResponse<Mascota[]>>('/cliente/mascotas');
    return response.data.data;
  },

  /**
   * Obtener rangos de peso configurados por el administrador
   */
  async getRangosPeso(): Promise<RangoPesoCliente[]> {
    const response = await api.get<ApiResponse<RangoPesoCliente[]>>('/cliente/rangos-peso');
    return response.data.data;
  },

  /**
   * Obtener detalle completo de una mascota
   * @param id - ID de la mascota
   */
  async getMascota(id: number): Promise<DetalleMascotaResponse> {
    const response = await api.get<ApiResponse<DetalleMascotaResponse>>(`/cliente/mascotas/${id}`);
    return response.data.data;
  },

  /**
   * Crear nueva mascota
   * @param data - Datos de la mascota
   */
  async createMascota(data: CreateMascotaData): Promise<{ id: number; nombre: string }> {
    const response = await api.post<ApiResponse<{ id: number; nombre: string }>>('/cliente/mascotas', data);
    return response.data.data;
  },

  /**
   * Actualizar mascota existente
   * @param id - ID de la mascota
   * @param data - Datos a actualizar
   */
  async updateMascota(id: number, data: UpdateMascotaData): Promise<void> {
    await api.put(`/cliente/mascotas/${id}`, data);
  },

  /**
   * Subir foto de perfil
   * @param id - ID de la mascota
   * @param file - Archivo de imagen
   */
  async uploadFotoPerfil(id: number, file: File): Promise<{ id: number; url: string }> {
    const formData = new FormData();
    formData.append('foto', file);
    const response = await api.post<ApiResponse<{ id: number; url: string }>>(
      `/cliente/mascotas/${id}/foto`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  /**
   * Obtener fotos de una sesión específica
   * @param fichaId - ID de la ficha de grooming
   */
  async getFotosSesion(fichaId: number): Promise<FotosSesionResponse> {
    const response = await api.get<ApiResponse<FotosSesionResponse>>(`/cliente/fichas/${fichaId}/fotos`);
    return response.data.data;
  },
};
