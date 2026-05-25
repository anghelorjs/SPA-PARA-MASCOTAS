// src/pages/cliente/citas/pages/MisCitas.tsx
import { useState, type ReactNode } from 'react';
import { PlusIcon, ArrowPathIcon, CalendarIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useCitasCliente, useDetalleCitaCliente } from '../hooks/useCitasCliente';
import { TablaCitasCliente } from '../components/TablaCitasCliente';
import { ModalDetalleCitaCliente } from '../components/ModalDetalleCitaCliente';
import { ModalConfirmarCancelacion } from '../components/ModalConfirmarCancelacion';
import { AgendadoWizard } from './AgendadoWizard';
import type { CitaCliente } from '../../../../services/types/cliente';

type TabType = 'proximas' | 'pasadas' | 'canceladas';

const TABS: { id: TabType; label: string; icon: ReactNode }[] = [
  { id: 'proximas', label: 'Proximas', icon: <CalendarIcon className="h-4 w-4" /> },
  { id: 'pasadas', label: 'Pasadas', icon: <ClockIcon className="h-4 w-4" /> },
  { id: 'canceladas', label: 'Canceladas', icon: <XCircleIcon className="h-4 w-4" /> },
];

export const MisCitas = () => {
  const { citas, tipoActivo, isLoading, cambiarTipo, cancelarCita, refresh } = useCitasCliente();
  const { isOpen, cita: citaDetalle, isLoading: isLoadingDetalle, loadDetalle, cerrar } = useDetalleCitaCliente();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [agendadoOpen, setAgendadoOpen] = useState(false);
  const [citaCancelando, setCitaCancelando] = useState<CitaCliente | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleVerDetalle = (citaId: number) => {
    loadDetalle(citaId);
  };

  const handleCancelarClick = (cita: CitaCliente) => {
    setCitaCancelando(cita);
    setCancelModalOpen(true);
  };

  const handleConfirmarCancelacion = async () => {
    if (!citaCancelando) return;
    setIsCancelling(true);
    const success = await cancelarCita(citaCancelando.id);
    setIsCancelling(false);
    if (success) {
      setCancelModalOpen(false);
      setCitaCancelando(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus citas y agenda nuevos servicios
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
            onClick={() => setAgendadoOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Agendar nueva cita
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => cambiarTipo(tab.id)}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                tipoActivo === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'proximas' && citas.filter(c => c.puede_cancelar).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                  {citas.filter(c => c.puede_cancelar).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <TablaCitasCliente
        citas={citas}
        isLoading={isLoading}
        tipoActivo={tipoActivo}
        onVerDetalle={handleVerDetalle}
        onCancelar={handleCancelarClick}
      />

      <ModalDetalleCitaCliente
        isOpen={isOpen}
        cita={citaDetalle}
        isLoading={isLoadingDetalle}
        onClose={cerrar}
      />

      <ModalConfirmarCancelacion
        isOpen={cancelModalOpen}
        cita={citaCancelando}
        isLoading={isCancelling}
        onClose={() => {
          setCancelModalOpen(false);
          setCitaCancelando(null);
        }}
        onConfirmar={handleConfirmarCancelacion}
      />

      <AgendadoWizard
        isOpen={agendadoOpen}
        onClose={() => setAgendadoOpen(false)}
        onCitaCreada={refresh}
      />
    </div>
  );
};
