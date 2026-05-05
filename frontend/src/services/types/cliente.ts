// src/services/types/cliente.ts
export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

export interface MascotaResumen {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
}

export interface PerfilCliente {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  canal_contacto: 'whatsapp' | 'telegram' | 'email' | 'sms' | null;
  mascotas: MascotaResumen[];
  notificaciones: Notificacion[];
}

export interface UpdatePerfilResponse {
  success: boolean;
  message: string;
  data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    canal_contacto: string;
  };
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
  data: null;
}