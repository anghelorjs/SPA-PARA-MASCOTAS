// src/pages/admin/dashboard/pages/DashboardAdmin.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useDashboardAdmin } from '../hooks/useDashboardAdmin';
import { KPICardsAdmin } from '../components/KPICardsAdmin';
import { AlertasStock } from '../components/AlertasStock';
import { GraficaCitasSemanales } from '../components/GraficaCitasSemanales';
import { GraficaOcupacionGroomers } from '../components/GraficaOcupacionGroomers';
import { TablaTopServicios } from '../components/TablaTopServicios';
import { TablaTopProductos } from '../components/TablaTopProductos';
import { AccesosRapidos } from '../components/AccesosRapidos';
import { formatLocalDate } from '../../../recepcionista/agenda/utils/date';

export const DashboardAdmin = () => {
  const navigate = useNavigate();
  const {
    kpi,
    graficaCitas,
    ocupacionGroomers,
    topServicios,
    topProductos,
    alertasStock,
    isLoading,
    fecha,
    refresh,
  } = useDashboardAdmin();

  const fechaFormateada = formatLocalDate(fecha, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleVerProducto = (idProducto: number) => {
    navigate(`/admin/catalogo/productos?edit=${idProducto}`);
  };

  const handleVerInsumo = (idInsumo: number) => {
    navigate(`/admin/catalogo/insumos?edit=${idInsumo}`);
  };

  const handleVerAgenda = () => {
    navigate('/admin/agenda');
  };

  const handleGenerarReporte = () => {
    navigate('/admin/reportes');
  };

  const handleVerAlertasStock = () => {
    navigate('/admin/catalogo/insumos');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Panel de control - {fechaFormateada}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      {kpi && <KPICardsAdmin kpi={kpi} />}

      {/* Alertas de Stock */}
      {alertasStock.length > 0 && (
        <AlertasStock
          alertas={alertasStock}
          isLoading={isLoading}
          onVerProducto={handleVerProducto}
          onVerInsumo={handleVerInsumo}
        />
      )}

      {/* Gráficas - Grid 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Citas por Día */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          {graficaCitas && (
            <GraficaCitasSemanales data={graficaCitas} isLoading={isLoading} />
          )}
        </div>

        {/* Gráfica de Ocupación por Groomer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <GraficaOcupacionGroomers data={ocupacionGroomers} isLoading={isLoading} />
        </div>
      </div>

      {/* Tablas - Grid 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Servicios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800">Top 5 Servicios Más Solicitados</h3>
          </div>
          <div className="p-4">
            <TablaTopServicios servicios={topServicios} isLoading={isLoading} />
          </div>
        </div>

        {/* Top 5 Productos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800">Top 5 Productos Más Vendidos</h3>
          </div>
          <div className="p-4">
            <TablaTopProductos productos={topProductos} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Accesos Rápidos</h3>
        <AccesosRapidos
          onVerAgenda={handleVerAgenda}
          onGenerarReporte={handleGenerarReporte}
          onVerAlertasStock={handleVerAlertasStock}
        />
      </div>
    </div>
  );
};