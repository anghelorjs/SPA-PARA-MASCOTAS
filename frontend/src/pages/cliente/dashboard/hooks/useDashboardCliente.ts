// src/pages/cliente/dashboard/hooks/useDashboardCliente.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { clienteDashboardService } from '../services/cliente.dashboard.service';
import type { 
  DashboardClienteResponse,
  ProximaCitaCliente,
  NotificacionReciente,
  RecomendacionCliente
} from '../../../../services/types/cliente';

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

export const useDashboardCliente = () => {
  const [proximaCita, setProximaCita] = useState<ProximaCitaCliente | null>(null);
  const [notificaciones, setNotificaciones] = useState<NotificacionReciente[]>([]);
  const [totalNotificacionesNoLeidas, setTotalNotificacionesNoLeidas] = useState(0);
  const [recomendacion, setRecomendacion] = useState<RecomendacionCliente | null>(null);
  const [estadisticas, setEstadisticas] = useState<{
    total_mascotas: number;
    total_citas_completadas: number;
    total_compras: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clienteDashboardService.getDashboard();
      setProximaCita(data.proxima_cita);
      setNotificaciones(data.notificaciones.recientes);
      setTotalNotificacionesNoLeidas(data.notificaciones.total_no_leidas);
      setRecomendacion(data.recomendacion);
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      showToast(getErrorMessage(error, 'Error al cargar el dashboard'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    proximaCita,
    notificaciones,
    totalNotificacionesNoLeidas,
    recomendacion,
    estadisticas,
    isLoading,
    refresh: loadDashboard,
  };
};