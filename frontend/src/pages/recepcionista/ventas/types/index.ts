// src/pages/recepcionista/ventas/types/index.ts
import type { Venta, MedioPago, ItemCarrito, ProductoVenta, CategoriaVenta, ClienteVenta } from '../../../../services/types/recepcionista';

export type { Venta, MedioPago, ItemCarrito, ProductoVenta, CategoriaVenta, ClienteVenta };

export type FiltroEstadoVenta = 'todas' | 'pagado' | 'cancelado';
export type FiltroTipoVenta = 'todas' | 'producto' | 'servicio' | 'mixta';

export interface FiltroVentas {
  fecha: string;
  estado: FiltroEstadoVenta;
  tipo: FiltroTipoVenta;
}

export const ESTADO_LABELS: Record<string, string> = {
  pagado: 'Pagado',
  cancelado: 'Cancelado',
  pendiente: 'Pendiente',
};

export const ESTADO_COLORS: Record<string, string> = {
  pagado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  pendiente: 'bg-yellow-100 text-yellow-800',
};

export const MEDIO_PAGO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  qr: 'QR',
  transferencia: 'Transferencia',
};

export const MEDIO_PAGO_ICONS: Record<string, string> = {
  efectivo: '💵',
  qr: '📱',
  transferencia: '🏦',
};
