import type { Venta } from "../../pages/recepcionista/ventas/types";

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

// ==================== CATÁLOGO - CATEGORÍAS ====================

export interface Categoria {
  idCategoria: number;
  nombre: string;
  tipo: 'producto' | 'insumo';
  descripcion: string | null;
  productos_count?: number;
  insumos_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoriaData {
  nombre: string;
  tipo: 'producto' | 'insumo';
  descripcion?: string;
}

export type UpdateCategoriaData = Partial<CreateCategoriaData>;

// ==================== CATÁLOGO - PRODUCTOS ====================

export interface VarianteProducto {
  idVariante: number;
  idProducto: number;
  nombreVariante: string;
  precio: number;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

export interface Producto {
  idProducto: number;
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  precioBase: number;
  activo: boolean;
  stock_total?: number;
  alerta_stock?: boolean;
  categoria?: {
    idCategoria: number;
    nombre: string;
  };
  variantes?: VarianteProducto[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateVarianteData {
  nombreVariante: string;
  precio: number;
  stock: number;
}

export interface CreateProductoData {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  variantes: CreateVarianteData[];
}

export interface UpdateProductoData {
  idCategoria?: number;
  nombre?: string;
  descripcion?: string;
  precioBase?: number;
  activo?: boolean;
}

export interface UpdateVarianteData {
  nombreVariante?: string;
  precio?: number;
  stock?: number;
}

// ==================== CATÁLOGO - INSUMOS ====================

export interface Insumo {
  idInsumo: number;
  idCategoria: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
  alerta_stock?: boolean;
  nivel_stock?: 'verde' | 'amarillo' | 'rojo';
  categoria?: {
    idCategoria: number;
    nombre: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateInsumoData {
  idCategoria: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
}

export type UpdateInsumoData = Partial<CreateInsumoData>;

export interface AjustarStockData {
  tipo: 'entrada' | 'ajuste';
  cantidad: number;
  motivo: string;
}

export interface ConsumoHistorico {
  id: number;
  cantidadUsada: number;
  created_at: string;
  fichaGrooming?: {
    idFicha: number;
    cita: {
      mascota: {
        nombre: string;
      };
      servicio: {
        nombre: string;
      };
    };
  };
}

// ==================== CATÁLOGO - MOVIMIENTOS ====================

export interface MovimientoInventario {
  id: number;
  fecha: string;
  producto_id: number;
  producto_nombre: string;
  tipoMovimiento: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  stock_resultante: number | null;
}

export interface TipoMovimiento {
  id: string;
  nombre: string;
}

export interface ProductoMovimiento {
  id: number;
  nombre: string;
  variantes: Array<{
    id: number;
    nombre: string;
    stock_actual: number;
  }>;
}

export interface CreateMovimientoData {
  idProducto: number;
  tipoMovimiento: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  variante_id: number;
  motivo: string;
}

// Generic paginated response used across APIs
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
}

export interface MovimientosResponse {
  movimientos: PaginatedResponse<MovimientoInventario>;
  tipos_movimiento: TipoMovimiento[];
}

// ==================== CLIENTES ADMIN ====================

export interface ClienteAdmin {
  idCliente: number;
  idUsuario: number;
  direccion: string | null;
  canalContacto: 'whatsapp' | 'telegram' | 'email' | 'sms' | null;
  user: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    activo: boolean;
  };
  cant_mascotas: number;
  ultima_cita: string | null;
  ultima_cita_servicio: string | null;
  created_at?: string;
}

export interface CreateClienteAdminData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  canalContacto?: 'whatsapp' | 'telegram' | 'email' | 'sms';
}

export interface UpdateClienteAdminData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  canalContacto?: 'whatsapp' | 'telegram' | 'email' | 'sms';
  activo?: boolean;
}

export interface PerfilClienteAdmin {
  cliente: {
    idCliente: number;
    direccion: string | null;
    canalContacto: string | null;
    user: {
      idUsuario: number;
      nombre: string;
      apellido: string;
      email: string;
      telefono: string | null;
      activo: boolean;
    };
    mascotas: MascotaAdmin[];
    ventas: Venta[];
  };
  estadisticas: {
    total_citas: number;
    total_gastado: number;
    mascotas_registradas: number;
  };
}

// ==================== MASCOTAS ADMIN ====================

export interface MascotaAdmin {
  idMascota: number;
  idCliente: number;
  nombre: string;
  especie: string;
  raza: string | null;
  tamanio: string | null;
  pesoKg: number;
  rango_nombre: string | null;
  fecha_nacimiento: string | null;
  temperamento: string | null;
  alergias: string[] | null;
  restricciones: string[] | null;
  vacunas: string[] | null;
  ultima_cita: string | null;
  ultimo_servicio: string | null;
  cliente?: {
    idCliente: number;
    user: {
      nombre: string;
      apellido: string;
    };
  };
  rangoPeso?: {
    idRango: number;
    nombre: string;
  };
}

export interface CreateMascotaAdminData {
  idCliente: number;
  nombre: string;
  especie: string;
  raza?: string;
  tamanio?: string;
  pesoKg?: number;
  fechaNacimiento?: string;
  temperamento?: string;
  alergias?: string[];
  restricciones?: string[];
  vacunas?: string[];
}

export interface FichaMascotaAdmin {
  mascota: MascotaAdmin & {
    citas: Array<{
      idCita: number;
      fechaHoraInicio: string;
      servicio: { nombre: string };
      groomer: { user: { nombre: string; apellido: string } };
      fichaGrooming: { idFicha: number } | null;
    }>;
    fotos: Array<{
      idFoto: number;
      urlFoto: string;
      tipo: string;
    }>;
  };
  estadisticas: {
    total_citas: number;
    citas_completadas: number;
    fotos_registradas: number;
  };
}