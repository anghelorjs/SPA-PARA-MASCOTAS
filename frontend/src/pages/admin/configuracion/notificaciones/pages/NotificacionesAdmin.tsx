// src/pages/admin/configuracion/notificaciones/pages/NotificacionesAdmin.tsx
import { useState } from 'react';
import { ArrowPathIcon, BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNotificacionesAdmin } from '../hooks/useNotificacionesAdmin';
import { TablaNotificacionesAdmin } from '../components/TablaNotificacionesAdmin';
import { FiltroNotificacionesAdmin } from '../components/FiltroNotificacionesAdmin';
import { ModalDetalleNotificacion } from '../components/ModalDetalleNotificacion';
import { ModalEnviarNotificacion } from '../components/ModalEnviarNotificacion';
import Pagination from '../../../../../components/common/Pagination';

export const NotificacionesAdmin = () => {
  const {
    notificaciones,
    tipos,
    canales,
    filtroTipo,
    filtroCanal,
    filtroEntregada,
    filtroFechaDesde,
    filtroFechaHasta,
    filtroClienteSearch,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    cambiarFiltroTipo,
    cambiarFiltroCanal,
    cambiarFiltroEntregada,
    cambiarFiltroFechaDesde,
    cambiarFiltroFechaHasta,
    cambiarFiltroClienteSearch,
    limpiarFiltros,
    reenviarNotificacion,
    cambiarPagina,
    refresh,
  } = useNotificacionesAdmin();

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [selectedNotificacionId, setSelectedNotificacionId] = useState<number | null>(null);
  const [enviarModalOpen, setEnviarModalOpen] = useState(false);

  const handleVerDetalle = (id: number) => {
    setSelectedNotificacionId(id);
    setDetalleOpen(true);
  };

  const handleReenviar = async (id: number) => {
    await reenviarNotificacion(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones del Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historial y gestión de notificaciones enviadas a clientes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={() => setEnviarModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Enviar Notificación
          </button>
        </div>
      </div>

      {/* Filtros */}
      <FiltroNotificacionesAdmin
        tipos={tipos}
        canales={canales}
        filtroTipo={filtroTipo}
        filtroCanal={filtroCanal}
        filtroEntregada={filtroEntregada}
        filtroFechaDesde={filtroFechaDesde}
        filtroFechaHasta={filtroFechaHasta}
        filtroClienteSearch={filtroClienteSearch}
        isLoading={isLoading}
        tieneFiltrosActivos={tieneFiltrosActivos}
        onTipoChange={cambiarFiltroTipo}
        onCanalChange={cambiarFiltroCanal}
        onEntregadaChange={cambiarFiltroEntregada}
        onFechaDesdeChange={cambiarFiltroFechaDesde}
        onFechaHastaChange={cambiarFiltroFechaHasta}
        onClienteSearchChange={cambiarFiltroClienteSearch}
        onLimpiar={limpiarFiltros}
      />

      {/* Tabla */}
      <TablaNotificacionesAdmin
        notificaciones={notificaciones}
        isLoading={isLoading}
        onVerDetalle={handleVerDetalle}
        onReenviar={handleReenviar}
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

      {/* Modales */}
      <ModalDetalleNotificacion
        isOpen={detalleOpen}
        notificacionId={selectedNotificacionId}
        onClose={() => {
          setDetalleOpen(false);
          setSelectedNotificacionId(null);
        }}
      />

      <ModalEnviarNotificacion
        isOpen={enviarModalOpen}
        onClose={() => setEnviarModalOpen(false)}
        onEnviar={() => refresh()}
      />
    </div>
  );
};