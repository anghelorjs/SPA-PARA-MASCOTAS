// src/pages/admin/dashboard/pages/DashboardAdmin.tsx
import { useState, useEffect } from 'react';
import { adminDashboardService } from '../services/admin.dashboard.service';
import { KPICards } from '../components/KPICards';
import { GraficaCitas } from '../components/GraficaCitas';
import { OcupacionGroomers } from '../components/OcupacionGroomers';
import { TopServicios } from '../components/TopServicios';
import { TopProductos } from '../components/TopProductos';
import { AlertasStock } from '../components/AlertasStock';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await adminDashboardService.getDashboard();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
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
      <div className="mt-6">
        <AlertasStock data={data.alertas_stock} />
      </div>
    </div>
  );
};