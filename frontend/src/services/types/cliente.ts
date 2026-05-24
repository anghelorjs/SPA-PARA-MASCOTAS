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