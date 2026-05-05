// src/pages/recepcionista/perfil/services/recepcionista.perfil.service.ts
import api from '../../../../services/api';

export interface PerfilRecepcionistaData {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: string;
  turno: string;
  turno_descripcion: string;
  citas_gestionadas_hoy: number;
}

export interface UpdatePerfilData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
}

export interface UpdatePasswordData {
  password_actual: string;
  password_nuevo: string;
  password_nuevo_confirmation: string;
}

export interface ResumenDiaData {
  fecha: string;
  citas_creadas: number;
  citas_confirmadas: number;
  citas_canceladas: number;
  total_gestionadas: number;
}

export const recepcionistaPerfilService = {
  /**
   * Obtener perfil del recepcionista
   */
  async getPerfil(): Promise<PerfilRecepcionistaData> {
    const response = await api.get('/recepcionista/perfil');
    return response.data.data;
  },

  /**
   * Actualizar datos personales
   */
  async updatePerfil(data: UpdatePerfilData): Promise<{ nombre: string; apellido: string; email: string; telefono: string }> {
    const response = await api.put('/recepcionista/perfil', data);
    return response.data.data;
  },

  /**
   * Cambiar contraseña
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    await api.post('/recepcionista/perfil/password', data);
  },

  /**
   * Obtener resumen del día
   */
  async getResumenDia(): Promise<ResumenDiaData> {
    const response = await api.get('/recepcionista/perfil/resumen-dia');
    return response.data.data;
  },
};