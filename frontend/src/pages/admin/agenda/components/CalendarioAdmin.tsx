// src/pages/admin/agenda/components/CalendarioAdmin.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import type { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import type { CitaCalendario, GroomerOption } from '../types';
import { ESTADO_LABELS } from '../types';
import { formatLocalDate, toDateInputValue } from '../../../recepcionista/agenda/utils/date';

interface CalendarioAdminProps {
  citas: CitaCalendario[];
  groomers: GroomerOption[];
  fechaInicio: string;
  fechaFin: string;
  vista: 'day' | 'week';
  groomerFiltro: number | undefined;
  onFechaChange: (fechaInicio: string, fechaFin: string) => void;
  onVistaChange: (vista: 'day' | 'week') => void;
  onGroomerFiltroChange: (groomerId: number | undefined) => void;
  onCitaClick: (citaId: number) => void;
  onSlotClick: (date: Date, groomerId?: number) => void;
  isLoading: boolean;
}

export const CalendarioAdmin = ({
  citas,
  groomers,
  fechaInicio,
  vista,
  groomerFiltro,
  onFechaChange,
  onVistaChange,
  onGroomerFiltroChange,
  onCitaClick,
  onSlotClick,
  isLoading,
}: CalendarioAdminProps) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentDate, setCurrentDate] = useState(fechaInicio);

  const calendarEvents = useMemo<EventInput[]>(
    () => citas.map((cita) => ({ ...cita, id: String(cita.id) })),
    [citas]
  );

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(currentDate);
    }
  }, [currentDate]);

  const handleDateSelect = (info: DateSelectArg) => {
    onSlotClick(info.start);
  };

  const handleEventClick = (info: EventClickArg) => {
    onCitaClick(parseInt(info.event.id));
  };

  const nav = (dir: 'prev' | 'next' | 'today') => {
    if (!calendarRef.current) return;
    const api = calendarRef.current.getApi();
    api[dir]();
    const newDate = api.getDate();
    const newDateStr = toDateInputValue(newDate);

    if (vista === 'day') {
      setCurrentDate(newDateStr);
      onFechaChange(newDateStr, newDateStr);
    } else {
      // Para vista semanal, calcular domingo a sábado
      const start = new Date(newDate);
      start.setDate(start.getDate() - start.getDay()); // Domingo
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // Sábado
      setCurrentDate(newDateStr);
      onFechaChange(toDateInputValue(start), toDateInputValue(end));
    }
  };

  const handleVistaChange = (nuevaVista: 'day' | 'week') => {
    onVistaChange(nuevaVista);
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.changeView(nuevaVista === 'day' ? 'timeGridDay' : 'timeGridWeek');
      const baseDate = api.getDate();
      const baseDateStr = toDateInputValue(baseDate);

      if (nuevaVista === 'day') {
        onFechaChange(baseDateStr, baseDateStr);
      } else {
        const start = new Date(baseDate);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        onFechaChange(toDateInputValue(start), toDateInputValue(end));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="cal-card" style={{ textAlign: 'center', padding: '48px' }}>
        <style>{styles}</style>
        <div className="cal-spinner" />
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>Cargando agenda…</p>
      </div>
    );
  }

  const fechaFormateada = formatLocalDate(currentDate, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="cal-card">
      <style>{styles}</style>

      {/* Toolbar */}
      <div className="cal-toolbar">
        <div className="cal-nav-group">
          <button className="cal-btn-ghost" onClick={() => nav('prev')} title="Anterior">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="cal-btn-today" onClick={() => nav('today')}>Hoy</button>
          <button className="cal-btn-ghost" onClick={() => nav('next')} title="Siguiente">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <span className="cal-date-label">{fechaFormateada}</span>

        <div className="cal-controls">
          {/* Selector de vista */}
          <div className="cal-view-group">
            <button
              className={`cal-view-btn ${vista === 'day' ? 'cal-view-active' : ''}`}
              onClick={() => handleVistaChange('day')}
            >
              Día
            </button>
            <button
              className={`cal-view-btn ${vista === 'week' ? 'cal-view-active' : ''}`}
              onClick={() => handleVistaChange('week')}
            >
              Semana
            </button>
          </div>

          <select
            value={groomerFiltro || ''}
            onChange={(e) => onGroomerFiltroChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="cal-input cal-select"
          >
            <option value="">Todos los groomers</option>
            {groomers.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      <div className="cal-body">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={false}
          initialView={vista === 'day' ? 'timeGridDay' : 'timeGridWeek'}
          initialDate={currentDate}
          locale={esLocale}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          allDaySlot={false}
          nowIndicator={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={calendarEvents}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventContent={(info) => {
            const estado: string = info.event.extendedProps.estado;
            const groomer: string = info.event.extendedProps.groomer;
            return (
              <div className={`cal-event cal-event--${estado}`}>
                <div className="cal-event-title">{info.event.title}</div>
                <div className="cal-event-meta">{groomer}</div>
                <div className="cal-event-badge">{ESTADO_LABELS[estado as keyof typeof ESTADO_LABELS] || estado}</div>
              </div>
            );
          }}
          slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
        />
      </div>
    </div>
  );
};

const styles = `
  .cal-card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .cal-spinner {
    width: 32px; height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: cal-spin 0.75s linear infinite;
    margin: 0 auto;
  }
  @keyframes cal-spin { to { transform: rotate(360deg); } }

  .cal-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px 20px;
    border-bottom: 1px solid #e8edf5;
    background: #f8fafd;
  }

  .cal-nav-group { display: flex; align-items: center; gap: 4px; }

  .cal-btn-ghost {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border: 1px solid #d1dae8;
    border-radius: 8px;
    background: white;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;
  }
  .cal-btn-ghost:hover { background: #eff4ff; border-color: #3b82f6; color: #3b82f6; }

  .cal-btn-today {
    height: 32px; padding: 0 14px;
    border: 1px solid #d1dae8;
    border-radius: 8px;
    background: white;
    color: #334155;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .cal-btn-today:hover { background: #eff4ff; border-color: #3b82f6; color: #3b82f6; }

  .cal-date-label {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    flex: 1;
    text-align: center;
    letter-spacing: -0.01em;
  }

  .cal-controls { display: flex; gap: 12px; align-items: center; }

  .cal-view-group {
    display: flex;
    background: #f1f5f9;
    border-radius: 8px;
    padding: 2px;
  }

  .cal-view-btn {
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
  }

  .cal-view-active {
    background: white;
    color: #3b82f6;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .cal-input {
    height: 32px;
    padding: 0 10px;
    border: 1px solid #d1dae8;
    border-radius: 8px;
    background: white;
    color: #334155;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cal-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  .cal-select { min-width: 160px; }

  .cal-body { padding: 0 4px 4px; }
  .cal-body .fc { font-family: inherit; }
  .cal-body .fc-timegrid-slot { height: 40px !important; }
  .cal-body .fc-timegrid-slot-minor { border-top: 1px dashed #f1f5f9 !important; }
  .cal-body .fc-timegrid-slot-label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.03em;
    padding-right: 10px;
  }
  .cal-body .fc-col-header-cell {
    padding: 10px 0;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: #f8fafd;
    border: none;
  }
  .cal-body .fc-scrollgrid { border: none !important; }
  .cal-body .fc-scrollgrid td,
  .cal-body .fc-scrollgrid th { border-color: #e8edf5 !important; }
  .cal-body .fc-timegrid-now-indicator-line {
    border-color: #3b82f6 !important;
    border-width: 2px !important;
  }
  .cal-body .fc-timegrid-now-indicator-arrow {
    border-top-color: #3b82f6 !important;
    border-bottom-color: #3b82f6 !important;
  }
  .cal-body .fc-highlight { background: rgba(59,130,246,0.07) !important; }
  .cal-body .fc-event {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 1px 2px;
    cursor: pointer;
  }

  .cal-event {
    height: 100%;
    padding: 4px 8px;
    border-radius: 6px;
    border-left: 3px solid #3b82f6;
    background: #eff6ff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    transition: filter 0.12s;
  }
  .cal-event:hover { filter: brightness(0.95); }
  .cal-event-title {
    font-size: 11px;
    font-weight: 600;
    color: #1e40af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }
  .cal-event-badge {
    font-size: 10px;
    color: #3b82f6;
    opacity: 0.85;
    line-height: 1;
  }
  .cal-event-meta {
    font-size: 10px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.1;
  }

  .cal-event--programada { background: #eff6ff; border-left-color: #3b82f6; }
  .cal-event--programada .cal-event-title { color: #1e40af; }
  .cal-event--programada .cal-event-badge { color: #3b82f6; }

  .cal-event--confirmada { background: #f0fdf4; border-left-color: #22c55e; }
  .cal-event--confirmada .cal-event-title { color: #15803d; }
  .cal-event--confirmada .cal-event-badge { color: #22c55e; }

  .cal-event--pendiente_confirmacion { background: #fffbeb; border-left-color: #f59e0b; }
  .cal-event--pendiente_confirmacion .cal-event-title { color: #92400e; }
  .cal-event--pendiente_confirmacion .cal-event-badge { color: #f59e0b; }

  .cal-event--en_curso { background: #fffbeb; border-left-color: #f59e0b; }
  .cal-event--en_curso .cal-event-title { color: #92400e; }
  .cal-event--en_curso .cal-event-badge { color: #f59e0b; }

  .cal-event--completada { background: #f8fafc; border-left-color: #94a3b8; opacity: 0.85; }
  .cal-event--completada .cal-event-title { color: #475569; }
  .cal-event--completada .cal-event-badge { color: #94a3b8; }

  .cal-event--cancelada { background: #fff1f2; border-left-color: #f43f5e; opacity: 0.7; }
  .cal-event--cancelada .cal-event-title { color: #9f1239; }
  .cal-event--cancelada .cal-event-badge { color: #f43f5e; }
`;
