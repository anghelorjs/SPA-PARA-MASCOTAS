// src/pages/admin/reportes/components/FiltroFechas.tsx
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

interface FiltroFechasProps {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (fecha: string) => void;
  onFechaHastaChange: (fecha: string) => void;
  isLoading?: boolean;
}

export const FiltroFechas = ({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  isLoading,
}: FiltroFechasProps) => {
  return (
    <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:flex-none">
      <label className="min-w-0">
        <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <CalendarDaysIcon className="h-4 w-4 shrink-0" />
          Desde
        </span>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => onFechaDesdeChange(e.target.value)}
          disabled={isLoading}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 sm:min-w-[165px]"
        />
      </label>
      <label className="min-w-0">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Hasta</span>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => onFechaHastaChange(e.target.value)}
          disabled={isLoading}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 sm:min-w-[165px]"
        />
      </label>
    </div>
  );
};
