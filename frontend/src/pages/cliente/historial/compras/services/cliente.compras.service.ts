// src/pages/cliente/historial/compras/services/cliente.compras.service.ts
import api from '../../../../../services/api';
import type { CompraHistorial, CancelarPedidoResponse } from '../../../../../services/types/cliente';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const clienteComprasService = {
  /**
   * Obtener historial de compras
   */
  async getCompras(estado?: string, fechaDesde?: string, fechaHasta?: string): Promise<CompraHistorial[]> {
    const params: Record<string, any> = {};
    if (estado && estado !== 'todas') params.estado = estado;
    if (fechaDesde) params.fecha_desde = fechaDesde;
    if (fechaHasta) params.fecha_hasta = fechaHasta;
    const response = await api.get<ApiResponse<CompraHistorial[]>>('/cliente/historial/compras', { params });
    return response.data.data;
  },

  /**
   * Cancelar pedido pendiente
   */
  async cancelarPedido(id: number): Promise<void> {
    const response = await api.post<ApiResponse<CancelarPedidoResponse>>(`/cliente/historial/pedidos/${id}/cancelar`);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },
};