// src/pages/admin/grooming/components/BuscadorMascota.tsx
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BuscadorMascotaProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const BuscadorMascota = ({ search, onSearchChange, placeholder = "Buscar por mascota...", isLoading }: BuscadorMascotaProps) => {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={isLoading}
        className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
      {search && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};