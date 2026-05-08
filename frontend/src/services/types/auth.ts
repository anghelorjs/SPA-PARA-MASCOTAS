// src/services/types/auth.ts

export interface User {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: 'administrador' | 'recepcionista' | 'groomer' | 'cliente';
  activo: boolean;
  creadoEn: string;
  must_change_password?: boolean;
}

export type UserRole = User['rol'];

export interface PerfilAdministrador {
  idAdministrador: number;
  idUsuario: number;
}

export interface PerfilRecepcionista {
  idRecepcionista: number;
  idUsuario: number;
  turno: 'matutino' | 'vespertino' | 'completo';
}

export interface PerfilGroomer {
  idGroomer: number;
  idUsuario: number;
  especialidad: string | null;
  maxServiciosSimultaneos: number;
}

export interface PerfilCliente {
  idCliente: number;
  idUsuario: number;
  direccion: string | null;
  preferencias: string | null;
  canalContacto: 'whatsapp' | 'telegram' | 'email' | 'sms' | null;
}

export type Perfil = 
  | PerfilAdministrador 
  | PerfilRecepcionista 
  | PerfilGroomer 
  | PerfilCliente;

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    perfil: Perfil;
    token: string;
    token_type: string;
    must_change_password?: boolean;
  };
}

export interface LoginResponseData {
  user: User;
  perfil: Perfil;
  token: string;
  token_type: string;
  must_change_password?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  captcha_id: string;  // ← Cambiado
  captcha: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    cliente: PerfilCliente;
    token: string;
    token_type: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  data: null;
}
