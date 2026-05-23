// src/pages/admin/agenda/types/index.ts

// ==================== CITAS ====================
export type CitaEstado = 'programada' | 'pendiente_confirmacion' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada';

export interface CitaCalendario {
  id: number;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  groomer_id: number;
  extendedProps: {
    id: number;
    estado: CitaEstado;
    groomer: string;
    mascota: string;
    mascota_id: number;
    cliente_id: number;
    servicio: string;
    servicio_id: number;
    duracion: number;
    observaciones: string | null;
    precio: number;
    tiene_ficha: boolean;
    id_ficha: number | null;
  };
}

export interface GroomerOption {
  id: number;
  nombre: string;
}

export interface SlotDisponible {
  groomer_id: number;
  groomer_nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface CitaDetalle {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion: number;
  mascota: string;
  mascota_id: number;
  cliente: string;
  cliente_id: number;
  groomer: string;
  groomer_id: number;
  servicio: string;
  servicio_id: number;
  estado: CitaEstado;
  observaciones: string | null;
  precio: number;
  tiene_ficha: boolean;
  id_ficha: number | null;
}

// ==================== DISPONIBILIDAD ====================
export interface DisponibilidadDia {
  id: number;
  diaSemana: number;
  diaNombre: string;
  horaInicio: string;
  horaFin: string;
}

export interface GroomerDisponibilidad {
  id: number;
  nombre: string;
  especialidad: string | null;
  maxServiciosSimultaneos: number;
  disponibilidades: DisponibilidadDia[];
}

export interface Bloqueo {
  id: number;
  groomer_id: number;
  groomer_nombre: string;
  fecha: string | null;
  motivo: string;
  created_at: string;
}

export interface DiaSemana {
  id: number;
  nombre: string;
}

// ==================== SERVICIOS ====================
export interface RangoPeso {
  idRango: number;
  nombre: string;
  pesoMinKg: number;
  pesoMaxKg: number;
  factorTiempo: number;
  factorPrecio: number;
  servicios_count?: number;
}

export interface ServicioRango {
  idRango: number;
  nombre?: string;
  duracionAjustadaMin: number;
  precioAjustado: number;
}

export interface Servicio {
  idServicio: number;
  nombre: string;
  duracionMinutos: number;
  precioBase: number;
  admiteDobleBooking: boolean;
  rangosPeso: ServicioRango[];
}

export interface ServicioWithRangos extends Servicio {
  rangosPeso: ServicioRango[];
}

export interface CreateServicioData {
  nombre: string;
  duracionMinutos: number;
  precioBase: number;
  admiteDobleBooking: boolean;
  preciosPorRango: {
    idRango: number;
    duracionAjustadaMin: number;
    precioAjustado: number;
  }[];
}

export interface CreateRangoPesoData {
  nombre: string;
  pesoMinKg: number;
  pesoMaxKg: number;
  factorTiempo: number;
  factorPrecio: number;
}

// ==================== SLOTS PARA NUEVA CITA ====================
export interface ClienteSearchResult {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  canal_contacto: string;
}

export interface MascotaData {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  peso_kg: number;
  rango_nombre: string | null;
  temperamento: string | null;
}

export interface ServicioConPrecio {
  id: number;
  nombre: string;
  duracion_minutos: number;
  precio: number;
  admite_doble_booking: boolean;
}

// ==================== CONSTANTES ====================
export const ESTADO_COLORES: Record<CitaEstado, string> = {
  programada: '#3b82f6',
  pendiente_confirmacion: '#f59e0b',
  confirmada: '#10b981',
  en_curso: '#f59e0b',
  completada: '#6b7280',
  cancelada: '#ef4444',
};

export const ESTADO_LABELS: Record<CitaEstado, string> = {
  programada: 'Programada',
  pendiente_confirmacion: 'Pendiente',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const DIAS_SEMANA = [
  { id: 0, nombre: 'Domingo' },
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
];