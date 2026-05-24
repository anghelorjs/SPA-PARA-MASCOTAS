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

// ==================== VENTAS ====================

export type MedioPago = 'efectivo' | 'qr' | 'transferencia';
export type EstadoVenta = 'pagado' | 'cancelado' | 'pendiente';

export interface VarianteProducto {
  idVariante: number;
  nombreVariante: string;
  precio: number;
  stock: number;
}

export interface ProductoVenta {
  idProducto: number;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio_base: number;
  variantes: VarianteProducto[];
}

export interface CategoriaVenta {
  id: number;
  nombre: string;
  cantidad_productos: number;
}

export interface ItemCarrito {
  idVariante: number;
  nombreProducto: string;
  nombreVariante: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stock: number;
}

export interface DetalleVenta {
  idDetalleVenta: number;
  idVariante: number | null;
  tipo: 'producto' | 'servicio';  // ← Asegurar que existe
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  variante?: {
    idVariante: number;
    nombreVariante: string;
    precio: number;
    producto: {
      idProducto: number;
      nombre: string;
    };
  };
}

export interface FacturaVenta {
  idFactura: number;
  numeroFactura: string;
  fechaEmision: string;
  montoTotal: number;
  estado: string;
  pagos?: Array<{
    idPago: number;
    monto: number;
    metodo: string;
    fechaPago?: string | null;
    referencia: string | null;
  }>;
}

export interface Venta {
  idVenta: number;
  idCliente: number | null;
  idRecepcionista: number;
  fecha: string;
  total: number;
  medioPago: MedioPago;
  estado: EstadoVenta;
  tipo_venta?: 'producto' | 'servicio' | 'mixta' | 'sin_items';
  created_at: string;
  updated_at: string;
  cliente?: {
    idCliente: number;
    user: {
      idUsuario: number;
      nombre: string;
      apellido: string;
      email: string;
      telefono: string | null;
    };
  };
  detalleVentas: DetalleVenta[];
  factura?: FacturaVenta;
}

export interface ClienteVenta {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
}

export interface VentaResponse {
  ventas: {
    current_page: number;
    data: Venta[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  total_dia: number;
  resumen?: {
    general: number;
    productos: number;
    servicios: number;
  };
}

export interface CreateVentaData {
  idCliente?: number | null;
  items: Array<{
    idVariante: number;
    cantidad: number;
  }>;
  medioPago: MedioPago;
}

// ==================== DASHBOARD RECEPCIONISTA ====================

export interface DashboardKPIRecepcion {
  total_citas_hoy: number;
  citas_confirmadas_hoy: number;
  citas_en_curso: number;
  citas_completadas_hoy: number;
}

export interface EstadoGroomer {
  id: number;
  nombre: string;
  estado: 'libre' | 'ocupado' | 'con_citas' | 'ausente';
  total_citas_hoy: number;
}

export interface AlertaCita {
  id: number;
  mascota: string;
  groomer: string;
  hora: string;
  servicio: string;
  minutos_restantes: number;
}

export interface CitaDashboardRecepcion {
  id: number;
  hora_inicio: string;
  hora_fin: string;
  mascota: string;
  cliente: string;
  groomer: string;
  servicio: string;
  duracion: number;
  estado: string;
  color: string;
  tiene_ficha: boolean;
  id_ficha: number | null;
  precio: number;
}

export interface DetalleCitaRecepcion {
  id: number;
  mascota: string;
  cliente: string;
  cliente_id: number;
  groomer: string;
  groomer_id: number;
  servicio: string;
  servicio_id: number;
  hora_inicio: string;
  hora_fin: string;
  duracion: number;
  estado: string;
  precio: number;
  observaciones: string | null;
  tiene_ficha: boolean;
  id_ficha: number | null;
}

export interface DashboardRecepcionResponse {
  kpi: DashboardKPIRecepcion;
  estado_groomers: EstadoGroomer[];
  alertas_citas: AlertaCita[];
  citas_del_dia: CitaDashboardRecepcion[];
}