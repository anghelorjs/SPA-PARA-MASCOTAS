/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/admin/agenda/components/ModalNuevaCitaWizardAdmin.tsx
import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNuevaCitaAdmin } from '../hooks/useAgendaAdmin';
import { toDateInputValue } from '../../../recepcionista/agenda/utils/date';

// Reutilizar componentes del recepcionista
import { Paso1Cliente } from '../../../recepcionista/agenda/components/Paso1Cliente';
import { Paso2Mascota } from '../../../recepcionista/agenda/components/Paso2Mascota';
import { Paso3Servicio } from '../../../recepcionista/agenda/components/Paso3Servicio';
import { Paso4Slot } from '../../../recepcionista/agenda/components/Paso4Slot';
import { Paso5Confirmacion } from '../../../recepcionista/agenda/components/Paso5Confirmacion';
import { NuevoClienteModal } from '../../../recepcionista/agenda/components/NuevoClienteModal';
import { NuevaMascotaModal } from '../../../recepcionista/agenda/components/NuevaMascotaModal';
import { adminAgendaService } from '../services/admin.agenda.service';

interface ModalNuevaCitaWizardAdminProps {
  isOpen: boolean;
  onClose: () => void;
  fechaInicial?: string;
  groomerInicial?: number;
  onCitaCreada: () => void;
}

const STEPS = [
  { number: 1, title: 'Cliente', emoji: '👤', desc: 'Buscar o registrar' },
  { number: 2, title: 'Mascota', emoji: '🐾', desc: 'Seleccionar mascota' },
  { number: 3, title: 'Servicio', emoji: '✂️', desc: 'Elegir servicio' },
  { number: 4, title: 'Horario', emoji: '📅', desc: 'Fecha y groomer' },
  { number: 5, title: 'Confirmar', emoji: '✅', desc: 'Revisar y confirmar' },
];

