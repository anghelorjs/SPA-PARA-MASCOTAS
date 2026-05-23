// src/pages/recepcionista/ventas/components/ModalNuevaVenta.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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

  const paymentOptions = [
    { value: 'efectivo' as const, label: MEDIO_PAGO_LABELS.efectivo, Icon: BanknotesIcon },
    { value: 'qr' as const, label: MEDIO_PAGO_LABELS.qr, Icon: DevicePhoneMobileIcon },
    { value: 'transferencia' as const, label: MEDIO_PAGO_LABELS.transferencia, Icon: BuildingLibraryIcon },
  ];

  useEffect(() => {
    const searchClientes = async () => {
      if (buscarCliente.length < 2) {
        setClientesResultados([]);
        setMostrarResultadosCliente(false);
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

    const timeoutId = window.setTimeout(searchClientes, 300);
    return () => window.clearTimeout(timeoutId);
  }, [buscarCliente]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm md:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-green-700 to-emerald-600 px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <ShoppingCartIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Nueva venta</h2>
              <p className="text-xs text-green-100">Selecciona productos, revisa el carrito y confirma el pago</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar nueva venta"
            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <section className="xl:col-span-8">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <BuscadorProductos onAgregarProducto={onAgregarProducto} carrito={carrito} />
              </div>
            </section>

            <aside className="space-y-4 xl:col-span-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  Cliente opcional
                </h3>

                {selectedCliente ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{selectedCliente.nombre}</p>
                        <p className="text-sm text-gray-500">{selectedCliente.telefono}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSetSelectedCliente(null)}
                        aria-label="Quitar cliente seleccionado"
                        className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
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
                      placeholder="Buscar por nombre o telefono"
                      aria-label="Buscar cliente"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                    {mostrarResultadosCliente && clientesResultados.length > 0 && (
                      <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        {clientesResultados.map((cliente) => (
                          <button
                            key={cliente.id}
                            type="button"
                            onClick={() => {
                              onSetSelectedCliente(cliente);
                              setBuscarCliente('');
                              setMostrarResultadosCliente(false);
                            }}
                            className="w-full border-b border-gray-100 px-4 py-2 text-left last:border-0 hover:bg-gray-50"
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

              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm xl:sticky xl:top-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <ShoppingCartIcon className="h-4 w-4 text-gray-400" />
                    Carrito
                  </h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {carrito.length} item{carrito.length === 1 ? '' : 's'}
                  </span>
                </div>
                <CarritoItems
                  items={carrito}
                  onEliminar={onEliminarDelCarrito}
                  onActualizarCantidad={onActualizarCantidad}
                />
              </div>
            </aside>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-gray-500">Medio de pago</p>
              <div className="flex flex-wrap gap-2">
                {paymentOptions.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onSetMedioPago(value)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      medioPago === value
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <div className="text-right">
                <p className="text-xs text-gray-500">Total a pagar</p>
                <p className="text-2xl font-bold text-green-600">Bs. {totalCarrito.toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={onCreateVenta}
                disabled={carrito.length === 0 || isLoading}
                className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Procesando...' : 'Confirmar venta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
