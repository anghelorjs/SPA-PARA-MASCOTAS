// src/pages/recepcionista/agenda/components/CalendarioRecepcion.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import type { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import type { CitaCalendario, GroomerOption } from '../services/recepcionista.agenda.service';
import { formatLocalDate, toDateInputValue } from '../utils/date';

interface CalendarioRecepcionProps {
  citas: CitaCalendario[];
  groomers: GroomerOption[];
  fecha: string;
  groomerFiltro: number | undefined;
  onFechaChange: (fecha: string) => void;
  onGroomerFiltroChange: (groomerId: number | undefined) => void;
  onCitaClick: (citaId: number) => void;
  onSlotClick: (date: Date, groomerId?: number) => void;
  isLoading: boolean;
}

export const CalendarioRecepcion = ({
  citas,
  groomers,
  fecha,
  groomerFiltro,
  onFechaChange,
  onGroomerFiltroChange,
  onCitaClick,
  onSlotClick,
  isLoading,
}: CalendarioRecepcionProps) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentDate, setCurrentDate] = useState(fecha);
  const calendarEvents = useMemo<EventInput[]>(
    () => citas.map((cita) => ({ ...cita, id: String(cita.id) })),
    [citas],
  );

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(currentDate);
    }
  }, [currentDate]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const startDate = selectInfo.start;
    onSlotClick(startDate);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const citaId = clickInfo.event.id;
    onCitaClick(parseInt(citaId));
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      const newDate = calendarApi.getDate();
      const nextDate = toDateInputValue(newDate);
      setCurrentDate(nextDate);
      onFechaChange(nextDate);
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      const newDate = calendarApi.getDate();
      const nextDate = toDateInputValue(newDate);
      setCurrentDate(nextDate);
      onFechaChange(nextDate);
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      const newDate = calendarApi.getDate();
      const nextDate = toDateInputValue(newDate);
      setCurrentDate(nextDate);
      onFechaChange(nextDate);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center mt-2 text-gray-500">Cargando calendario...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b">
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Anterior
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Siguiente →
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {formatLocalDate(currentDate, { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          
          {/* Filtro por groomer */}
          <select
            value={groomerFiltro || ''}
            onChange={(e) => onGroomerFiltroChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los groomers</option>
            {groomers.map(groomer => (
              <option key={groomer.id} value={groomer.id}>{groomer.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendario */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={false}
        initialView="timeGridDay"
        initialDate={currentDate}
        locale={esLocale}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        nowIndicator={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={calendarEvents}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventContent={(eventInfo) => {
          const estado = eventInfo.event.extendedProps.estado;
          const estadoLabel: Record<string, string> = {
            programada: 'Programada',
            confirmada: 'Confirmada',
            en_curso: 'En curso',
            completada: 'Completada',
            cancelada: 'Cancelada',
          };
          return (
            <div className="p-1 text-xs">
              <div className="font-medium truncate">{eventInfo.event.title}</div>
              <div className="text-[10px] opacity-80">{estadoLabel[estado] || estado}</div>
            </div>
          );
        }}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        }}
        titleFormat={{
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }}
      />
    </div>
  );
};
