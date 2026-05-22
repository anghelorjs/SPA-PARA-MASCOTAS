// src/pages/groomer/fichas/types/index.ts

export type FichaEstado = 'abierta' | 'cerrada';
export type FiltroEstadoFichas = 'todas' | 'abierta' | 'cerrada';

export interface FichaHoy {
  id: number;
  mascota: string;
  hora_apertura: string;
  estado: FichaEstado;
  servicio: string;
}

export interface FichaTodas {
  id: number;
  fecha_apertura: string;
  mascota: string;
  servicio: string;
  estado: FichaEstado;
}

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

export interface GaleriaHistorica {
  id: number;
  url: string;
  tipo: string;
  fecha: string;
  servicio: string;
}

export interface DetalleFichaResponse {
  ficha: {
    id: number;
    estado: FichaEstado;
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
  galeria_historica: GaleriaHistorica[];
}

export interface InsumoSearchResult {
  id: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
}

export interface ChecklistPredefinido {
  nombre: string;
  completado: boolean;
}