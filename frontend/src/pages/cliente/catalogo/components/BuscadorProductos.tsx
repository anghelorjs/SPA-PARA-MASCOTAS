// src/pages/cliente/catalogo/components/BuscadorProductos.tsx
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BuscadorProductosProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const BuscadorProductos = ({ searchTerm, onSearchChange }: BuscadorProductosProps) => {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};