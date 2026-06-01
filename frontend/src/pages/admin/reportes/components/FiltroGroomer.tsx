// src/pages/admin/reportes/components/FiltroGroomer.tsx
import { useState, useEffect } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { adminAgendaService } from '../../agenda/services/admin.agenda.service';

interface FiltroGroomerProps {
  groomerId: number | undefined;
  onGroomerChange: (id: number | undefined) => void;
  isLoading?: boolean;
}

export const FiltroGroomer = ({ groomerId, onGroomerChange, isLoading }: FiltroGroomerProps) => {
  const [groomers, setGroomers] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    const loadGroomers = async () => {
      try {
        const data = await adminAgendaService.getDisponibilidad();
        setGroomers(data.groomers.map((g) => ({ id: g.id, nombre: g.nombre })));
      } catch (error) {
        console.error('Error al cargar groomers:', error);
      }
    };
    loadGroomers();
  }, []);

  return (
    <label className="min-w-0 flex-1 xl:flex-none">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <UserIcon className="h-4 w-4 shrink-0" />
        Groomer
      </span>
      <select
        value={groomerId || ''}
        onChange={(e) => onGroomerChange(e.target.value ? parseInt(e.target.value) : undefined)}
        disabled={isLoading}
        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 sm:min-w-[220px]"
      >
        <option value="">Todos los groomers</option>
        {groomers.map((g) => (
          <option key={g.id} value={g.id}>
            {g.nombre}
          </option>
        ))}
      </select>
    </label>
  );
};
