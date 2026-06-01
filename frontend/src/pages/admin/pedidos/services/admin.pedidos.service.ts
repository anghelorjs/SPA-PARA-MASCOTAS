import api from '../../../../services/api';
import type { EstadoPedido, MedioPagoPedido, PaginatedPedidos, Pedido, ResumenPedidos } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PedidosIndexResponse {
  pedidos: PaginatedPedidos;
  resumen: ResumenPedidos;
}

export const adminPedidosService = {
  async listar(params: { estado?: EstadoPedido | 'todos'; page?: number }) {
    const response = await api.get<ApiResponse<PedidosIndexResponse>>('/admin/pedidos', { params });
    return response.data.data;
  },

  async detalle(id: number): Promise<Pedido> {
    const response = await api.get<ApiResponse<Pedido>>(`/admin/pedidos/${id}`);
    return response.data.data;
  },

  async resumen(): Promise<ResumenPedidos> {
    const response = await api.get<ApiResponse<ResumenPedidos>>('/admin/pedidos/resumen');
    return response.data.data;
  },

  async confirmar(id: number): Promise<Pedido> {
    const response = await api.post<ApiResponse<Pedido>>(`/admin/pedidos/${id}/confirmar`);
    return response.data.data;
  },

  async pagar(id: number, medioPago: MedioPagoPedido) {
    const response = await api.post<ApiResponse<{ pedido: Pedido; venta_id: number }>>(
      `/admin/pedidos/${id}/pagar`,
      { medioPago },
    );
    return response.data.data;
  },
};
