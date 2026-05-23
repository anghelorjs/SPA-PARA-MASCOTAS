// src/pages/recepcionista/ventas/components/ModalNuevaVenta.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, UserIcon, CreditCardIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { BuscadorProductos } from './BuscadorProductos';
import { CarritoItems } from './CarritoItems';
import { recepcionistaClienteService } from '../../clientes/services/recepcionista.clientes.service';
import type { ClienteVenta, ItemCarrito, MedioPago, ProductoVenta } from '../types';
import { MEDIO_PAGO_LABELS } from '../types';

interface ModalNuevaVentaProps {
  isOpen: boolean;
  onClose: () => void;
  carrito: ItemCarrito[];
  totalCarrito: number;
  selectedCliente: ClienteVenta | null;
  medioPago: MedioPago;
  isLoading: boolean;
  onSetSelectedCliente: (cliente: ClienteVenta | null) => void;
  onSetMedioPago: (medio: MedioPago) => void;
  onAgregarProducto: (producto: ProductoVenta, varianteId: number, cantidad: number) => boolean;
  onEliminarDelCarrito: (idVariante: number) => void;
  onActualizarCantidad: (idVariante: number, nuevaCantidad: number) => void;
  onCreateVenta: () => void;
}

export const ModalNuevaVenta = ({
  isOpen,
  onClose,
  carrito,
  totalCarrito,
  selectedCliente,
  medioPago,
  isLoading,
  onSetSelectedCliente,
  onSetMedioPago,
  onAgregarProducto,
  onEliminarDelCarrito,
  onActualizarCantidad,
  onCreateVenta,
}: ModalNuevaVentaProps) => {
  const [buscarCliente, setBuscarCliente] = useState('');
  const [clientesResultados, setClientesResultados] = useState<ClienteVenta[]>([]);
  const [mostrarResultadosCliente, setMostrarResultadosCliente] = useState(false);

  // Buscar clientes
  useEffect(() => {
    const searchClientes = async () => {
      if (buscarCliente.length < 2) {
        setClientesResultados([]);
        return;
      }

      try {
        const response = await recepcionistaClienteService.buscarClientes(buscarCliente);
        setClientesResultados(response);
        setMostrarResultadosCliente(true);
      } catch (error) {
        console.error('Error al buscar clientes:', error);
      }
    };

    const timeoutId = setTimeout(searchClientes, 300);
    return () => clearTimeout(timeoutId);
  }, [buscarCliente]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r from-green-600 to-green-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCartIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Nueva Venta</h2>
              <p className="text-xs text-green-100">Registro de venta de productos</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar nueva venta" className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda - Cliente y productos */}
            <div className="space-y-6">
              {/* Sección Cliente */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  Cliente (opcional)
                </h3>

                {selectedCliente ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{selectedCliente.nombre}</p>
                        <p className="text-sm text-gray-500">{selectedCliente.telefono}</p>
                      </div>
                      <button
                        onClick={() => onSetSelectedCliente(null)}
                        aria-label="Quitar cliente seleccionado"
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={buscarCliente}
                      onChange={(e) => setBuscarCliente(e.target.value)}
                      placeholder="Buscar cliente por nombre o teléfono..."
                      aria-label="Buscar cliente"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {mostrarResultadosCliente && clientesResultados.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {clientesResultados.map((cliente) => (
                          <button
                            key={cliente.id}
                            onClick={() => {
                              onSetSelectedCliente(cliente);
                              setBuscarCliente('');
                              setMostrarResultadosCliente(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100"
                          >
                            <div className="font-medium text-gray-800">{cliente.nombre}</div>
                            <div className="text-xs text-gray-500">{cliente.telefono}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sección Productos */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Productos</h3>
                <BuscadorProductos onAgregarProducto={onAgregarProducto} />
              </div>
            </div>

            {/* Columna derecha - Carrito */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <ShoppingCartIcon className="h-4 w-4 text-gray-400" />
                Carrito de compras
              </h3>
              <CarritoItems
                items={carrito}
                onEliminar={onEliminarDelCarrito}
                onActualizarCantidad={onActualizarCantidad}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Medio de pago */}
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
              <select
                value={medioPago}
                onChange={(e) => onSetMedioPago(e.target.value as MedioPago)}
                aria-label="Seleccionar medio de pago"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="efectivo">💵 {MEDIO_PAGO_LABELS.efectivo}</option>
                <option value="qr">📱 {MEDIO_PAGO_LABELS.qr}</option>
                <option value="transferencia">🏦 {MEDIO_PAGO_LABELS.transferencia}</option>
              </select>
            </div>

            {/* Total y botón confirmar */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Total a pagar</p>
                <p className="text-2xl font-bold text-green-600">Bs. {totalCarrito.toFixed(2)}</p>
              </div>
              <button
                onClick={onCreateVenta}
                disabled={carrito.length === 0 || isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Procesando...' : 'Confirmar Venta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};