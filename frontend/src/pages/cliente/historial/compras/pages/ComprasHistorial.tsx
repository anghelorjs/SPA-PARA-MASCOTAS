// src/pages/cliente/historial/compras/pages/ComprasHistorial.tsx
import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useComprasHistorial } from '../hooks/useComprasHistorial';
import { FiltroEstadoCompras } from '../components/FiltroEstadoCompras';
import { FiltroFechasCompras } from '../components/FiltroFechasCompras';
import { TablaComprasHistorial } from '../components/TablaComprasHistorial';
import { ModalDetalleCompra } from '../components/ModalDetalleCompra';
import { ModalConfirmarCancelacion } from '../components/ModalConfirmarCancelacion';
import type { CompraHistorial } from '../../../../../services/types/cliente';

export const ComprasHistorial = () => {
  const {
    compras,
    filtroEstado,
    fechaDesde,
    fechaHasta,
    isLoading,
    tieneFiltrosActivos,
    cambiarFiltroEstado,
    cambiarFechaDesde,
    cambiarFechaHasta,
    limpiarFiltros,
    cancelarPedido,
    refresh,
  } = useComprasHistorial();

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<CompraHistorial | null>(null);
  const [pedidoCancelando, setPedidoCancelando] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleVerDetalle = (compra: CompraHistorial) => {
    setSelectedCompra(compra);
    setDetalleOpen(true);
  };

  const handleCancelarClick = (id: number) => {
    setPedidoCancelando(id);
    setCancelModalOpen(true);
  };

  const handleConfirmarCancelacion = async () => {
    if (!pedidoCancelando) return;
    setIsCancelling(true);
    await cancelarPedido(pedidoCancelando);
    setIsCancelling(false);
    setCancelModalOpen(false);
    setPedidoCancelando(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Compras</h1>
        <p className="text-sm text-gray-500 mt-1">
          Historial de compras realizadas
        </p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <FiltroEstadoCompras estadoSeleccionado={filtroEstado} onEstadoChange={cambiarFiltroEstado} />
        <div className="border-t border-gray-100 pt-4">
          <FiltroFechasCompras
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            onFechaDesdeChange={cambiarFechaDesde}
            onFechaHastaChange={cambiarFechaHasta}
            onLimpiar={() => {
              cambiarFechaDesde('');
              cambiarFechaHasta('');
            }}
          />
        </div>
        {tieneFiltrosActivos && (
          <div className="flex justify-end">
            <button
              onClick={limpiarFiltros}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      <TablaComprasHistorial
        compras={compras}
        isLoading={isLoading}
        onVerDetalle={handleVerDetalle}
        onCancelarPedido={handleCancelarClick}
      />

      <ModalDetalleCompra
        isOpen={detalleOpen}
        compra={selectedCompra}
        onClose={() => {
          setDetalleOpen(false);
          setSelectedCompra(null);
        }}
      />

      <ModalConfirmarCancelacion
        isOpen={cancelModalOpen}
        isLoading={isCancelling}
        onClose={() => {
          setCancelModalOpen(false);
          setPedidoCancelando(null);
        }}
        onConfirmar={handleConfirmarCancelacion}
      />
    </div>
  );
};