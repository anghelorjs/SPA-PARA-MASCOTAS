// src/pages/admin/agenda/services/admin.agenda.service.ts
import api from '../../../../services/api';
import type {
  CitaCalendario,
  GroomerOption,
  SlotDisponible,
  CitaDetalle,
  DisponibilidadDia,
  GroomerDisponibilidad,
  Bloqueo,
  DiaSemana,
  Servicio,
  RangoPeso,
  CreateServicioData,
  CreateRangoPesoData,
  ClienteSearchResult,
  MascotaData,
  ServicioConPrecio,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface CitasResponse {
  citas: CitaCalendario[];
  groomers: GroomerOption[];
}

interface DisponibilidadResponse {
  groomers: GroomerDisponibilidad[];
  bloqueos: Bloqueo[];
}

interface ServiciosResponse {
  servicios: Servicio[];
  rangos: RangoPeso[];
}

type CanalContacto = 'whatsapp' | 'telegram' | 'email' | 'sms';

interface ClienteCreadoResponse {
  idCliente: number;
  user: { nombre: string; apellido: string; telefono?: string | null; email: string };
  direccion?: string | null;
  canalContacto?: CanalContacto | null;
}

interface MascotaCreadaResponse {
  idMascota: number;
  nombre: string;
  especie: string;
  raza?: string | null;
  pesoKg: number;
  rangoPeso?: { nombre: string } | null;
  temperamento?: string | null;
}

interface CitaCreadaResponse {
  idCita: number;
}

// ==================== CITAS ====================
export const adminAgendaService = {
  /**
   * Obtener citas para el calendario (rango de fechas)
   */
  async getCitas(fechaInicio: string, fechaFin: string, groomerId?: number): Promise<CitasResponse> {
    const params: Record<string, string | number> = { fecha_inicio: fechaInicio, fecha_fin: fechaFin };
    if (groomerId) params.groomer_id = groomerId;
    const response = await api.get<ApiResponse<CitasResponse>>('/admin/agenda/citas', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de una cita
   */
  async getDetalleCita(citaId: number): Promise<CitaDetalle> {
    const response = await api.get<ApiResponse<CitaDetalle>>(`/admin/agenda/citas/${citaId}`);
    return response.data.data;
  },

  /**
   * Confirmar cita
   */
  async confirmarCita(citaId: number): Promise<void> {
    await api.post(`/admin/agenda/citas/${citaId}/confirmar`);
  },

  /**
   * Cancelar cita
   */
  async cancelarCita(citaId: number): Promise<void> {
    await api.post(`/admin/agenda/citas/${citaId}/cancelar`);
  },

  /**
   * Reprogramar cita
   */
  async reprogramarCita(citaId: number, fechaHoraInicio: string, idGroomer: number): Promise<void> {
    await api.put(`/admin/agenda/citas/${citaId}/reprogramar`, { fechaHoraInicio, idGroomer });
  },

  /**
   * Obtener slots disponibles
   */
  async getSlotsDisponibles(fecha: string, idServicio: number, idMascota: number, idGroomer?: number): Promise<SlotDisponible[]> {
    const response = await api.post<ApiResponse<SlotDisponible[]>>('/admin/agenda/slots-disponibles', {
      fecha,
      idServicio,
      idMascota,
      ...(idGroomer ? { idGroomer } : {}),
    });
    return response.data.data;
  },

  // ==================== DISPONIBILIDAD ====================
  /**
   * Obtener disponibilidad de todos los groomers
   */
  async getDisponibilidad(): Promise<DisponibilidadResponse> {
    const response = await api.get<ApiResponse<DisponibilidadResponse>>('/admin/agenda/disponibilidad');
    return response.data.data;
  },

  /**
   * Obtener disponibilidad de un groomer específico
   */
  async getDisponibilidadGroomer(groomerId: number): Promise<GroomerDisponibilidad> {
    const response = await api.get<ApiResponse<{ groomer: GroomerDisponibilidad; disponibilidades: DisponibilidadDia[] }>>(
      `/admin/agenda/disponibilidad/${groomerId}`
    );
    return response.data.data.groomer;
  },

  /**
   * Guardar disponibilidad semanal de un groomer
   */
  async saveDisponibilidad(groomerId: number, disponibilidades: { diaSemana: number; horaInicio: string; horaFin: string }[]): Promise<void> {
    await api.put(`/admin/agenda/disponibilidad/${groomerId}`, { disponibilidades });
  },

  /**
   * Registrar bloqueo
   */
  async registrarBloqueo(groomerId: number, fechaDesde: string, fechaHasta: string | null, motivoBloqueo: string): Promise<void> {
    await api.post('/admin/agenda/bloqueos', {
      idGroomer: groomerId,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      motivoBloqueo,
    });
  },

  /**
   * Eliminar bloqueo
   */
  async eliminarBloqueo(bloqueoId: number): Promise<void> {
    await api.delete(`/admin/agenda/bloqueos/${bloqueoId}`);
  },

  /**
   * Obtener días de semana para selector
   */
  async getDiasSemana(): Promise<DiaSemana[]> {
    const response = await api.get<ApiResponse<DiaSemana[]>>('/admin/agenda/dias-semana');
    return response.data.data;
  },

  // ==================== SERVICIOS ====================
  /**
   * Obtener servicios con sus rangos
   */
  async getServicios(): Promise<ServiciosResponse> {
    const response = await api.get<ApiResponse<ServiciosResponse>>('/admin/agenda/servicios');
    return response.data.data;
  },

  /**
   * Crear servicio
   */
  async createServicio(data: CreateServicioData): Promise<Servicio> {
    const response = await api.post<ApiResponse<Servicio>>('/admin/agenda/servicios', data);
    return response.data.data;
  },

  /**
   * Actualizar servicio
   */
  async updateServicio(id: number, data: Partial<CreateServicioData>): Promise<Servicio> {
    const response = await api.put<ApiResponse<Servicio>>(`/admin/agenda/servicios/${id}`, data);
    return response.data.data;
  },

  /**
   * Eliminar servicio
   */
  async deleteServicio(id: number): Promise<void> {
    await api.delete(`/admin/agenda/servicios/${id}`);
  },

  // ==================== RANGOS DE PESO ====================
  /**
   * Obtener rangos de peso
   */
  async getRangosPeso(): Promise<RangoPeso[]> {
    const response = await api.get<ApiResponse<RangoPeso[]>>('/admin/agenda/rangos-peso');
    return response.data.data;
  },

  /**
   * Crear rango de peso
   */
  async createRangoPeso(data: CreateRangoPesoData): Promise<RangoPeso> {
    const response = await api.post<ApiResponse<RangoPeso>>('/admin/agenda/rangos-peso', data);
    return response.data.data;
  },

  /**
   * Actualizar rango de peso
   */
  async updateRangoPeso(id: number, data: Partial<CreateRangoPesoData>): Promise<RangoPeso> {
    const response = await api.put<ApiResponse<RangoPeso>>(`/admin/agenda/rangos-peso/${id}`, data);
    return response.data.data;
  },

  /**
   * Eliminar rango de peso
   */
  async deleteRangoPeso(id: number): Promise<void> {
    await api.delete(`/admin/agenda/rangos-peso/${id}`);
  },

  // ==================== BÚSQUEDAS PARA NUEVA CITA ====================
  /**
   * Buscar clientes
   */
  async buscarClientes(search: string): Promise<ClienteSearchResult[]> {
    const response = await api.get<ApiResponse<ClienteSearchResult[]>>('/admin/buscar-clientes', {
      params: { search },
    });
    return response.data.data;
  },

  /**
   * Obtener mascotas de un cliente
   */
  async getMascotasPorCliente(clienteId: number): Promise<MascotaData[]> {
    const response = await api.get<ApiResponse<MascotaData[]>>(`/admin/clientes/${clienteId}/mascotas`);
    return response.data.data;
  },

  /**
   * Obtener servicios con precios ajustados
   */
  async getServiciosConPrecios(idMascota: number): Promise<ServicioConPrecio[]> {
    const response = await api.post<ApiResponse<ServicioConPrecio[]>>('/admin/servicios-con-precios', {
      idMascota,
    });
    return response.data.data;
  },

  /**
   * Crear cliente desde el wizard de agenda admin
   */
  async createCliente(data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    direccion?: string;
    canalContacto?: CanalContacto;
  }): Promise<ClienteCreadoResponse> {
    const response = await api.post<ApiResponse<ClienteCreadoResponse>>('/admin/clientes', data);
    return response.data.data;
  },

  /**
   * Crear mascota desde el wizard de agenda admin
   */
  async createMascota(data: {
    idCliente: number;
    nombre: string;
    especie: string;
    raza?: string;
    pesoKg: number;
    fechaNacimiento?: string;
    temperamento?: string;
    alergias?: string[];
    vacunas?: string[];
  }): Promise<MascotaCreadaResponse> {
    const response = await api.post<ApiResponse<MascotaCreadaResponse>>('/admin/mascotas', data);
    return response.data.data;
  },

  /**
   * Crear nueva cita
   */
  async crearCita(data: {
    idCliente: number;
    idMascota: number;
    idServicio: number;
    idGroomer: number;
    fechaHoraInicio: string;
    observaciones?: string;
  }): Promise<CitaCreadaResponse> {
    const response = await api.post<ApiResponse<CitaCreadaResponse>>('/admin/agenda/citas', data);
    return response.data.data;
  },
};
