// src/pages/admin/configuracion/logs/pages/LogsPage.tsx
import { ChartBarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { LogsFilters } from '../components/LogsFilters';
import { LogsTable } from '../components/LogsTable';
import { useLogs } from '../hooks/useLogs';

export const LogsPage = () => {
  const {
    logs,
    isLoading,
    total,
    currentPage,
    lastPage,
    usuarios,
    acciones,
    stats,
    filtros,
    hasActiveFilters,
    changePage,
    changeFiltros,
    clearFilters,
  } = useLogs();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Trazabilidad</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Registro de actividades del sistema: quién, cuándo, desde dónde y qué acción realizó.
        </p>
      </div>

      {/* KPI cards — fila compacta */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-tight">Total en el rango</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{stats.total_logs}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-tight">Registros hoy</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{stats.logs_hoy}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserGroupIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-tight">Usuarios activos</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{stats.top_usuarios.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <LogsFilters
        usuarios={usuarios}
        acciones={acciones}
        filtros={filtros}
        onFiltroChange={changeFiltros}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Tabla */}
      <LogsTable
        logs={logs}
        isLoading={isLoading}
        total={total}
        currentPage={currentPage}
        lastPage={lastPage}
        onPageChange={changePage}
      />
    </div>
  );
};