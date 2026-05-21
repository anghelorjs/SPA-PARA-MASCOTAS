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

// ==================== AGENDA GROOMER ====================

export type CitaEstadoGroomer = 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada';

export interface HistorialFicha {
  id: number;
  fecha: string;
  servicio: string;
  observaciones: string | null;
  recomendaciones: string | null;
  fotos: HistorialFoto[];
}

export interface HistorialFoto {
  id: number;
  url: string;
  tipo: 'antes' | 'despues' | 'perfil';
}

export interface MascotaHistorial {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  peso_kg: number;
  rango_nombre: string | null;
  temperamento: string | null;
  alergias: string | null;
  restricciones: string | null;
  vacunas: string | null;
  historial: HistorialFicha[];
}

export interface CitaGroomer {
  id: number;
  hora_inicio: string;
  hora_fin: string;
  duracion: number;
  mascota: {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    peso_kg: number;
    rango_nombre: string | null;
    temperamento: string | null;
    alergias: string | null;
    restricciones: string | null;
    vacunas: string | null;
    historial: HistorialFicha[];
  };
  servicio: {
    id: number;
    nombre: string;
  };
  estado: CitaEstadoGroomer;
  estado_texto: string;
  estado_color: string;
  tiene_ficha: boolean;
  ficha_id: number | null;
  ficha_abierta: boolean;
}

export interface IniciarServicioResponse {
  cita_id: number;
  ficha_id: number;
}

export interface HistorialMascotaResponse {
  mascota: {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    peso_kg: number;
    rango_nombre: string | null;
    temperamento: string | null;
    alergias: string | null;
    restricciones: string | null;
    vacunas: string | null;
  };
  historial: HistorialFicha[];
}