// src/pages/admin/agenda/pages/AgendaAdmin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ClockIcon, WrenchIcon } from '@heroicons/react/24/outline';
import { useAgendaAdmin, useDetalleCitaAdmin } from '../hooks/useAgendaAdmin';
import { CalendarioAdmin } from '../components/CalendarioAdmin';
import { ModalCitaDetalleAdmin } from '../components/ModalCitaDetalleAdmin';
import { ModalNuevaCitaWizardAdmin } from '../components/ModalNuevaCitaWizardAdmin';
import { ModalDisponibilidad } from '../components/ModalDisponibilidad';
import { ModalServicios } from '../components/ModalServicios';
import { toDateInputValue } from '../../../recepcionista/agenda/utils/date';

type ModalType = 'disponibilidad' | 'servicios' | null;

export const AgendaAdmin = () => {
  const navigate = useNavigate();
  const {
    citas,
    groomers,
    fechaInicio,
    fechaFin,
    groomerFiltro,
    vista,
    isLoading,
    setGroomerFiltro,
    cambiarFecha,
    cambiarVista,
    refresh,
  } = useAgendaAdmin();

  const detalleCita = useDetalleCitaAdmin();
  const [modalNuevaCitaOpen, setModalNuevaCitaOpen] = useState(false);
  const [modalGestionOpen, setModalGestionOpen] = useState<ModalType>(null);
  const [slotFecha, setSlotFecha] = useState<string | undefined>(undefined);
  const [slotGroomerId, setSlotGroomerId] = useState<number | undefined>(undefined);

  const handleCitaClick = (citaId: number) => {
    detalleCita.loadDetalle(citaId);
  };

  const handleSlotClick = (date: Date, groomerId?: number) => {
    const fechaStr = toDateInputValue(date);
    setSlotFecha(fechaStr);
    setSlotGroomerId(groomerId);
    setModalNuevaCitaOpen(true);
  };

  const handleConfirmarCita = async () => {
    if (detalleCita.cita) {
      await detalleCita.confirmarCita(detalleCita.cita.id, refresh);
    }
  };

  const handleCancelarCita = async () => {
    if (detalleCita.cita) {
      await detalleCita.cancelarCita(detalleCita.cita.id, refresh);
    }
  };

  const handleReprogramarCita = () => {
    if (detalleCita.cita) {
      setSlotFecha(detalleCita.cita.fecha);
      setSlotGroomerId(detalleCita.cita.groomer_id);
      setModalNuevaCitaOpen(true);
      detalleCita.cerrar();
    }
  };

  const handleVerFicha = (fichaId: number) => {
    navigate(`/groomer/fichas/${fichaId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de citas, horarios y servicios
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalGestionOpen('disponibilidad')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ClockIcon className="h-4 w-4" />
            Gestionar disponibilidad
          </button>
          <button
            onClick={() => setModalGestionOpen('servicios')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <WrenchIcon className="h-4 w-4" />
            Configurar servicios
          </button>
          <button
            onClick={() => {
              setSlotFecha(fechaInicio);
              setSlotGroomerId(undefined);
              setModalNuevaCitaOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Calendario */}
      <CalendarioAdmin
        citas={citas}
        groomers={groomers}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        vista={vista}
        groomerFiltro={groomerFiltro}
        onFechaChange={cambiarFecha}
        onVistaChange={cambiarVista}
        onGroomerFiltroChange={setGroomerFiltro}
        onCitaClick={handleCitaClick}
        onSlotClick={handleSlotClick}
        isLoading={isLoading}
      />

      {/* Modal Detalle Cita */}
      <ModalCitaDetalleAdmin
        isOpen={detalleCita.isOpen}
        cita={detalleCita.cita}
        isLoading={detalleCita.isLoading}
        isConfirming={detalleCita.isConfirming}
        isCancelling={detalleCita.isCancelling}
        onClose={detalleCita.cerrar}
        onConfirmar={handleConfirmarCita}
        onCancelar={handleCancelarCita}
        onReprogramar={handleReprogramarCita}
        onVerFicha={handleVerFicha}
      />

      {/* Modal Nueva Cita */}
      <ModalNuevaCitaWizardAdmin
        isOpen={modalNuevaCitaOpen}
        onClose={() => {
          setModalNuevaCitaOpen(false);
          setSlotFecha(undefined);
          setSlotGroomerId(undefined);
        }}
        fechaInicial={slotFecha}
        groomerInicial={slotGroomerId}
        onCitaCreada={refresh}
      />

      {/* Modal Gestión de Disponibilidad */}
      <ModalDisponibilidad
        isOpen={modalGestionOpen === 'disponibilidad'}
        onClose={() => setModalGestionOpen(null)}
        onRefresh={refresh}
      />

      {/* Modal Gestión de Servicios y Rangos */}
      <ModalServicios
        isOpen={modalGestionOpen === 'servicios'}
        onClose={() => setModalGestionOpen(null)}
      />
    </div>
  );
};
