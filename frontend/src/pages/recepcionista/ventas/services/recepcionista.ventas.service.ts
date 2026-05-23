// src/pages/recepcionista/ventas/services/recepcionista.ventas.service.ts
import api from '../../../../services/api';
import type { Venta, CreateVentaData, ProductoVenta, CategoriaVenta, FacturaVenta } from '../../../../services/types/recepcionista';

type ParamValue = string | number | boolean;

type ProductoApiResponse = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio_base: number;
  variantes: Array<{
    id: number;
    nombre: string;
    precio: number;
    stock: number;
  }>;
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface VentasListResponse {
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

export const recepcionistaVentasService = {
  /**
   * Obtener ventas del día
   */
  async getVentas(fecha: string, estado?: string, tipo: string = 'todas', page: number = 1): Promise<VentasListResponse> {
    const params: Record<string, ParamValue> = { fecha, page, per_page: 15 };
    if (estado && estado !== 'todas') params.estado = estado;
    if (tipo && tipo !== 'todas') params.tipo = tipo;
    const response = await api.get<ApiResponse<VentasListResponse>>('/recepcionista/ventas', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle de una venta
   */
  async getVenta(id: number): Promise<Venta> {
    const response = await api.get<ApiResponse<Venta>>(`/recepcionista/ventas/${id}`);
    return response.data.data;
  },

  /**
   * Crear nueva venta
   */
  async crearVenta(data: CreateVentaData): Promise<Venta> {
    const response = await api.post<ApiResponse<Venta>>('/recepcionista/ventas', data);
    return response.data.data;
  },

  /**
   * Buscar productos para agregar a la venta
   */
  async buscarProductos(search?: string, categoriaId?: number | null): Promise<ProductoVenta[]> {
    const params: Record<string, string | number> = {};
    if (search) params.search = search;
    if (categoriaId) params.categoria_id = categoriaId;

    const response = await api.get<ApiResponse<ProductoApiResponse[]>>('/recepcionista/productos/buscar', {
      params: Object.keys(params).length > 0 ? params : undefined
    });

    return response.data.data.map((producto) => ({
      idProducto: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio_base: producto.precio_base,
      variantes: producto.variantes.map((variante) => ({
        idVariante: variante.id,
        nombreVariante: variante.nombre,
        precio: variante.precio,
        stock: variante.stock,
      })),
    }));
  },

  /**
   * Obtener categorías para filtro de productos
   */
  async getCategorias(): Promise<CategoriaVenta[]> {
    const response = await api.get<ApiResponse<CategoriaVenta[]>>('/recepcionista/categorias');
    return response.data.data;
  },

  /**
   * Obtener factura de una venta
   */
  async getFactura(idVenta: number): Promise<FacturaVenta> {
    const response = await api.get<ApiResponse<FacturaVenta>>(`/recepcionista/ventas/${idVenta}/factura`);
    return response.data.data;
  },
};
