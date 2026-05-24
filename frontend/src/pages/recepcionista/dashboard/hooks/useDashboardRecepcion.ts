// src/pages/recepcionista/dashboard/hooks/useDashboardRecepcion.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { recepcionistaDashboardService } from '../services/recepcionista.dashboard.service';
import type { 
  DashboardRecepcionResponse,
  CitaDashboardRecepcion,
  EstadoGroomer,
  AlertaCita,
  DashboardKPIRecepcion
} from '../../../../services/types/recepcionista';
import { toDateInputValue } from '../../agenda/utils/date';

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

export const useDashboardRecepcion = () => {
  const [kpi, setKpi] = useState<DashboardKPIRecepcion | null>(null);
  const [groomers, setGroomers] = useState<EstadoGroomer[]>([]);
  const [alertas, setAlertas] = useState<AlertaCita[]>([]);
  const [citas, setCitas] = useState<CitaDashboardRecepcion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const { showToast } = useToast();

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await recepcionistaDashboardService.getDashboard(fecha);
      setKpi(data.kpi);
      setGroomers(data.estado_groomers);
      setAlertas(data.alertas_citas);
      setCitas(data.citas_del_dia);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      showToast(getErrorMessage(error, 'Error al cargar el dashboard'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fecha, showToast]);

  const cambiarFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    kpi,
    groomers,
    alertas,
    citas,
    isLoading,
    fecha,
    cambiarFecha,
    refresh: loadDashboard,
  };
};