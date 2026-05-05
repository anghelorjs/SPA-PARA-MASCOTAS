// src/services/types/admin.ts
export interface PerfilAdmin {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: string;
  activo: boolean;
  creadoEn: string;
  ultimos_reportes: ReporteGenerado[];
}

export interface ReporteGenerado {
  idReporte: number;
  tipoReporte: string;
  fechaGenerado: string;
  fechaDesde: string;
  fechaHasta: string;
}

export interface PerfilAdminResponse {
  success: boolean;
  message: string;
  data: PerfilAdmin;
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