// src/pages/recepcionista/ventas/components/ModalDetalleVenta.tsx
import { createPortal } from 'react-dom';
import { XMarkIcon, PrinterIcon, UserIcon, CreditCardIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Venta } from '../types';
import { ESTADO_LABELS, ESTADO_COLORS, MEDIO_PAGO_LABELS, MEDIO_PAGO_ICONS } from '../types';

// ✅ Función helper para convertir a número (maneja strings y números)
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

interface ModalDetalleVentaProps {
  isOpen: boolean;
  venta: Venta | null;
  isLoading: boolean;
  onClose: () => void;
  onImprimirFactura?: (ventaId: number) => void;
}

export const ModalDetalleVenta = ({
  isOpen,
  venta,
  isLoading,
  onClose,
  onImprimirFactura,
}: ModalDetalleVentaProps) => {
  if (!isOpen) return null;

  // ✅ Asegurar que detalleVentas sea siempre un array
  const detalles = venta?.detalleVentas || [];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-700 to-gray-800 text-white">
          <div>
            <h2 className="text-lg font-semibold">Detalle de Venta</h2>
            <p className="text-xs text-gray-300">ID: #{venta?.idVenta}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : venta ? (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Fecha</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(venta.fecha).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCardIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Medio de pago</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {MEDIO_PAGO_ICONS[venta.medioPago] || '💵'} {MEDIO_PAGO_LABELS[venta.medioPago] || venta.medioPago}
                  </p>
                </div>
              </div>

              {/* Cliente */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Cliente</span>
                </div>
                {venta.cliente ? (
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {venta.cliente.user?.nombre || ''} {venta.cliente.user?.apellido || ''}
                    </p>
                    <p className="text-xs text-gray-500">{venta.cliente.user?.telefono || 'Sin teléfono'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Venta anónima (sin cliente registrado)</p>
                )}
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Estado</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${ESTADO_COLORS[venta.estado] || 'bg-gray-100 text-gray-800'}`}>
                  {ESTADO_LABELS[venta.estado] || venta.estado}
                </span>
              </div>

              {/* Productos */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Productos</h4>
                {detalles.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                    <p>No hay productos registrados en esta venta</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Cant.</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {detalles.map((detalle) => (
                          <tr key={detalle.idDetalleVenta} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-800">{detalle.descripcion || 'Producto'}</td>
                            <td className="px-4 py-2 text-sm text-center text-gray-600">{detalle.cantidad || 0}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-600">
                              Bs. {toNumber(detalle.precioUnitario).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-gray-800">
                              Bs. {toNumber(detalle.subtotal).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            Total
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-bold text-green-600">
                            Bs. {toNumber(venta.total).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Factura */}
              {venta.factura && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Factura</p>
                  <p className="text-sm font-medium text-gray-800">{venta.factura.numeroFactura}</p>
                  <p className="text-xs text-gray-500">
                    Emitida: {new Date(venta.factura.fechaEmision).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se pudo cargar el detalle de la venta
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          {venta && onImprimirFactura && (
            <button
              onClick={() => onImprimirFactura(venta.idVenta)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <PrinterIcon className="h-4 w-4" />
              Imprimir Factura
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};