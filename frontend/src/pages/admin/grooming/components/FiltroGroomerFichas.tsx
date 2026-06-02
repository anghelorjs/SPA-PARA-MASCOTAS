// src/pages/admin/grooming/components/FiltroGroomerFichas.tsx
import { useState, useEffect } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface FiltroGroomerFichasProps {
  groomerId: number | undefined;
  onGroomerChange: (id: number | undefined) => void;
  isLoading?: boolean;
}

interface Groomer {
  id: number;
  nombre: string;
}

export const FiltroGroomerFichas = ({ groomerId, onGroomerChange, isLoading }: FiltroGroomerFichasProps) => {
  const [groomers, setGroomers] = useState<Groomer[]>([]);

  useEffect(() => {
    const loadGroomers = async () => {
      try {
        // Obtener groomers desde el servicio de agenda
        const response = await fetch('/api/admin/agenda/disponibilidad');
        const data = (await response.json()) as {
          success: boolean;
          data: { groomers: Groomer[] };
        };
        if (data.success) {
          setGroomers(data.data.groomers.map((g) => ({ id: g.id, nombre: g.nombre })));
        }
      } catch (error) {
        console.error('Error al cargar groomers:', error);
      }
    };
    loadGroomers();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <UserIcon className="h-5 w-5 text-gray-400" />
      <select
        aria-label="Seleccionar groomer"
        value={groomerId || ''}
        onChange={(e) => onGroomerChange(e.target.value ? parseInt(e.target.value) : undefined)}
        disabled={isLoading}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-w-[200px]"
      >
        <option value="">Todos los groomers</option>
        {groomers.map((g) => (
          <option key={g.id} value={g.id}>
            {g.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};