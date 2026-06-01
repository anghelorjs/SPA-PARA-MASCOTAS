// src/pages/admin/reportes/hooks/useReporteInventario.ts
import { useState, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { adminReportesService } from '../services/admin.reportes.service';
import type { ReporteInventarioResponse } from '../../../../services/types/admin';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
};

export const useReporteInventario = () => {
  const [data, setData] = useState<ReporteInventarioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const { showToast } = useToast();

  const generarReporte = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminReportesService.getReporteInventario({
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        categoria_id: categoriaId,
      });
      setData(response);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al generar reporte de inventario'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fechaDesde, fechaHasta, categoriaId, showToast]);

  return {
    data,
    isLoading,
    fechaDesde,
    fechaHasta,
    categoriaId,
    setFechaDesde,
    setFechaHasta,
    setCategoriaId,
    generarReporte,
  };
};