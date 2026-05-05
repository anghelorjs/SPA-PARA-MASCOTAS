// src/pages/admin/configuracion/usuarios/components/FiltrosUsuarios.tsx
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Role } from '../services/admin.usuarios.service';

interface FiltrosUsuariosProps {
  roles: Role[];
  filtros: {
    rol: string;
    activo: string;
    search: string;
  };
  onFiltroChange: (filtros: Partial<{ rol: string; activo: string; search: string }>) => void;
}

export const FiltrosUsuarios = ({ roles, filtros, onFiltroChange }: FiltrosUsuariosProps) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltroChange({ search: e.target.value });
  };

  const handleRolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltroChange({ rol: e.target.value });
  };

  const handleActivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltroChange({ activo: e.target.value });
  };

  const clearFilters = () => {
    onFiltroChange({ rol: '', activo: '', search: '' });
  };

  const hasActiveFilters = filtros.rol !== '' || filtros.activo !== '' || filtros.search !== '';

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Buscador */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={filtros.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por rol */}
        <select
          value={filtros.rol}
          onChange={handleRolChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los roles</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.nombre}</option>
          ))}
        </select>

        {/* Filtro por estado */}
        <select
          value={filtros.activo}
          onChange={handleActivoChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};