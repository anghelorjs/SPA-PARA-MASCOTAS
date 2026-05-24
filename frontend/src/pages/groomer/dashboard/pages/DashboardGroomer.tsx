// src/pages/groomer/dashboard/pages/DashboardGroomer.tsx
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ChatBubbleLeftIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useDashboardGroomer } from '../hooks/useDashboardGroomer';
import { KPICardsGroomer } from '../components/KPICardsGroomer';
import { ListaCitasDia } from '../components/ListaCitasDia';
import { RecomendacionesList } from '../components/RecomendacionesList';
import { formatLocalDate } from '../../../recepcionista/agenda/utils/date';

export const DashboardGroomer = () => {
  const navigate = useNavigate();
  const { kpi, citas, recomendaciones, isLoading, refresh } = useDashboardGroomer();

  const handleAbrirFicha = (citaId: number, fichaId?: number | null) => {
    if (fichaId) {
      navigate(`/groomer/fichas/${fichaId}`);
    } else {
      // Si no tiene ficha, ir a la agenda para iniciar servicio
      navigate('/groomer/agenda');
    }
  };

  const handleVerFichaRecomendacion = (fichaId: number) => {
    navigate(`/groomer/fichas/${fichaId}`);
  };

  const fechaFormateada = formatLocalDate(new Date().toISOString().split('T')[0], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen de tu jornada laboral - {fechaFormateada}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      {kpi && <KPICardsGroomer kpi={kpi} onRefresh={refresh} />}

      {/* Citas del día y Recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Citas del día - 2 columnas */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              Citas del día
            </h2>
            <button
              onClick={() => navigate('/groomer/agenda')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Ver agenda completa →
            </button>
          </div>
          <ListaCitasDia
            citas={citas}
            isLoading={isLoading}
            onAbrirFicha={handleAbrirFicha}
          />
        </div>

        {/* Recomendaciones - 1 columna */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ChatBubbleLeftIcon className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">Últimas recomendaciones</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <RecomendacionesList
              recomendaciones={recomendaciones}
              isLoading={isLoading}
              onVerFicha={handleVerFichaRecomendacion}
            />
          </div>
          
          {/* Enlace rápido a fichas */}
          <div className="mt-4">
            <button
              onClick={() => navigate('/groomer/fichas')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <ClipboardDocumentListIcon className="h-4 w-4" />
              Ver todas mis fichas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};