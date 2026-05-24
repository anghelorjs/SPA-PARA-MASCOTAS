// src/pages/groomer/dashboard/hooks/useDashboardGroomer.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { groomerDashboardService } from '../services/groomer.dashboard.service';
import type { DashboardGroomerResponse, CitaDashboard, RecomendacionDashboard, DashboardKPI } from '../../../../services/types/groomer';
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

export const useDashboardGroomer = () => {
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);
  const [citas, setCitas] = useState<CitaDashboard[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const { showToast } = useToast();

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await groomerDashboardService.getDashboard(fecha);
      setKpi(data.kpi);
      setCitas(data.citas_del_dia);
      setRecomendaciones(data.ultimas_recomendaciones);
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
    citas,
    recomendaciones,
    isLoading,
    fecha,
    cambiarFecha,
    refresh: loadDashboard,
  };
};