// src/pages/groomer/agenda/components/FiltroEstado.tsx
import { FILTRO_ESTADO_OPTIONS, type FiltroEstado as FiltroEstadoValue } from '../types';

interface FiltroEstadoProps {
  currentFilter: FiltroEstadoValue;
  onFilterChange: (filter: FiltroEstadoValue) => void;
}

export const FiltroEstado = ({ currentFilter, onFilterChange }: FiltroEstadoProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTRO_ESTADO_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            currentFilter === option.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
