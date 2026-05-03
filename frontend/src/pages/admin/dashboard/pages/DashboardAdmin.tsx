import { useState, useEffect } from 'react';
import { adminDashboardService } from '../services/admin.dashboard.service';
import { KPICards } from '../components/KPICards';
import { GraficaCitas } from '../components/GraficaCitas';
import { OcupacionGroomers } from '../components/OcupacionGroomers';
import { TopServicios } from '../components/TopServicios';
import { TopProductos } from '../components/TopProductos';
import { AlertasStock } from '../components/AlertasStock';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface DashboardData {
  kpi: {
    total_citas_hoy: number;
    ingresos_hoy: number;
    groomers_activos: number;
    mascotas_atendidas: number;
  };
  grafica_citas_semana: {
    semana_actual: Array<{ fecha: string; dia: string; citas: number }>;
    semana_anterior: Array<{ fecha: string; dia: string; citas: number }>;
  };
  ocupacion_groomers: Array<{ idGroomer: number; nombre: string; citas: number; porcentaje: number }>;
  top_servicios: Array<{ nombre: string; total: number }>;
  top_productos: Array<{ nombre: string; total_vendidos: number }>;
  alertas_stock: Array<{ idProducto?: number; idInsumo?: number; nombre: string; stock_total?: number; stock_actual?: number; tipo: string }>;
}

export const DashboardAdmin = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await adminDashboardService.getDashboard();
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Resumen general del negocio</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-3 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* KPIs */}
        <KPICards kpi={data.kpi} />
        
        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <GraficaCitas 
            semanaActual={data.grafica_citas_semana.semana_actual}
            semanaAnterior={data.grafica_citas_semana.semana_anterior}
          />
          <OcupacionGroomers data={data.ocupacion_groomers} />
        </div>
        
        {/* Tablas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <TopServicios data={data.top_servicios} />
          <TopProductos data={data.top_productos} />
        </div>
        
        {/* Alertas */}
        {data.alertas_stock.length > 0 && (
          <div className="mt-6">
            <AlertasStock data={data.alertas_stock} />
          </div>
        )}
      </div>
    </div>
  );
};