export const ModalNuevaCitaWizardAdmin = ({
  isOpen,
  onClose,
  fechaInicial,
  groomerInicial,
  onCitaCreada,
}: ModalNuevaCitaWizardAdminProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [showNuevoClienteModal, setShowNuevoClienteModal] = useState(false);
  const [showNuevaMascotaModal, setShowNuevaMascotaModal] = useState(false);
  const [disponibilidadError, setDisponibilidadError] = useState<string | null>(null);

  const {
    isLoading,
    slotsDisponibles,
    isLoadingSlots,
    clientes,
    isLoadingClientes,
    mascotas,
    servicios,
    isLoadingServicios,
    isLoadingMascotas,
    selectedCliente,
    selectedMascota,
    selectedServicio,
    selectedSlot,
    fechaSeleccionada,
    setFechaSeleccionada,
    setSelectedCliente,
    setSelectedMascota,
    setSelectedServicio,
    setSelectedSlot,
    buscarClientes,
    loadMascotas,
    loadServiciosConPrecios,
    loadSlotsDisponibles,
    crearCita,
    limpiarWizard,
  } = useNuevaCitaAdmin();

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      limpiarWizard();
      setCurrentStep(1);
      setObservaciones('');
      setDisponibilidadError(null);
      if (fechaInicial) {
        setFechaSeleccionada(fechaInicial);
      }
    }
  }, [isOpen, limpiarWizard, fechaInicial, setFechaSeleccionada]);

  // Al cambiar cliente → cargar mascotas
  useEffect(() => {
    if (selectedCliente) {
      loadMascotas(selectedCliente.id);
      setSelectedMascota(null);
      setSelectedServicio(null);
      setSelectedSlot(null);
    }
  }, [selectedCliente, loadMascotas, setSelectedMascota, setSelectedServicio, setSelectedSlot]);

  // Al cambiar mascota → cargar servicios
  useEffect(() => {
    if (selectedMascota) {
      loadServiciosConPrecios(selectedMascota.id);
      setSelectedServicio(null);
      setSelectedSlot(null);
    }
  }, [selectedMascota, loadServiciosConPrecios, setSelectedServicio, setSelectedSlot]);

  // Al cambiar servicio → cargar slots
  useEffect(() => {
    if (selectedServicio && selectedMascota && fechaSeleccionada) {
      loadSlotsDisponibles(selectedServicio.id, selectedMascota.id, fechaSeleccionada, groomerInicial);
      setSelectedSlot(null);
      setDisponibilidadError(null);
    }
  }, [selectedServicio, selectedMascota, fechaSeleccionada, groomerInicial, loadSlotsDisponibles, setSelectedSlot]);

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return selectedCliente !== null;
      case 2: return selectedMascota !== null;
      case 3: return selectedServicio !== null;
      case 4: return selectedSlot !== null;
      default: return true;
    }
  };

  const handleConfirmar = async () => {
    if (!selectedCliente || !selectedMascota || !selectedServicio || !selectedSlot || !fechaSeleccionada) return;

    const slotsActualizados = await loadSlotsDisponibles(
      selectedServicio.id,
      selectedMascota.id,
      fechaSeleccionada,
      groomerInicial
    );
    const slotSigueLibre = slotsActualizados.some(
      (slot) =>
        slot.groomer_id === selectedSlot.groomer_id &&
        slot.hora_inicio === selectedSlot.hora_inicio &&
        slot.hora_fin === selectedSlot.hora_fin
    );

    if (!slotSigueLibre) {
      setDisponibilidadError('Ese groomer ya no está disponible en ese horario. Selecciona una opción libre actualizada.');
      setSelectedSlot(null);
      setCurrentStep(4);
      return;
    }

    const fechaHoraCompleta = `${fechaSeleccionada} ${selectedSlot.hora_inicio}`;
    const result = await crearCita({
      idCliente: selectedCliente.id,
      idMascota: selectedMascota.id,
      idServicio: selectedServicio.id,
      idGroomer: selectedSlot.groomer_id,
      fechaHoraInicio: fechaHoraCompleta,
      observaciones: observaciones || undefined,
    });
    if (result) {
      onCitaCreada();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}
      >
        <div
          className="relative w-full flex flex-col overflow-hidden"
          style={{
            maxWidth: 720,
            maxHeight: '92vh',
            backgroundColor: '#ffffff',
            borderRadius: 24,
            boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #1e4d9b 60%, #2563eb 100%)',
              padding: '24px 28px 20px',
              flexShrink: 0,
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  🐾
                </div>
                <div>
                  <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                    Nueva Cita
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>
                    Panel de Administración
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 10,
                  padding: 8,
                  display: 'flex',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                <XMarkIcon style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STEPS.map((step, idx) => {
                const done = step.number < currentStep;
                const active = step.number === currentStep;
                return (
                  <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          backgroundColor: done ? '#22c55e' : active ? '#ffffff' : 'rgba(255,255,255,0.12)',
                          color: done ? '#fff' : active ? '#1e3a5f' : 'rgba(255,255,255,0.4)',
                          border: active ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
                          boxShadow: active ? '0 0 0 4px rgba(255,255,255,0.15)' : 'none',
                        }}
                      >
                        {done ? <CheckIcon style={{ width: 14, height: 14 }} /> : step.number}
                      </div>
                      <span
                        style={{
                          marginTop: 4,
                          fontSize: 10,
                          fontWeight: active ? 600 : 400,
                          color: active ? '#fff' : done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.title}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        style={{
                          height: 2,
                          flex: 1,
                          backgroundColor: done ? '#22c55e' : 'rgba(255,255,255,0.15)',
                          margin: '0 4px',
                          marginBottom: 14,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Label */}
          <div style={{ padding: '14px 28px 0', flexShrink: 0 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 18 }}>{STEPS[currentStep - 1].emoji}</span>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Paso {currentStep}: {STEPS[currentStep - 1].title}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  {STEPS[currentStep - 1].desc}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 12, height: 2, backgroundColor: '#f1f5f9', borderRadius: 1, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentStep - 1) / 4) * 100}%`,
                  backgroundColor: '#2563eb',
                  borderRadius: 1,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', minHeight: 0 }}>
            {currentStep === 1 && (
              <Paso1Cliente
                clientes={clientes}
                onBuscar={buscarClientes}
                onSelectCliente={setSelectedCliente}
                onNuevoCliente={() => setShowNuevoClienteModal(true)}
                selectedCliente={selectedCliente}
                isLoading={isLoadingClientes}
              />
            )}
            {currentStep === 2 && (
              <Paso2Mascota
                mascotas={mascotas}
                onSelectMascota={setSelectedMascota}
                onNuevaMascota={() => setShowNuevaMascotaModal(true)}
                selectedMascota={selectedMascota}
                isLoading={isLoadingMascotas}
              />
            )}
            {currentStep === 3 && (
              <Paso3Servicio
                servicios={servicios}
                onSelectServicio={setSelectedServicio}
                selectedServicio={selectedServicio}
                isLoading={isLoadingServicios}
              />
            )}
            {currentStep === 4 && (
              <Paso4Slot
                slots={slotsDisponibles}
                onSelectSlot={(slot) => {
                  setDisponibilidadError(null);
                  setSelectedSlot(slot);
                }}
                selectedSlot={selectedSlot}
                fecha={fechaSeleccionada || toDateInputValue(new Date())}
                isLoading={isLoadingSlots}
                duracionServicio={selectedServicio?.duracion_minutos}
                groomerInicial={groomerInicial}
                error={disponibilidadError}
              />
            )}
            {currentStep === 5 && selectedCliente && selectedMascota && selectedServicio && selectedSlot && (
              <div className="space-y-4">
                <Paso5Confirmacion
                  cliente={selectedCliente}
                  mascota={selectedMascota}
                  servicio={selectedServicio}
                  slot={selectedSlot}
                  fecha={fechaSeleccionada || toDateInputValue(new Date())}
                  observaciones={observaciones}
                  onConfirmar={handleConfirmar}
                  isConfirming={isLoading}
                />
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Observaciones <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span>
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={2}
                    placeholder="Notas adicionales sobre la cita..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 13,
                      color: '#1e293b',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      backgroundColor: '#f8fafc',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.backgroundColor = '#fff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Nav */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 28px 20px',
              borderTop: '1px solid #f1f5f9',
              flexShrink: 0,
              backgroundColor: '#fafafa',
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              style={{
                padding: '9px 20px',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                backgroundColor: '#fff',
                color: '#374151',
                fontSize: 13,
                fontWeight: 600,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 1 ? 0.4 : 1,
              }}
            >
              ← Anterior
            </button>

            <div style={{ display: 'flex', gap: 6 }}>
              {STEPS.map((s) => (
                <div
                  key={s.number}
                  style={{
                    width: s.number === currentStep ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      s.number < currentStep ? '#22c55e' : s.number === currentStep ? '#2563eb' : '#e2e8f0',
                    transition: 'all 0.25s ease',
                  }}
                />
              ))}
            </div>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                disabled={!canGoNext()}
                style={{
                  padding: '9px 22px',
                  borderRadius: 10,
                  border: 'none',
                  background: canGoNext() ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#e2e8f0',
                  color: canGoNext() ? '#fff' : '#9ca3af',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: canGoNext() ? 'pointer' : 'not-allowed',
                  boxShadow: canGoNext() ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                Siguiente →
              </button>
            ) : (
              <div style={{ width: 110 }} />
            )}
          </div>
        </div>
      </div>

      {/* Sub-modales */}
      <NuevoClienteModal
        isOpen={showNuevoClienteModal}
        onClose={() => setShowNuevoClienteModal(false)}
        onClienteCreado={(cliente) => {
          setSelectedCliente(cliente);
          setShowNuevoClienteModal(false);
        }}
        createCliente={adminAgendaService.createCliente}
      />
      <NuevaMascotaModal
        isOpen={showNuevaMascotaModal}
        onClose={() => setShowNuevaMascotaModal(false)}
        clienteId={selectedCliente?.id || 0}
        onMascotaCreada={(mascota) => {
          setSelectedMascota(mascota);
          setShowNuevaMascotaModal(false);
        }}
        createMascota={adminAgendaService.createMascota}
      />
    </>
  );
};
