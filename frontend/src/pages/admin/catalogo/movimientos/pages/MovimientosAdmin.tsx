// src/pages/admin/catalogo/movimientos/pages/MovimientosAdmin.tsx
import { useState } from 'react';
import { 
  PlusIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useMovimientosAdmin } from '../hooks/useMovimientosAdmin';
import { MovimientosTable } from '../components/MovimientosTable';
import { MovimientoFormModal } from '../components/MovimientoFormModal';
import Pagination from '../../../../../components/common/Pagination';
import { FiltrosMovimientos } from '../components/FiltrosMovimientos';

export const MovimientosAdmin = () => {
  const {
    movimientos,
    tiposMovimiento,
    filtroProducto,
    filtroTipo,
    filtroFechaDesde,
    filtroFechaHasta,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    cambiarFiltroProducto,
    cambiarFiltroTipo,
    cambiarFiltroFechaDesde,
    cambiarFiltroFechaHasta,
    cambiarPagina,
    limpiarFiltros,
    crearMovimiento,
    refresh,
  } = useMovimientosAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (data: any): Promise<boolean> => {
    setIsSubmitting(true);
    const success = await crearMovimiento(data);
    setIsSubmitting(false);
    return success;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historial de entradas, salidas y ajustes de stock
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Registrar Movimiento
          </button>
        </div>
      </div>

      <FiltrosMovimientos
        filtroProducto={filtroProducto}
        filtroTipo={filtroTipo}
        filtroFechaDesde={filtroFechaDesde}
        filtroFechaHasta={filtroFechaHasta}
        tiposMovimiento={tiposMovimiento}
        tieneFiltrosActivos={tieneFiltrosActivos}
        onProductoChange={cambiarFiltroProducto}
        onTipoChange={cambiarFiltroTipo}
        onFechaDesdeChange={cambiarFiltroFechaDesde}
        onFechaHastaChange={cambiarFiltroFechaHasta}
        onLimpiar={limpiarFiltros}
      />

      {/* Tabla de movimientos */}
      <MovimientosTable movimientos={movimientos} isLoading={isLoading} />

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

      {/* Modal de registro de movimiento */}
      <MovimientoFormModal
        isOpen={modalOpen}
        isLoading={isSubmitting}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};