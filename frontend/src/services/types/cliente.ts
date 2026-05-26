// src/services/types/cliente.ts
export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

export interface MascotaResumen {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
}

export interface PerfilCliente {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  canal_contacto: 'whatsapp' | 'telegram' | 'email' | 'sms' | null;
  mascotas: MascotaResumen[];
  notificaciones: Notificacion[];
}

export interface UpdatePerfilResponse {
  success: boolean;
  message: string;
  data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    canal_contacto: string;
  };
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

// ==================== DASHBOARD CLIENTE ====================

export interface ProximaCitaCliente {
  id: number;
  fecha: string;
  hora: string;
  servicio: string;
  groomer: string;
  mascota: string;
  estado: 'programada' | 'confirmada';
  estado_color: string;
}

export interface NotificacionReciente {
  id: number;
  tipo: string;
  mensaje_resumido: string;
  fecha: string;
  leida: boolean;
}

export interface RecomendacionCliente {
  id: number;
  recomendacion: string;
  mascota: string;
  fecha: string;
  servicio: string;
  groomer: string;
}

export interface DashboardClienteResponse {
  proxima_cita: ProximaCitaCliente | null;
  notificaciones: {
    recientes: NotificacionReciente[];
    total_no_leidas: number;
  };
  recomendacion: RecomendacionCliente | null;
  estadisticas: {
    total_mascotas: number;
    total_citas_completadas: number;
    total_compras: number;
  };
}

// ==================== MASCOTAS ====================

export interface RangoPesoCliente {
  idRango: number;
  nombre: string;
  pesoMinKg: number;
  pesoMaxKg: number;
}

export interface FotoMascota {
  id: number;
  url: string;
  tipo: 'perfil' | 'antes' | 'despues';
  fecha?: string;
}

export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  tamanio: string | null;
  peso_kg: number;
  rango_nombre: string | null;
  foto_perfil_url: string | null;
  fecha_nacimiento: string | null;
  temperamento: string | null;
  alergias: string[] | null;  // ← Asegurar que sea array
  restricciones: string[] | null;  // ← Asegurar que sea array
  vacunas: string[] | null;  // ← Asegurar que sea array
}

export interface HistorialServicio {
  id: number;
  fecha: string;
  servicio: string;
  groomer: string;
  observaciones: string | null;
  recomendaciones: string | null;
  fotos: FotoMascota[];
}

export interface GaleriaGrupo {
  ficha_id: number | null;
  fecha: string;
  servicio: string;
  fotos: FotoMascota[];
}

export interface DetalleMascotaResponse {
  mascota: Mascota & { fotos_perfil: FotoMascota[] };
  historial_servicios: HistorialServicio[];
  galeria_fotos: GaleriaGrupo[];
}

export interface CreateMascotaData {
  nombre: string;
  especie: string;
  raza?: string;
  tamanio?: string;
  pesoKg: number;
  fechaNacimiento?: string;
  temperamento?: string;
  alergias?: string[];
  restricciones?: string[];
  vacunas?: string[];
}

export type UpdateMascotaData = Partial<CreateMascotaData>;

export interface FotosSesionResponse {
  ficha_id: number;
  fecha: string;
  servicio: string;
  mascota: string;
  fotos: {
    antes: FotoMascota[];
    despues: FotoMascota[];
  };
}

// ==================== MIS CITAS ====================

export interface CitaCliente {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion: number;
  servicio: string;
  servicio_id: number;
  groomer: string;
  mascota: string;
  mascota_id: number;
  precio: number;
  estado: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'pendiente_confirmacion';
  estado_color: string;
  puede_cancelar: boolean;
}

export interface DetalleCitaCliente {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion: number;
  servicio: string;
  servicio_id: number;
  groomer: string;
  groomer_id: number;
  mascota: {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    peso_kg: number;
    rango_nombre: string | null;
    temperamento: string | null;
    alergias: string[] | null;
    restricciones: string[] | null;
  };
  precio: number;
  estado: string;
  observaciones: string | null;
  canal_notificacion: string;
}

// ==================== AGENDADO ====================

export interface MascotaAgendado {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  tamanio: string | null;
  peso_kg: number;
  rango_nombre: string | null;
  rango_id: number | null;
  temperamento: string | null;
}

export interface ServicioAgendado {
  id: number;
  nombre: string;
  duracion_minutos: number;
  precio: number;
  descripcion: string | null;
}

export interface SlotAgendado {
  id_groomer: number;
  groomer_nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface CreateCitaClienteData {
  idMascota: number;
  idServicio: number;
  idGroomer: number;
  fecha: string;
  hora_inicio: string;
  observaciones?: string;
}

// ==================== CATÁLOGO CLIENTE ====================

export interface VarianteCatalogo {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

export interface ProductoCatalogo {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  categoria_nombre: string;
  precio_desde: number;
  stock_total: number;
  variantes: VarianteCatalogo[];
  imagen_url: string | null;
}

export interface CategoriaCatalogo {
  id: number;
  nombre: string;
  cantidad_productos: number;
}

export interface ItemCarrito {
  idVariante: number;
  nombreProducto: string;
  nombreVariante: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  stock: number;
}

export interface CrearPedidoData {
  items: Array<{
    idVariante: number;
    cantidad: number;
  }>;
  canal: 'whatsapp' | 'telegram';
}

export interface PedidoResponse {
  pedido_id: number;
  subtotal: number;
  mensaje: string;
  enlace: string;
}