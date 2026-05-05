// src/services/types/groomer.ts
export interface PerfilGroomer {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: string;
  especialidad: string | null;
  max_servicios_simultaneos: number;
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
    especialidad: string | null;
    max_servicios_simultaneos: number;
  };
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
  data: null;
}