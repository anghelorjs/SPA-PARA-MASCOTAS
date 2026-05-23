// src/pages/recepcionista/ventas/pages/VentasRecepcionista.tsx
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useVentasRecepcion, useNuevaVenta, useDetalleVenta } from '../hooks/useVentasRecepcion';
import { VentasTable } from '../components/VentasTable';
import { FiltroVentas } from '../components/FiltroVentas';
import { ModalNuevaVenta } from '../components/ModalNuevaVenta';
import { ModalDetalleVenta } from '../components/ModalDetalleVenta';
import Pagination from '../../../../components/common/Pagination';
import { toDateInputValue, formatLocalDate, parseLocalDate } from '../../../recepcionista/agenda/utils/date';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import type { Venta } from '../types';

export const VentasRecepcionista = () => {
  const {
    ventas,
    fecha,
    filtroEstado,
    totalDia,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFecha,
    cambiarFiltroEstado,
    cambiarPagina,
    refresh,
  } = useVentasRecepcion();

  const nuevaVenta = useNuevaVenta();
  const detalleVenta = useDetalleVenta();

  const handleFechaAnterior = () => {
    const nuevaFecha = parseLocalDate(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    cambiarFecha(toDateInputValue(nuevaFecha));
  };

  const handleFechaSiguiente = () => {
    const nuevaFecha = parseLocalDate(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    cambiarFecha(toDateInputValue(nuevaFecha));
  };

  const handleFechaHoy = () => {
    cambiarFecha(toDateInputValue(new Date()));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      cambiarFecha(toDateInputValue(date));
    }
  };

  const handleLimpiarFiltros = () => {
    cambiarFiltroEstado('todas');
  };

  const handleCrearVenta = async () => {
    const ventaCreada = await nuevaVenta.crearVenta();
    if (ventaCreada) {
      refresh();
    }
  };

  const handleVerDetalle = (venta: Venta) => {
    detalleVenta.loadDetalle(venta.idVenta);
  };

  const fechaFormateada = formatLocalDate(fecha, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const selectedDate = parseLocalDate(fecha);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro de ventas de productos del día
          </p>
        </div>
        <button
          onClick={() => nuevaVenta.setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Nueva Venta
        </button>
      </div>

      {/* Filtros */}
      <FiltroVentas
        fecha={fecha}
        filtroEstado={filtroEstado}
        totalDia={totalDia}
        onFechaChange={cambiarFecha}
        onFiltroEstadoChange={cambiarFiltroEstado}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      {/* Selector de fecha rápido (opcional, ya que FiltroVentas ya tiene selector) */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Navegación rápida:</span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={handleFechaAnterior}
              className="p-1.5 hover:bg-white rounded-md transition-colors"
              title="Día anterior"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleFechaHoy}
              className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white rounded-md transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={handleFechaSiguiente}
              className="p-1.5 hover:bg-white rounded-md transition-colors"
              title="Día siguiente"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            locale={es}
            dateFormat="dd/MM/yyyy"
            className="px-2 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer w-32"
            popperClassName="z-50"
            popperPlacement="bottom-end"
          />
          <span className="text-sm text-gray-400 hidden sm:inline">|</span>
          <span className="text-sm font-medium text-gray-700 hidden md:inline">{fechaFormateada}</span>
        </div>
      </div>

      {/* Tabla de ventas */}
      <VentasTable
        ventas={ventas}
        isLoading={isLoading}
        onVerDetalle={handleVerDetalle}
        onImprimirFactura={(ventaId) => {
          console.log('Imprimir factura:', ventaId);
        }}
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

      {/* Modal Nueva Venta */}
      <ModalNuevaVenta
        isOpen={nuevaVenta.isOpen}
        onClose={() => nuevaVenta.setIsOpen(false)}
        carrito={nuevaVenta.carrito}
        totalCarrito={nuevaVenta.totalCarrito}
        selectedCliente={nuevaVenta.selectedCliente}
        medioPago={nuevaVenta.medioPago}
        isLoading={nuevaVenta.isLoading}
        onSetSelectedCliente={nuevaVenta.setSelectedCliente}
        onSetMedioPago={nuevaVenta.setMedioPago}
        onAgregarProducto={nuevaVenta.agregarAlCarrito}
        onEliminarDelCarrito={nuevaVenta.eliminarDelCarrito}
        onActualizarCantidad={nuevaVenta.actualizarCantidad}
        onCreateVenta={handleCrearVenta}
      />

      {/* Modal Detalle Venta */}
      <ModalDetalleVenta
        isOpen={detalleVenta.isOpen}
        venta={detalleVenta.venta}
        isLoading={detalleVenta.isLoading}
        onClose={detalleVenta.cerrar}
        onImprimirFactura={(ventaId) => {
          console.log('Imprimir factura:', ventaId);
        }}
      />
    </div>
  );
};