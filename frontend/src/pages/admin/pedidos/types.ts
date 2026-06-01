export type EstadoPedido = 'pendiente' | 'confirmado' | 'pagado' | 'cancelado';
export type MedioPagoPedido = 'efectivo' | 'qr' | 'transferencia';

export interface ItemPedido {
  idItemPedido: number;
  idVariante: number;
  producto: string;
  variante: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stockActual: number;
}

export interface Pedido {
  idPedido: number;
  idCliente: number;
  cliente: {
    nombre: string;
    apellido: string;
    telefono: string | null;
    email: string;
  } | null;
  fecha: string;
  total: number;
  estado: EstadoPedido;
  canal: 'whatsapp' | 'telegram' | null;
  mensajeGenerado: string | null;
  items: ItemPedido[];
}

export interface ResumenPedidos {
  pendiente: number;
  confirmado: number;
  pagado: number;
  cancelado: number;
}

export interface PaginatedPedidos {
  current_page: number;
  data: Pedido[];
  last_page: number;
  total: number;
}
