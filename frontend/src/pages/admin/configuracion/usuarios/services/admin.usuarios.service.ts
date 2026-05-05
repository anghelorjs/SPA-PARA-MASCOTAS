// src/pages/admin/configuracion/usuarios/services/admin.usuarios.service.ts
import api from '../../../../../services/api';

export interface PerfilData {
  idAdministrador?: number;
  idRecepcionista?: number;
  idGroomer?: number;
  idCliente?: number;
  turno?: string;
  especialidad?: string;
  maxServiciosSimultaneos?: number;
  direccion?: string;
  canalContacto?: string;
}

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: 'administrador' | 'recepcionista' | 'groomer' | 'cliente';
  activo: boolean;
  creadoEn: string;
  created_at: string;
  updated_at: string;
  perfil_datos: PerfilData | null;
}

export interface UsuariosResponse {
  current_page: number;
  data: Usuario[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  password: string;
  turno?: string; // para recepcionista
  especialidad?: string; // para groomer
  maxServiciosSimultaneos?: number; // para groomer
  direccion?: string; // para cliente
  canalContacto?: string; // para cliente
}

export interface UpdateUsuarioData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  activo?: boolean;
  rol?: string;
  especialidad?: string;
  maxServiciosSimultaneos?: number;
  turno?: string;
  direccion?: string;
  canalContacto?: string;
}

export interface ResetPasswordData {
  new_password: string;
}

export interface Role {
  id: string;
  nombre: string;
}

export const adminUsuariosService = {
  /**
   * Listar usuarios
   */
  async getUsuarios(params?: {
    page?: number;
    per_page?: number;
    rol?: string;
    activo?: boolean;
    search?: string;
  }): Promise<UsuariosResponse> {
    const response = await api.get('/admin/configuracion/usuarios', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de un usuario
   */
  async getUsuario(id: number): Promise<Usuario> {
    const response = await api.get(`/admin/configuracion/usuarios/${id}`);
    return response.data.data;
  },

  /**
   * Crear usuario
   */
  async createUsuario(data: CreateUsuarioData): Promise<Usuario> {
    const response = await api.post('/admin/configuracion/usuarios', data);
    return response.data.data;
  },

  /**
   * Actualizar usuario
   */
  async updateUsuario(id: number, data: UpdateUsuarioData): Promise<Usuario> {
    const response = await api.put(`/admin/configuracion/usuarios/${id}`, data);
    return response.data.data;
  },

  /**
   * Resetear contraseña
   */
  async resetPassword(id: number, data: ResetPasswordData): Promise<void> {
    await api.post(`/admin/configuracion/usuarios/${id}/reset-password`, data);
  },

  /**
   * Desactivar usuario
   */
  async deleteUsuario(id: number): Promise<void> {
    await api.delete(`/admin/configuracion/usuarios/${id}`);
  },

  /**
   * Obtener roles disponibles
   */
  async getRoles(): Promise<Role[]> {
    const response = await api.get('/admin/configuracion/roles');
    return response.data.data;
  },
};