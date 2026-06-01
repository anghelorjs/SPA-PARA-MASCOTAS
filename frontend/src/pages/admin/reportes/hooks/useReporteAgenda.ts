// src/pages/admin/reportes/hooks/useReporteAgenda.ts
import { useState, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { adminReportesService } from '../services/admin.reportes.service';
import type { ReporteAgendaResponse } from '../../../../services/types/admin';
import { toDateInputValue } from '../../../recepcionista/agenda/utils/date';

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

export const useReporteAgenda = () => {
  const [data, setData] = useState<ReporteAgendaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fechaDesde, setFechaDesde] = useState(toDateInputValue(new Date(new Date().setDate(1))));
  const [fechaHasta, setFechaHasta] = useState(toDateInputValue(new Date()));
  const [groomerId, setGroomerId] = useState<number | undefined>(undefined);
  const { showToast } = useToast();

  const generarReporte = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminReportesService.getReporteAgenda({
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        groomer_id: groomerId,
      });
      setData(response);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al generar reporte de agenda'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fechaDesde, fechaHasta, groomerId, showToast]);

  return {
    data,
    isLoading,
    fechaDesde,
    fechaHasta,
    groomerId,
    setFechaDesde,
    setFechaHasta,
    setGroomerId,
    generarReporte,
  };
};
