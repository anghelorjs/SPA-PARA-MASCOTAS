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

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: 'administrador' | 'recepcionista' | 'groomer' | 'cliente';
  activo: boolean;
  creadoEn: string;
  perfil_datos: PerfilData | null;
}

export interface PerfilData {
  idAdministrador?: number;
  idRecepcionista?: number;
  idGroomer?: number;
  idCliente?: number;
  turno?: string;
  especialidad?: string;
  maxServiciosSimultaneos?: number;
  direccion?: string;
  canalContacto?: string;
}

// ==================== DASHBOARD ADMIN ====================

export interface DashboardKPIAdmin {
  total_citas_hoy: number;
  ingresos_hoy: number;
  groomers_activos: number;
  mascotas_atendidas: number;
}

export interface GraficaCitaDia {
  fecha: string;
  dia: string;
  citas: number;
}

export interface GraficaCitasSemanales {
  semana_actual: GraficaCitaDia[];
  semana_anterior: GraficaCitaDia[];
}

export interface OcupacionGroomer {
  idGroomer: number;
  nombre: string;
  citas: number;
  porcentaje: number;
}

// Opcional pero no necesario
export interface TopServicio {
  nombre: string;
  total: number;  // ← bien
  ingresos?: number | string;  // ← podrías permitir string también
}

export interface TopProducto {
  nombre: string;
  total_vendidos: number;  // ← bien
  ingresos?: number | string;  // ← podrías permitir string también
}

export interface AlertaStock {
  idProducto?: number;
  idInsumo?: number;
  nombre: string;
  stock_total?: number;
  stock_actual?: number;
  stock_minimo: number;
  tipo: 'producto' | 'insumo';
}

export interface DashboardAdminResponse {
  kpi: DashboardKPIAdmin;
  grafica_citas_semana: GraficaCitasSemanales;
  ocupacion_groomers: OcupacionGroomer[];
  top_servicios: TopServicio[];
  top_productos: TopProducto[];
  alertas_stock: AlertaStock[];
}