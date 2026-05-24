// src/pages/recepcionista/dashboard/pages/DashboardRecepcionista.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  UserGroupIcon, 
  BellAlertIcon, 
  ClipboardDocumentListIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { useDashboardRecepcion } from '../hooks/useDashboardRecepcion';
import { useAgendaRecepcion } from '../../agenda/hooks/useAgendaRecepcion';
import { KPICardsRecepcion } from '../components/KPICardsRecepcion';
import { EstadoGroomersList } from '../components/EstadoGroomersList';
import { AlertasCitas } from '../components/AlertasCitas';
import { TablaCitasDia } from '../components/TablaCitasDia';
import { ModalDetalleCitaRecepcion } from '../components/ModalDetalleCitaRecepcion';
import { formatLocalDate } from '../../agenda/utils/date';

export const DashboardRecepcionista = () => {
  const navigate = useNavigate();
  const { kpi, groomers, alertas, citas, isLoading, fecha, refresh } = useDashboardRecepcion();
  const { confirmarCita, cancelarCita } = useAgendaRecepcion();
  
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState<number | null>(null);

  const handleCitaClick = (citaId: number) => {
    setSelectedCitaId(citaId);
    setModalDetalleOpen(true);
  };

  const handleVerFicha = (fichaId: number) => {
    navigate(`/groomer/fichas/${fichaId}`);
  };

  const handleConfirmarCita = async (citaId: number) => {
    await confirmarCita(citaId);
    refresh();
  };

  const handleCancelarCita = async (citaId: number) => {
    await cancelarCita(citaId);
    refresh();
  };

  const fechaFormateada = formatLocalDate(fecha, {
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
            Panel de control - {fechaFormateada}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={() => navigate('/recepcionista/agenda')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* KPIs */}
      {kpi && <KPICardsRecepcion kpi={kpi} />}

      {/* Estado Groomers y Alertas - Grid 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Groomers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <UserGroupIcon className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold text-gray-800">Estado de Groomers</h2>
          </div>
          <div className="p-4">
            <EstadoGroomersList groomers={groomers} isLoading={isLoading} />
          </div>
        </div>

        {/* Alertas de Citas Próximas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <BellAlertIcon className="h-5 w-5 text-orange-500" />
            <h2 className="text-base font-semibold text-gray-800">Próximas Citas (30 min)</h2>
          </div>
          <div className="p-4">
            <AlertasCitas 
              alertas={alertas} 
              isLoading={isLoading} 
              onCitaClick={handleCitaClick}
            />
          </div>
        </div>
      </div>

      {/* Citas del Día */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-green-500" />
            <h2 className="text-base font-semibold text-gray-800">Citas del Día</h2>
          </div>
          <span className="text-xs text-gray-400">
            {citas.length} cita{citas.length !== 1 ? 's' : ''} programadas
          </span>
        </div>
        <div className="p-4">
          <TablaCitasDia 
            citas={citas} 
            isLoading={isLoading} 
            onCitaClick={handleCitaClick}
          />
        </div>
      </div>

      {/* Modal Detalle de Cita */}
      <ModalDetalleCitaRecepcion
        isOpen={modalDetalleOpen}
        citaId={selectedCitaId}
        onClose={() => {
          setModalDetalleOpen(false);
          setSelectedCitaId(null);
        }}
        onConfirmar={handleConfirmarCita}
        onCancelar={handleCancelarCita}
        onVerFicha={handleVerFicha}
        onRefresh={refresh}
      />
    </div>
  );
};