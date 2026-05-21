// src/pages/groomer/agenda/services/groomer.agenda.service.ts
import api from '../../../../services/api';
import type { CitaGroomer, IniciarServicioResponse, HistorialMascotaResponse } from '../../../../services/types/groomer';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface CitasResponse {
  current_page: number;
  data: CitaGroomer[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * Servicio para la agenda del groomer
 */
export const groomerAgendaService = {
  /**
   * Obtener citas del groomer con filtros y paginación
   * @param fecha - Fecha en formato YYYY-MM-DD
   * @param estado - Estado para filtrar ('todas', 'programada,confirmada', 'en_curso', 'completada')
   * @param page - Número de página
   */
  async getCitas(fecha: string, estado: string = 'todas', page: number = 1): Promise<CitasResponse> {
    const response = await api.get<ApiResponse<CitasResponse>>('/groomer/agenda', {
      params: { fecha, estado, page, per_page: 15 }
    });
    return response.data.data;
  },

  /**
   * Iniciar servicio (crear ficha de grooming)
   * @param citaId - ID de la cita
   */
  async iniciarServicio(citaId: number): Promise<IniciarServicioResponse> {
    const response = await api.post<ApiResponse<IniciarServicioResponse>>(`/groomer/agenda/${citaId}/iniciar`);
    return response.data.data;
  },

  /**
   * Ver historial completo de una mascota
   * @param mascotaId - ID de la mascota
   */
  async getHistorialMascota(mascotaId: number): Promise<HistorialMascotaResponse> {
    const response = await api.get<ApiResponse<HistorialMascotaResponse>>(`/groomer/mascotas/${mascotaId}/historial`);
    return response.data.data;
  },
};