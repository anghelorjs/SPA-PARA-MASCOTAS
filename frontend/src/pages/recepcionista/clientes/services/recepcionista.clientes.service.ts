// src/pages/recepcionista/clientes/services/recepcionista.clientes.service.ts
import api from '../../../../services/api';

// ==================== TIPOS ====================

export interface CreateClienteData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  preferencias?: string[];
  canalContacto?: 'whatsapp' | 'telegram' | 'email' | 'sms';
}

export interface CreateMascotaData {
  idCliente: number;
  nombre: string;
  especie: string;
  raza?: string;
  pesoKg: number;
  fechaNacimiento?: string;
  temperamento?: string;
  alergias?: string[];
  restricciones?: string[];
  vacunas?: string[];
}

export interface UsuarioCliente {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo?: boolean;
}

export interface ClienteRecepcionista {
  idCliente: number;
  idUsuario: number;
  direccion: string | null;
  preferencias: string[] | string | null;
  canalContacto: 'whatsapp' | 'telegram' | 'email' | 'sms' | null;
  user: UsuarioCliente;
  cant_mascotas: number;
  ultima_cita: string | null;
  ultimo_servicio?: string | null;
  ultima_cita_servicio?: string | null;
  mascotas?: MascotaRecepcionista[];
}

export interface ClienteSearchResult {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  canal_contacto: string;
}

export interface ClienteListResponse {
  current_page: number;
  data: ClienteRecepcionista[];
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

export interface CitaMascotaRecepcionista {
  idCita: number;
  fechaHoraInicio: string;
  estado: string;
  servicio?: { nombre: string };
  groomer?: { user?: { nombre: string; apellido: string } };
}

export interface MascotaRecepcionista {
  idMascota: number;
  idCliente?: number;
  nombre: string;
  especie: string;
  raza: string | null;
  pesoKg: number | string | null;
  rango_nombre?: string | null;
  rangoPeso: {
    idRango: number;
    nombre: string;
  } | null;
  temperamento: string | null;
  alergias: string[] | null;
  restricciones?: string[] | null;
  vacunas: string[] | null;
  fechaNacimiento: string | null;
  citas?: CitaMascotaRecepcionista[];
}

export interface PerfilClienteRecepcionista {
  cliente: ClienteRecepcionista & {
    mascotas: MascotaRecepcionista[];
  };
  estadisticas: {
    total_citas: number;
    total_gastado: number;
    mascotas_registradas: number;
  };
}

export interface FichaMascotaRecepcionista {
  mascota: MascotaRecepcionista;
  historial_citas: CitaMascotaRecepcionista[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ==================== SERVICIO ====================

export const recepcionistaClienteService = {
  /**
   * Crear un nuevo cliente
   */
  async createCliente(data: CreateClienteData): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/recepcionista/clientes', data);
    return response.data.data;
  },

  /**
   * Crear una nueva mascota para un cliente
   */
  async createMascota(data: CreateMascotaData): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/recepcionista/mascotas', data);
    return response.data.data;
  },

  /**
   * Buscar clientes por nombre, teléfono o email
   * @param search - Término de búsqueda (mínimo 2 caracteres)
   */
  async buscarClientes(search: string): Promise<ClienteSearchResult[]> {
    if (search.length < 2) return [];
    const response = await api.get<ApiResponse<ClienteSearchResult[]>>('/recepcionista/buscar-clientes', {
      params: { search }
    });
    return response.data.data;
  },

  /**
   * Obtener listado de clientes con paginación
   * @param page - Número de página
   * @param search - Término de búsqueda (opcional)
   */
  async getClientes(page: number = 1, search?: string): Promise<ClienteListResponse> {
    const params: { page: number; search?: string } = { page };
    if (search && search.length >= 2) params.search = search;
    const response = await api.get<ApiResponse<ClienteListResponse>>('/recepcionista/clientes', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de un cliente
   * @param idCliente - ID del cliente
   */
  async getCliente(idCliente: number): Promise<PerfilClienteRecepcionista> {
    const response = await api.get<ApiResponse<PerfilClienteRecepcionista>>(`/recepcionista/clientes/${idCliente}`);
    return response.data.data;
  },

  /**
   * Actualizar datos de un cliente
   * @param idCliente - ID del cliente
   * @param data - Datos a actualizar
   */
  async updateCliente(idCliente: number, data: Partial<CreateClienteData>): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/recepcionista/clientes/${idCliente}`, data);
    return response.data.data;
  },

  /**
   * Obtener historial de citas de un cliente
   * @param idCliente - ID del cliente
   */
  async getHistorialCitas(idCliente: number): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/recepcionista/clientes/${idCliente}/citas`);
    return response.data.data;
  },

  /**
   * Obtener todas las mascotas de un cliente
   * @param clienteId - ID del cliente
   */
  async getMascotasPorCliente(clienteId: number): Promise<MascotaRecepcionista[]> {
    const response = await api.get<ApiResponse<MascotaRecepcionista[]>>(`/recepcionista/clientes/${clienteId}/mascotas`);
    return response.data.data;
  },

  /**
   * Obtener detalle de una mascota
   * @param mascotaId - ID de la mascota
   */
  async getMascota(mascotaId: number): Promise<FichaMascotaRecepcionista> {
    const response = await api.get<ApiResponse<FichaMascotaRecepcionista>>(`/recepcionista/mascotas/${mascotaId}`);
    return response.data.data;
  },

  /**
   * Actualizar datos de una mascota
   * @param mascotaId - ID de la mascota
   * @param data - Datos a actualizar
   */
  async updateMascota(mascotaId: number, data: Partial<CreateMascotaData>): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/recepcionista/mascotas/${mascotaId}`, data);
    return response.data.data;
  },
};
