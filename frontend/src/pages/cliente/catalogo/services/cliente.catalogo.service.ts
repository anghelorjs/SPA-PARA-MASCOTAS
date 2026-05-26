// src/pages/cliente/catalogo/services/cliente.catalogo.service.ts
import api from '../../../../services/api';
import type { 
  ProductoCatalogo, 
  CategoriaCatalogo,
  CrearPedidoData,
  PedidoResponse
} from '../../../../services/types/cliente';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const clienteCatalogoService = {
  /**
   * Obtener productos del catálogo
   */
  async getProductos(params?: { search?: string; categoria_id?: number }): Promise<ProductoCatalogo[]> {
    const response = await api.get<ApiResponse<ProductoCatalogo[]>>('/cliente/catalogo/productos', { params });
    return response.data.data;
  },

  /**
   * Obtener categorías para filtros
   */
  async getCategorias(): Promise<CategoriaCatalogo[]> {
    const response = await api.get<ApiResponse<CategoriaCatalogo[]>>('/cliente/catalogo/categorias');
    return response.data.data;
  },

  /**
   * Crear pedido (WhatsApp/Telegram)
   */
  async crearPedido(data: CrearPedidoData): Promise<PedidoResponse> {
    const response = await api.post<ApiResponse<PedidoResponse>>('/cliente/catalogo/pedido', data);
    return response.data.data;
  },
};