// src/pages/admin/grooming/components/PestañaTodasFichas.tsx
import { useState } from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useTodasFichasAdmin } from '../hooks/useTodasFichasAdmin';
import { FiltroGroomerFichas } from './FiltroGroomerFichas';
import { FiltroEstadoFichas } from './FiltroEstadoFichas';
import { FiltroFechasFichas } from './FiltroFechasFichas';
import { TablaTodasFichas } from './TablaTodasFichas';
import { ModalDetalleFichaAdmin } from './ModalDetalleFichaAdmin';
import Pagination from '../../../../components/common/Pagination';

export const PestañaTodasFichas = () => {
  const {
    fichas,
    search,
    fechaDesde,
    fechaHasta,
    groomerId,
    filtroEstado,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    setSearch,
    setFechaDesde,
    setFechaHasta,
    setGroomerId,
    setFiltroEstado,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    refresh,
  } = useTodasFichasAdmin();

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [selectedFichaId, setSelectedFichaId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleVerDetalle = (id: number) => {
    setSelectedFichaId(id);
    setDetalleOpen(true);
  };

  const handleAplicarFiltros = () => {
    aplicarFiltros();
    setShowFilters(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de mascota o groomer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="h-4 w-4" />
          Filtros
          {tieneFiltrosActivos && (
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FiltroGroomerFichas
              groomerId={groomerId}
              onGroomerChange={setGroomerId}
              isLoading={isLoading}
            />
            <FiltroEstadoFichas
              estadoSeleccionado={filtroEstado}
              onEstadoChange={setFiltroEstado}
              isLoading={isLoading}
            />
          </div>
          <FiltroFechasFichas
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            onFechaDesdeChange={setFechaDesde}
            onFechaHastaChange={setFechaHasta}
            isLoading={isLoading}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={limpiarFiltros}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
            <button
              onClick={handleAplicarFiltros}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <TablaTodasFichas
        fichas={fichas}
        isLoading={isLoading}
        onVerDetalle={handleVerDetalle}
      />

      {/* Paginación */}
      {!isLoading && total > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          onPageChange={cambiarPagina}
          showTotal={true}
        />
      )}

      {/* Modal detalle */}
      <ModalDetalleFichaAdmin
        isOpen={detalleOpen}
        fichaId={selectedFichaId}
        onClose={() => {
          setDetalleOpen(false);
          setSelectedFichaId(null);
        }}
      />
    </div>
  );
};