// src/pages/admin/clientes/clientes/services/admin.clientes.service.ts
import api from '../../../../../services/api';
import type { 
  ClienteAdmin, 
  CreateClienteAdminData, 
  UpdateClienteAdminData,
  PerfilClienteAdmin
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

export const adminClientesService = {
  /**
   * Obtener listado de clientes
   */
  async getClientes(params?: {
    search?: string;
    activo?: boolean;
    periodo?: number | string;
    page?: number;
  }): Promise<PaginatedResponse<ClienteAdmin>> {
    const response = await api.get<ApiResponse<PaginatedResponse<ClienteAdmin>>>('/admin/clientes', { params });
    return response.data.data;
  },

  /**
   * Obtener perfil completo de un cliente
   */
  async getCliente(id: number): Promise<PerfilClienteAdmin> {
    const response = await api.get<ApiResponse<PerfilClienteAdmin>>(`/admin/clientes/${id}`);
    return response.data.data;
  },

  /**
   * Crear nuevo cliente
   */
  async createCliente(data: CreateClienteAdminData): Promise<ClienteAdmin> {
    const response = await api.post<ApiResponse<ClienteAdmin>>('/admin/clientes', data);
    return response.data.data;
  },

  /**
   * Actualizar cliente
   */
  async updateCliente(id: number, data: UpdateClienteAdminData): Promise<ClienteAdmin> {
    const response = await api.put<ApiResponse<ClienteAdmin>>(`/admin/clientes/${id}`, data);
    return response.data.data;
  },

  /**
   * Obtener historial de citas del cliente
   */
  async getHistorialCitas(id: number, page: number = 1): Promise<PaginatedResponse<any>> {
    const response = await api.get<ApiResponse<PaginatedResponse<any>>>(`/admin/clientes/${id}/citas`, { params: { page } });
    return response.data.data;
  },
};