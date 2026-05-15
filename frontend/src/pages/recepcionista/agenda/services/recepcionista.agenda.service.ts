// src/pages/recepcionista/agenda/services/recepcionista.agenda.service.ts
import api from '../../../../services/api';

interface ApiResponse<T> {
  data: T;
}

export type CitaEstado = 'programada' | 'pendiente_confirmacion' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada';

export interface CitaCalendario {
  id: number;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  groomer_id: number;
  extendedProps: {
    estado: CitaEstado;
    mascota: string;
    servicio: string;
    tiene_ficha: boolean;
  };
}

export interface GroomerOption {
  id: number;
  nombre: string;
}

export interface SlotDisponible {
  groomer_id: number;
  groomer_nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface ClienteSearchResult {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  canal_contacto: string;
}

export interface MascotaData {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  peso_kg: number;
  rango_nombre: string | null;
  temperamento: string | null;
}

export interface ServicioConPrecio {
  id: number;
  nombre: string;
  duracion_minutos: number;
  precio: number;
  admite_doble_booking: boolean;
}

export interface CitaData {
  idCliente: number;
  idMascota: number;
  idServicio: number;
  idGroomer: number;
  fechaHoraInicio: string;
  observaciones?: string;
}

export interface CitaResponse {
  idCita: number;
  idMascota: number;
  idGroomer: number;
  idServicio: number;
  idRecepcionista: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  duracionCalculadaMin: number;
  estado: 'pendiente_confirmacion' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada';
  confirmacion_expira_at: string;
  observaciones: string | null;
  mascota?: any;
  groomer?: any;
  servicio?: any;
}
export interface CitaDetalle {
  id: number;
  mascota: string;
  cliente: string;
  cliente_id: number;
  groomer: string;
  groomer_id: number;
  servicio: string;
  servicio_id: number;
  hora_inicio: string;
  hora_fin: string;
  duracion: number;
  estado: CitaEstado;
  precio: number;
  observaciones: string | null;
  tiene_ficha: boolean;
  id_ficha: number | null;
}

export interface CrearCitaPendienteRequest {
  idCliente: number;
  idMascota: number;
  idServicio: number;
  idGroomer: number;
  fechaHoraInicio: string; // Formato: 'Y-m-d H:i:s'
  observaciones?: string;
}

/**
 * Crear una cita en estado PENDIENTE de confirmación
 * ✅ Ruta CORRECTA: POST /recepcionista/agenda
 */
export async function crearCitaPendiente(
  data: CrearCitaPendienteRequest
): Promise<ApiResponse<CitaResponse>> {
  const response = await api.post<ApiResponse<CitaResponse>>('/recepcionista/agenda/citas', data);
  return response.data;
}

/**
 * Confirmar una cita existente (cambia de pendiente_confirmacion a confirmada)
 * ✅ Ruta CORRECTA: PATCH /recepcionista/agenda/{id}/confirmar
 */
export async function confirmarCita(
  citaId: number
): Promise<ApiResponse<CitaResponse>> {
  const response = await api.patch<ApiResponse<CitaResponse>>(`/recepcionista/agenda/${citaId}/confirmar`);
  return response.data;
}

/**
 * Cancelar una cita
 */
export async function cancelarCita(
  citaId: number
): Promise<ApiResponse<null>> {
  const response = await api.patch<ApiResponse<null>>(`/recepcionista/agenda/${citaId}/cancelar`);
  return response.data;
}

export const recepcionistaAgendaService = {
  /**
   * Obtener citas para el calendario
   */
  async getCitas(fecha: string, groomerId?: number): Promise<{ citas: CitaCalendario[]; groomers: GroomerOption[] }> {
    const params: { fecha: string; groomer_id?: number } = { fecha };
    if (groomerId) params.groomer_id = groomerId;
    const response = await api.get<ApiResponse<{ citas: CitaCalendario[]; groomers: GroomerOption[] }>>('/recepcionista/agenda/citas', { params });
    return response.data.data;
  },

  /**
   * Obtener slots libres
   */
  async getSlotsLibres(fecha: string, idServicio: number, idMascota: number): Promise<SlotDisponible[]> {
    const response = await api.post<ApiResponse<SlotDisponible[]>>('/recepcionista/agenda/slots-libres', { fecha, idServicio, idMascota });
    return response.data.data;
  },

  /**
   * Buscar clientes
   */
  async buscarClientes(search: string): Promise<ClienteSearchResult[]> {
    const response = await api.get<ApiResponse<ClienteSearchResult[]>>('/recepcionista/buscar-clientes', { params: { search } });
    return response.data.data;
  },

  /**
   * Obtener mascotas de un cliente
   */
  async getMascotasPorCliente(clienteId: number): Promise<MascotaData[]> {
    const response = await api.get<ApiResponse<MascotaData[]>>(`/recepcionista/clientes/${clienteId}/mascotas`);
    return response.data.data;
  },

  /**
   * Obtener servicios con precios ajustados
   */
  async getServiciosConPrecios(idMascota: number): Promise<ServicioConPrecio[]> {
    const response = await api.post<ApiResponse<ServicioConPrecio[]>>('/recepcionista/servicios-con-precios', { idMascota });
    return response.data.data;
  },

  /**
   * Crear nueva cita
   */
  async crearCita(data: CitaData): Promise<CitaResponse> {
    const response = await api.post<ApiResponse<CitaResponse>>('/recepcionista/agenda/citas', data);
    return response.data.data;
  },

  /**
   * Confirmar cita
   */
  async confirmarCita(id: number): Promise<CitaResponse> {
    const response = await api.post<ApiResponse<CitaResponse>>(`/recepcionista/agenda/citas/${id}/confirmar`);
    return response.data.data;
  },

  /**
   * Cancelar cita
   */
  async cancelarCita(id: number): Promise<void> {
    await api.post(`/recepcionista/agenda/citas/${id}/cancelar`);
  },

  /**
   * Reprogramar cita
   */
  async reprogramarCita(id: number, fechaHoraInicio: string, idGroomer: number): Promise<CitaResponse> {
    const response = await api.put<ApiResponse<CitaResponse>>(`/recepcionista/agenda/citas/${id}/reprogramar`, { fechaHoraInicio, idGroomer });
    return response.data.data;
  },

  /**
   * Obtener detalle de una cita
   */
  async getDetalleCita(id: number): Promise<CitaDetalle> {
    const response = await api.get<ApiResponse<CitaDetalle>>(`/recepcionista/citas/${id}/detalle`);
    return response.data.data;
  },

  // En tu servicio
  async crearCitaPendiente(data: {
    idCliente: number;
    idMascota: number;
    idServicio: number;
    idGroomer: number;
    fechaHoraInicio: string;
    observaciones?: string;
  }): Promise<ApiResponse<CitaResponse>> {
    // ✅ Usar la ruta EXISTENTE del backend
    const response = await api.post<ApiResponse<CitaResponse>>('/recepcionista/agenda/citas', data);
    return response.data;
  }
};
