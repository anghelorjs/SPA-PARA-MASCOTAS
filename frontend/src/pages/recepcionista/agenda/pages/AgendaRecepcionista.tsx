// src/pages/recepcionista/agenda/pages/AgendaRecepcionista.tsx
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CalendarioRecepcion } from '../components/CalendarioRecepcion';
import { ModalCitaDetalle } from '../components/ModalCitaDetalle';
import { ModalNuevaCitaWizard } from '../components/ModalNuevaCitaWizard';
import { useAgendaRecepcion } from '../hooks/useAgendaRecepcion';
import { useNavigate } from 'react-router-dom';
import { toDateInputValue } from '../utils/date';

export const AgendaRecepcionista = () => {
  const navigate = useNavigate();
  const {
    citas,
    groomers,
    fecha,
    groomerFiltro,
    isLoading,
    setGroomerFiltro,
    cambiarFecha,
    confirmarCita,
    cancelarCita,
    loadCitas,
  } = useAgendaRecepcion();

  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalNuevaCitaOpen, setModalNuevaCitaOpen] = useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState<number | null>(null);
  const [slotFecha, setSlotFecha] = useState<string | undefined>(undefined);
  const [slotGroomerId, setSlotGroomerId] = useState<number | undefined>(undefined);

  const handleCitaClick = (citaId: number) => {
    setSelectedCitaId(citaId);
    setModalDetalleOpen(true);
  };

  const handleSlotClick = (date: Date, groomerId?: number) => {
    const fechaStr = toDateInputValue(date);
    setSlotFecha(fechaStr);
    setSlotGroomerId(groomerId);
    setModalNuevaCitaOpen(true);
  };

  const handleVerFicha = (fichaId: number) => {
    navigate(`/groomer/fichas/${fichaId}`);
  };

  const handleReprogramar = (citaId: number) => {
    // Obtener la fecha de la cita para abrir el wizard
    const cita = citas.find(c => c.id === citaId);
    if (cita) {
      setSlotFecha(cita.start.split('T')[0]);
      setSlotGroomerId(cita.groomer_id);
      setModalNuevaCitaOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de citas y horarios por groomer
          </p>
        </div>
        <button
          onClick={() => {
            setSlotFecha(toDateInputValue(new Date()));
            setSlotGroomerId(undefined);
            setModalNuevaCitaOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Nueva Cita
        </button>
      </div>

      <CalendarioRecepcion
        citas={citas}
        groomers={groomers}
        fecha={fecha}
        groomerFiltro={groomerFiltro}
        onFechaChange={cambiarFecha}
        onGroomerFiltroChange={setGroomerFiltro}
        onCitaClick={handleCitaClick}
        onSlotClick={handleSlotClick}
        isLoading={isLoading}
      />

      <ModalCitaDetalle
        isOpen={modalDetalleOpen}
        citaId={selectedCitaId}
        onClose={() => {
          setModalDetalleOpen(false);
          setSelectedCitaId(null);
        }}
        onConfirmar={confirmarCita}
        onCancelar={cancelarCita}
        onReprogramar={handleReprogramar}
        onVerFicha={handleVerFicha}
      />

      <ModalNuevaCitaWizard
        isOpen={modalNuevaCitaOpen}
        onClose={() => {
          setModalNuevaCitaOpen(false);
          setSlotFecha(undefined);
          setSlotGroomerId(undefined);
        }}
        fechaInicial={slotFecha}
        groomerInicial={slotGroomerId}
        onCitaCreada={loadCitas}
      />
    </div>
  );
};
