// src/pages/groomer/perfil/services/groomer.perfil.service.ts
import api from '../../../../services/api';

export interface PerfilGroomerData {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: string;
  especialidad: string | null;
  max_servicios_simultaneos: number;
}

export interface UpdatePerfilData {
  telefono?: string;
}

export interface UpdatePasswordData {
  password_actual: string;
  password_nuevo: string;
  password_nuevo_confirmation: string;
}

export const groomerPerfilService = {
  /**
   * Obtener perfil del groomer
   */
  async getPerfil(): Promise<PerfilGroomerData> {
    const response = await api.get('/groomer/perfil');
    return response.data.data;
  },

  /**
   * Actualizar datos personales (solo teléfono)
   */
  async updatePerfil(data: UpdatePerfilData): Promise<{
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    especialidad: string | null;
    max_servicios_simultaneos: number;
  }> {
    const response = await api.put('/groomer/perfil', data);
    return response.data.data;
  },

  /**
   * Cambiar contraseña
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    await api.post('/groomer/perfil/password', data);
  },
};