// src/pages/cliente/citas/pages/AgendadoWizard.tsx
import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XMarkIcon,
  CheckIcon,
  HeartIcon,
  ScissorsIcon,
  CalendarIcon,
  CheckCircleIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import { useAgendadoCliente } from '../hooks/useAgendadoCliente';
import { toDateInputValue, formatLocalDate, parseLocalDate } from '../../../recepcionista/agenda/utils/date';
import type { SlotAgendado } from '../../../../services/types/cliente';

interface AgendadoWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCitaCreada?: () => void;
}

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getTomorrow = (): Date => {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const STEPS = [
  { number: 1, title: 'Mascota', icon: HeartIcon, desc: 'Selecciona tu mascota' },
  { number: 2, title: 'Servicio', icon: ScissorsIcon, desc: 'Elige el servicio' },
  { number: 3, title: 'Horario', icon: CalendarIcon, desc: 'Fecha, hora y groomer' },
  { number: 4, title: 'Confirmar', icon: CheckCircleIcon, desc: 'Revisa los datos' },
];

const slotKey = (slot: SlotAgendado) => `${slot.id_groomer}-${slot.hora_inicio}-${slot.hora_fin}`;

export const AgendadoWizard = ({ isOpen = true, onClose, onCitaCreada }: AgendadoWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [disponibilidadError, setDisponibilidadError] = useState<string | null>(null);
  const {
    mascotas,
    servicios,
    slots,
    selectedMascota,
    selectedServicio,
    selectedSlot,
    fechaSeleccionada,
    isLoadingMascotas,
    isLoadingServicios,
    isLoadingSlots,
    isCreating,
    setSelectedMascota,
    setSelectedServicio,
    setSelectedSlot,
    setFechaSeleccionada,
    loadServicios,
    loadSlots,
    crearCita,
    limpiarWizard,
  } = useAgendadoCliente();

  useEffect(() => {
    if (isOpen) {
      limpiarWizard();
      setCurrentStep(1);
      setObservaciones('');
      setDisponibilidadError(null);
    }
  }, [isOpen, limpiarWizard]);

  useEffect(() => {
    if (selectedMascota) {
      loadServicios(selectedMascota.id);
      setSelectedServicio(null);
      setSelectedSlot(null);
      setDisponibilidadError(null);
    }
  }, [selectedMascota, loadServicios, setSelectedServicio, setSelectedSlot]);

  useEffect(() => {
    if (selectedServicio && selectedMascota && fechaSeleccionada) {
      loadSlots(selectedServicio.id, selectedMascota.id, fechaSeleccionada);
      setSelectedSlot(null);
      setDisponibilidadError(null);
    }
  }, [selectedServicio, selectedMascota, fechaSeleccionada, loadSlots, setSelectedSlot]);

  if (!isOpen) return null;

  const closeWizard = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate('/cliente/mis-citas');
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return selectedMascota !== null;
      case 2: return selectedServicio !== null;
      case 3: return selectedSlot !== null;
      default: return true;
    }
  };

  const handleConfirmar = async () => {
    if (!selectedMascota || !selectedServicio || !selectedSlot || !fechaSeleccionada) return;

    const slotsActualizados = await loadSlots(selectedServicio.id, selectedMascota.id, fechaSeleccionada);
    const slotSigueLibre = slotsActualizados.some((slot) => slotKey(slot) === slotKey(selectedSlot));

    if (!slotSigueLibre) {
      setDisponibilidadError('Ese horario ya no esta disponible. Selecciona una opcion actualizada.');
      setSelectedSlot(null);
      setCurrentStep(3);
      return;
    }

    const success = await crearCita({
      idMascota: selectedMascota.id,
      idServicio: selectedServicio.id,
      idGroomer: selectedSlot.id_groomer,
      fecha: fechaSeleccionada,
      hora_inicio: selectedSlot.hora_inicio,
      observaciones: observaciones || undefined,
    });

    if (success) {
      onCitaCreada?.();
      closeWizard();
    }
  };

  const fechaFormateada = fechaSeleccionada
    ? formatLocalDate(fechaSeleccionada, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const selectedDate = fechaSeleccionada ? parseLocalDate(fechaSeleccionada) : getTomorrow();

  const slotsPorHora = slots.reduce((acc, slot) => {
    if (!acc[slot.hora_inicio]) acc[slot.hora_inicio] = [];
    acc[slot.hora_inicio].push(slot);
    return acc;
  }, {} as Record<string, SlotAgendado[]>);
  const horasOrdenadas = Object.keys(slotsPorHora).sort((a, b) => a.localeCompare(b));

  const contentByStep: Record<number, ReactNode> = {
    1: (
      <div>
        {isLoadingMascotas ? (
          <LoadingBlock />
        ) : mascotas.length === 0 ? (
          <EmptyState
            icon={<HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />}
            title="No tienes mascotas registradas"
            actionLabel="Registrar mascota"
            onAction={() => navigate('/cliente/mis-mascotas')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mascotas.map((mascota) => (
              <button
                key={mascota.id}
                onClick={() => setSelectedMascota(mascota)}
                className={`text-left p-4 border rounded-lg transition-all ${
                  selectedMascota?.id === mascota.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <HeartIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{mascota.nombre}</h3>
                    <p className="text-sm text-gray-500">{mascota.especie} - {mascota.raza || 'Raza no especificada'}</p>
                    <p className="text-xs text-gray-400 mt-1">Peso: {mascota.peso_kg} kg · {mascota.rango_nombre || 'Sin rango'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    ),
    2: (
      <div>
        {isLoadingServicios ? (
          <LoadingBlock />
        ) : servicios.length === 0 ? (
          <EmptyState icon={<ScissorsIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />} title="No hay servicios disponibles" />
        ) : (
          <div className="space-y-3">
            {servicios.map((servicio) => (
              <button
                key={servicio.id}
                onClick={() => setSelectedServicio(servicio)}
                className={`w-full text-left p-4 border rounded-lg transition-all ${
                  selectedServicio?.id === servicio.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">{servicio.nombre}</h3>
                    {servicio.descripcion && <p className="text-sm text-gray-500 mt-1">{servicio.descripcion}</p>}
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 mt-2">
                      <ClockIcon className="h-4 w-4" />
                      {servicio.duracion_minutos} min
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-600 whitespace-nowrap">Bs. {toNumber(servicio.precio).toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    ),
    3: (
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => {
              if (date) {
                setFechaSeleccionada(toDateInputValue(date));
                setSelectedSlot(null);
                setDisponibilidadError(null);
              }
            }}
            locale={es}
            dateFormat="dd/MM/yyyy"
            minDate={getTomorrow()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            popperClassName="z-[70]"
          />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            <CalendarIcon className="h-4 w-4 inline mr-1" />
            Horarios disponibles para el {fechaFormateada}
          </p>
        </div>

        {disponibilidadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-700">{disponibilidadError}</p>
          </div>
        )}

        {selectedSlot ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center gap-3">
              <div>
                <p className="font-medium text-gray-900">{selectedSlot.groomer_nombre}</p>
                <p className="text-sm text-gray-500">{selectedSlot.hora_inicio} - {selectedSlot.hora_fin}</p>
              </div>
              <button onClick={() => setSelectedSlot(null)} className="text-sm text-blue-600 hover:text-blue-700">
                Cambiar
              </button>
            </div>
          </div>
        ) : isLoadingSlots ? (
          <LoadingBlock small />
        ) : slots.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />}
            title="No hay horarios disponibles para esta fecha"
            description="Prueba con otra fecha."
          />
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {horasOrdenadas.map((hora) => {
              const opciones = [...slotsPorHora[hora]].sort((a, b) => a.groomer_nombre.localeCompare(b.groomer_nombre));
              return (
                <div key={hora} className="border rounded-lg p-3">
                  <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    {hora}
                    <span className="text-xs font-normal text-gray-400">
                      {opciones.length === 1 ? '1 groomer disponible' : `${opciones.length} groomers disponibles`}
                    </span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opciones.map((slot) => (
                      <button
                        key={slotKey(slot)}
                        onClick={() => {
                          setDisponibilidadError(null);
                          setSelectedSlot(slot);
                        }}
                        className="p-2 text-sm border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all text-left"
                      >
                        <span className="flex items-center gap-2">
                          <UserIcon className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="min-w-0">
                            <span className="block font-medium text-gray-800 truncate">{slot.groomer_nombre}</span>
                            <span className="block text-xs text-gray-400">{slot.hora_inicio} - {slot.hora_fin}</span>
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),
    4: selectedMascota && selectedServicio && selectedSlot ? (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-5 space-y-3">
          <SummaryRow label="Mascota" value={selectedMascota.nombre} />
          <SummaryRow label="Servicio" value={selectedServicio.nombre} />
          <SummaryRow label="Duracion" value={`${selectedServicio.duracion_minutos} minutos`} />
          <SummaryRow label="Groomer" value={selectedSlot.groomer_nombre} />
          <SummaryRow label="Fecha y hora" value={`${fechaFormateada} - ${selectedSlot.hora_inicio}`} />
          <SummaryRow label="Precio" value={`Bs. ${toNumber(selectedServicio.precio).toFixed(2)}`} strong />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Notas adicionales sobre la cita..."
          />
        </div>
      </div>
    ) : null,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}
      onMouseDown={closeWizard}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white">Agendar Nueva Cita</h2>
              <p className="text-sm text-blue-100">Completa los pasos para programar el servicio</p>
            </div>
            <button onClick={closeWizard} className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center">
            {STEPS.map((step, idx) => {
              const done = step.number < currentStep;
              const active = step.number === currentStep;
              const IconComponent = step.icon;
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      done ? 'bg-green-500 text-white' : active ? 'bg-white text-blue-700' : 'bg-white/15 text-white/50'
                    }`}>
                      {done ? <CheckIcon className="h-4 w-4" /> : <IconComponent className="h-4 w-4" />}
                    </div>
                    <span className={`mt-1 text-[11px] ${active ? 'text-white font-semibold' : 'text-white/60'}`}>{step.title}</span>
                  </div>
                  {idx < STEPS.length - 1 && <div className={`h-0.5 flex-1 mb-5 ${done ? 'bg-green-500' : 'bg-white/20'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 pt-4 shrink-0">
          <div className="flex items-center gap-2">
            {(() => {
              const IconComponent = STEPS[currentStep - 1].icon;
              return <IconComponent className="h-5 w-5 text-blue-600" />;
            })()}
            <div>
              <p className="text-sm font-bold text-gray-900">Paso {currentStep}: {STEPS[currentStep - 1].title}</p>
              <p className="text-xs text-gray-500">{STEPS[currentStep - 1].desc}</p>
            </div>
          </div>
          <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {contentByStep[currentStep]}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center shrink-0">
          <button
            onClick={() => setCurrentStep(step => Math.max(1, step - 1))}
            disabled={currentStep === 1}
            className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(step => Math.min(4, step + 1))}
              disabled={!canGoNext()}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleConfirmar}
              disabled={isCreating}
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium disabled:opacity-50 hover:bg-green-700"
            >
              {isCreating ? 'Confirmando...' : 'Confirmar cita'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingBlock = ({ small = false }: { small?: boolean }) => (
  <div className={`flex justify-center ${small ? 'py-8' : 'py-12'}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="text-center py-10">
    {icon}
    <p className="text-gray-500">{title}</p>
    {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        {actionLabel}
      </button>
    )}
  </div>
);

const SummaryRow = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex justify-between items-center gap-4 pb-3 border-b border-gray-200 last:border-b-0 last:pb-0">
    <span className="text-gray-600">{label}</span>
    <span className={`${strong ? 'text-lg font-bold text-green-600' : 'font-medium text-gray-800'} text-right`}>{value}</span>
  </div>
);
