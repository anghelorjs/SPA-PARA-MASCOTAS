// src/pages/recepcionista/clientes/services/recepcionista.clientes.service.ts
import api from '../../../../services/api';

// ==================== TIPOS ====================

export interface CreateClienteData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
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
  vacunas?: string[];
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
  data: ClienteSearchResult[];
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

export interface MascotaData {
  idMascota: number;
  nombre: string;
  especie: string;
  raza: string | null;
  pesoKg: number;
  rangoPeso: {
    idRango: number;
    nombre: string;
  } | null;
  temperamento: string | null;
  alergias: string[] | null;
  vacunas: string[] | null;
  fechaNacimiento: string | null;
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
  async getCliente(idCliente: number): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/recepcionista/clientes/${idCliente}`);
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
  async getMascotasPorCliente(clienteId: number): Promise<MascotaData[]> {
    const response = await api.get<ApiResponse<MascotaData[]>>(`/recepcionista/clientes/${clienteId}/mascotas`);
    return response.data.data;
  },

  /**
   * Obtener detalle de una mascota
   * @param mascotaId - ID de la mascota
   */
  async getMascota(mascotaId: number): Promise<MascotaData> {
    const response = await api.get<ApiResponse<MascotaData>>(`/recepcionista/mascotas/${mascotaId}`);
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