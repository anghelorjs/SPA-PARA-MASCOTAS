// src/pages/admin/dashboard/hooks/useDashboardAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { adminDashboardService } from '../services/admin.dashboard.service';
import type { 
  DashboardAdminResponse,
  DashboardKPIAdmin,
  GraficaCitasSemanales,
  OcupacionGroomer,
  TopServicio,
  TopProducto,
  AlertaStock
} from '../../../../services/types/admin';
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

export const useDashboardAdmin = () => {
  const [kpi, setKpi] = useState<DashboardKPIAdmin | null>(null);
  const [graficaCitas, setGraficaCitas] = useState<GraficaCitasSemanales | null>(null);
  const [ocupacionGroomers, setOcupacionGroomers] = useState<OcupacionGroomer[]>([]);
  const [topServicios, setTopServicios] = useState<TopServicio[]>([]);
  const [topProductos, setTopProductos] = useState<TopProducto[]>([]);
  const [alertasStock, setAlertasStock] = useState<AlertaStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const { showToast } = useToast();

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminDashboardService.getDashboard(fecha);
      setKpi(data.kpi);
      setGraficaCitas(data.grafica_citas_semana);
      setOcupacionGroomers(data.ocupacion_groomers);
      setTopServicios(data.top_servicios);
      setTopProductos(data.top_productos);
      setAlertasStock(data.alertas_stock);
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
    graficaCitas,
    ocupacionGroomers,
    topServicios,
    topProductos,
    alertasStock,
    isLoading,
    fecha,
    cambiarFecha,
    refresh: loadDashboard,
  };
};