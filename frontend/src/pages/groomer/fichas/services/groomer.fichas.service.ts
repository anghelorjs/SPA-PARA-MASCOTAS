// src/pages/groomer/fichas/services/groomer.fichas.service.ts
import api from '../../../../services/api';
import type {
  FichaHoy,
  FichaTodas,
  DetalleFichaResponse,
  InsumoSearchResult,
  ChecklistPredefinido,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
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
}

export const groomerFichasService = {
  /**
   * Obtener fichas del día (pestaña Hoy)
   */
  async getFichasHoy(fecha: string, estado: string = 'todas', page: number = 1): Promise<PaginatedResponse<FichaHoy>> {
    const response = await api.get<ApiResponse<PaginatedResponse<FichaHoy>>>('/groomer/fichas/hoy', {
      params: { fecha, estado, page, per_page: 15 }
    });
    return response.data.data;
  },

  /**
   * Obtener todas las fichas (histórico)
   */
  async getTodasFichas(params: {
    search?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    estado?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<FichaTodas>> {
    const response = await api.get<ApiResponse<PaginatedResponse<FichaTodas>>>('/groomer/fichas/todas', { params });
    return response.data.data;
  },

  /**
   * Obtener detalle completo de una ficha
   */
  async getDetalleFicha(fichaId: number): Promise<DetalleFichaResponse> {
    const response = await api.get<ApiResponse<DetalleFichaResponse>>(`/groomer/fichas/${fichaId}`);
    return response.data.data;
  },

  /**
   * Actualizar estado de ingreso
   */
  async updateEstadoIngreso(fichaId: number, data: {
    estadoIngreso?: string;
    nudos?: boolean;
    tienePulgas?: boolean;
    tieneHeridas?: boolean;
  }): Promise<void> {
    await api.put(`/groomer/fichas/${fichaId}/estado-ingreso`, data);
  },

  /**
   * Obtener checklist predefinido
   */
  async getChecklistPredefinido(): Promise<ChecklistPredefinido[]> {
    const response = await api.get<ApiResponse<ChecklistPredefinido[]>>('/groomer/checklist/predefinido');
    return response.data.data;
  },

  /**
   * Actualizar checklist completo
   */
  async updateChecklist(fichaId: number, checklist: ChecklistPredefinido[]): Promise<{
    completados: number;
    total: number;
    puede_cerrar: boolean;
  }> {
    const response = await api.put<ApiResponse<{ completados: number; total: number; puede_cerrar: boolean }>>(
      `/groomer/fichas/${fichaId}/checklist`,
      { checklist }
    );
    return response.data.data;
  },

  /**
   * Buscar insumos
   */
  async buscarInsumos(search: string): Promise<InsumoSearchResult[]> {
    const response = await api.get<ApiResponse<InsumoSearchResult[]>>('/groomer/insumos/buscar', {
      params: { search }
    });
    return response.data.data;
  },

  /**
   * Agregar insumo a la ficha
   */
  async agregarInsumo(fichaId: number, idInsumo: number, cantidadUsada: number): Promise<InsumoFicha> {
    const response = await api.post<ApiResponse<InsumoFicha>>(`/groomer/fichas/${fichaId}/insumos`, {
      idInsumo,
      cantidadUsada
    });
    return response.data.data;
  },

  /**
   * Eliminar insumo de la ficha
   */
  async eliminarInsumo(fichaId: number, detalleId: number): Promise<void> {
    await api.delete(`/groomer/fichas/${fichaId}/insumos/${detalleId}`);
  },

  /**
   * Actualizar observaciones
   */
  async updateObservaciones(fichaId: number, data: {
    observaciones?: string;
    recomendaciones?: string;
  }): Promise<{ observaciones: string | null; recomendaciones: string | null }> {
    const response = await api.put<ApiResponse<{ observaciones: string | null; recomendaciones: string | null }>>(
      `/groomer/fichas/${fichaId}/observaciones`,
      data
    );
    return response.data.data;
  },

  /**
   * Subir foto
   */
  async uploadFoto(fichaId: number, tipo: 'antes' | 'despues', file: File): Promise<FotoFicha> {
    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('foto', file);
    
    const response = await api.post<ApiResponse<FotoFicha>>(`/groomer/fichas/${fichaId}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  /**
   * Eliminar foto
   */
  async deleteFoto(fichaId: number, fotoId: number): Promise<void> {
    await api.delete(`/groomer/fichas/${fichaId}/fotos/${fotoId}`);
  },

  /**
   * Cerrar ficha
   */
  async cerrarFicha(fichaId: number): Promise<{ ficha_id: number; cita_id: number; fecha_cierre: string }> {
    const response = await api.post<ApiResponse<{ ficha_id: number; cita_id: number; fecha_cierre: string }>>(
      `/groomer/fichas/${fichaId}/cerrar`
    );
    return response.data.data;
  },
};