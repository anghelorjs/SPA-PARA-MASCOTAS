// src/pages/cliente/citas/services/cliente.citas.service.ts
import api from '../../../../services/api';
import type { 
  CitaCliente, 
  DetalleCitaCliente,
  MascotaAgendado,
  ServicioAgendado,
  SlotAgendado,
  CreateCitaClienteData
} from '../../../../services/types/cliente';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const clienteCitasService = {
  /**
   * Obtener listado de citas del cliente
   * @param tipo - 'proximas', 'pasadas', 'canceladas'
   */
  async getCitas(tipo: string = 'proximas'): Promise<CitaCliente[]> {
    const response = await api.get<ApiResponse<CitaCliente[]>>('/cliente/citas', { params: { tipo } });
    return response.data.data;
  },

  /**
   * Obtener detalle de una cita
   * @param id - ID de la cita
   */
  async getCita(id: number): Promise<DetalleCitaCliente> {
    const response = await api.get<ApiResponse<DetalleCitaCliente>>(`/cliente/citas/${id}`);
    return response.data.data;
  },

  /**
   * Cancelar una cita
   * @param id - ID de la cita
   */
  async cancelarCita(id: number): Promise<void> {
    await api.post(`/cliente/citas/${id}/cancelar`);
  },

  // ==================== AGENDADO ====================

  /**
   * Obtener mascotas del cliente (Paso 1)
   */
  async getMascotasAgendado(): Promise<MascotaAgendado[]> {
    const response = await api.get<ApiResponse<MascotaAgendado[]>>('/cliente/agendado/mascotas');
    return response.data.data;
  },

  /**
   * Obtener servicios con precios ajustados (Paso 2)
   * @param idMascota - ID de la mascota seleccionada
   */
  async getServiciosAgendado(idMascota: number): Promise<ServicioAgendado[]> {
    const response = await api.post<ApiResponse<ServicioAgendado[]>>('/cliente/agendado/servicios', { idMascota });
    return response.data.data;
  },

  /**
   * Obtener slots disponibles (Paso 3)
   * @param fecha - Fecha seleccionada (YYYY-MM-DD)
   * @param idServicio - ID del servicio
   * @param idMascota - ID de la mascota
   */
  async getSlotsAgendado(fecha: string, idServicio: number, idMascota: number): Promise<SlotAgendado[]> {
    const response = await api.post<ApiResponse<SlotAgendado[]>>('/cliente/agendado/slots', {
      fecha,
      idServicio,
      idMascota
    });
    return response.data.data;
  },

  /**
   * Crear nueva cita (Paso 4)
   * @param data - Datos de la cita
   */
  async crearCita(data: CreateCitaClienteData): Promise<{ id: number; fecha: string; hora: string }> {
    const response = await api.post<ApiResponse<{ id: number; fecha: string; hora: string }>>('/cliente/citas', data);
    return response.data.data;
  },
};