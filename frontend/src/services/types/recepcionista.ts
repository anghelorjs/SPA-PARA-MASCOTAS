// src/services/types/recepcionista.ts
export interface PerfilRecepcionista {
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

export interface ResumenDia {
  fecha: string;
  citas_creadas: number;
  citas_confirmadas: number;
  citas_canceladas: number;
  total_gestionadas: number;
}

export interface UpdatePerfilResponse {
  success: boolean;
  message: string;
  data: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
  data: null;
}