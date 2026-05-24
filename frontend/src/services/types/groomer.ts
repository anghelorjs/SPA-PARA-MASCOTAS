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

// ==================== FICHAS GROOMER ====================

export interface ChecklistItem {
  id: number;
  nombre: string;
  completado: boolean;
  observacion: string | null;
}

export interface InsumoFicha {
  id: number;
  insumo_id: number;
  insumo_nombre: string;
  unidad_medida: string;
  cantidad_usada: number;
}

export interface FotoFicha {
  id: number;
  url: string;
  tipo: 'antes' | 'despues';
  fecha: string;
}

export interface DetalleFichaResponse {
  ficha: {
    id: number;
    estado: 'abierta' | 'cerrada';
    fecha_apertura: string;
    fecha_cierre: string | null;
    puede_cerrar: boolean;
    progreso_checklist: number;
  };
  cita: {
    id: number;
    hora_inicio: string;
    hora_fin: string;
  };
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
  servicio: {
    id: number;
    nombre: string;
    duracion: number;
    precio: number;
  };
  groomer: {
    id: number;
    nombre: string;
  };
  estado_ingreso: {
    estadoIngreso: string | null;
    nudos: boolean;
    tienePulgas: boolean;
    tieneHeridas: boolean;
  };
  checklist: ChecklistItem[];
  insumos: InsumoFicha[];
  fotos: {
    antes: FotoFicha[];
    despues: FotoFicha[];
  };
  observaciones: {
    observaciones: string | null;
    recomendaciones: string | null;
  };
  galeria_historica: Array<{
    id: number;
    url: string;
    tipo: string;
    fecha: string;
    servicio: string;
  }>;
}

// ==================== DASHBOARD GROOMER ====================

export interface DashboardKPI {
  total_citas_hoy: number;
  citas_completadas: number;
  citas_en_curso: number;
  citas_pendientes: number;
  proxima_cita: {
    hora: string;
    mascota: string;
    minutos_restantes: number;
  } | null;
}

export interface CitaDashboard {
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

export interface RecomendacionDashboard {
  id: number;
  mascota: string;
  servicio: string;
  recomendacion: string;
  fecha: string;
}

export interface DashboardGroomerResponse {
  kpi: DashboardKPI;
  citas_del_dia: CitaDashboard[];
  ultimas_recomendaciones: RecomendacionDashboard[];
}