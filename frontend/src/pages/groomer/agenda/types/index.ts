// src/pages/groomer/agenda/types/index.ts
import type { CitaGroomer, CitaEstadoGroomer } from '../../../../services/types/groomer';

export type { CitaGroomer, CitaEstadoGroomer };

export type FiltroEstado = 'todas' | 'pendientes' | 'en_curso' | 'completadas';

export interface FiltroEstadoOption {
  value: FiltroEstado;
  label: string;
  color: string;
}

export const FILTRO_ESTADO_OPTIONS: FiltroEstadoOption[] = [
  { value: 'todas', label: 'Todas', color: '#64748b' },
  { value: 'pendientes', label: 'Pendientes', color: '#3b82f6' },
  { value: 'en_curso', label: 'En curso', color: '#f59e0b' },
  { value: 'completadas', label: 'Completadas', color: '#10b981' },
];

export const getFiltroQuery = (filtro: FiltroEstado): string => {
  switch (filtro) {
    case 'pendientes': return 'programada,confirmada';
    case 'en_curso': return 'en_curso';
    case 'completadas': return 'completada';
    default: return 'todas';
  }
};