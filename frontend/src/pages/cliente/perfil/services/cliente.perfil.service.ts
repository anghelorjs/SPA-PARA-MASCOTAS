// src/pages/cliente/perfil/services/cliente.perfil.service.ts
import api from '../../../../services/api';

export interface NotificacionData {
  id: number;
  tipo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

export interface MascotaResumenData {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
}

export interface PerfilClienteData {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  canal_contacto: 'whatsapp' | 'telegram' | 'email' | 'sms' | null;
  mascotas: MascotaResumenData[];
  notificaciones: NotificacionData[];
}

export interface UpdatePerfilData {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  canal_contacto?: 'whatsapp' | 'telegram' | 'email' | 'sms';
}

export type CanalContacto = NonNullable<PerfilClienteData['canal_contacto']>;

export interface UpdatePasswordData {
  password_actual: string;
  password_nuevo: string;
  password_nuevo_confirmation: string;
}

export const clientePerfilService = {
  /**
   * Obtener perfil del cliente
   */
  async getPerfil(): Promise<PerfilClienteData> {
    const response = await api.get('/cliente/perfil');
    return response.data.data;
  },

  /**
   * Actualizar datos personales
   */
  async updatePerfil(data: UpdatePerfilData): Promise<{
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    direccion: string | null;
    canal_contacto: CanalContacto | null;
  }> {
    const response = await api.put('/cliente/perfil', data);
    return response.data.data;
  },

  /**
   * Cambiar contraseña
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    await api.post('/cliente/perfil/password', data);
  },

  /**
   * Marcar notificación como leída
   */
  async marcarNotificacion(notificacionId: number): Promise<void> {
    await api.post(`/cliente/perfil/notificaciones/${notificacionId}/leer`);
  },
};
