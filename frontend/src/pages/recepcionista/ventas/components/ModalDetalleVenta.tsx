import { createPortal } from 'react-dom';
import { XMarkIcon, PrinterIcon, UserIcon, CreditCardIcon, CalendarIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { Venta } from '../types';
import { ESTADO_LABELS, ESTADO_COLORS, MEDIO_PAGO_LABELS } from '../types';

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return 'Sin fecha';
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
};

const getTipo = (venta: Venta) => {
  const tipo = venta.tipo_venta ?? venta.detalleVentas?.[0]?.tipo ?? 'producto';
  if (tipo === 'servicio') {
    return { label: 'Servicio grooming', Icon: SparklesIcon, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (tipo === 'mixta') {
    return { label: 'Venta mixta', Icon: ShoppingBagIcon, className: 'bg-violet-50 text-violet-700 border-violet-200' };
  }
  return { label: 'Venta de productos', Icon: ShoppingBagIcon, className: 'bg-blue-50 text-blue-700 border-blue-200' };
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

  const detalles = venta?.detalleVentas || [];
  const tipo = venta ? getTipo(venta) : null;
  const TipoIcon = tipo?.Icon;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-900 text-white">
          <div>
            <h2 className="text-lg font-semibold">Detalle de registro</h2>
            <p className="text-xs text-gray-300">Venta #{venta?.idVenta ?? '-'}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Cerrar detalle">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : venta ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Fecha y hora
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatDateTime(venta.fecha)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <CreditCardIcon className="h-4 w-4" />
                    Medio de pago
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {MEDIO_PAGO_LABELS[venta.medioPago] || venta.medioPago}
                  </p>
                </div>
                {tipo && TipoIcon && (
                  <div className={`rounded-lg border p-3 ${tipo.className}`}>
                    <div className="flex items-center gap-2 text-xs font-medium mb-1">
                      <TipoIcon className="h-4 w-4" />
                      Tipo
                    </div>
                    <p className="text-sm font-semibold">{tipo.label}</p>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Cliente</span>
                </div>
                {venta.cliente ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {venta.cliente.user?.nombre || ''} {venta.cliente.user?.apellido || ''}
                    </p>
                    <p className="text-xs text-gray-500">{venta.cliente.user?.telefono || 'Sin telefono'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Venta anonima</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Estado</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${ESTADO_COLORS[venta.estado] || 'bg-gray-100 text-gray-800'}`}>
                  {ESTADO_LABELS[venta.estado] || venta.estado}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Items cobrados</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Detalle</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Cant.</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">P. unitario</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {detalles.map((detalle) => (
                        <tr key={detalle.idDetalleVenta}>
                          <td className="px-4 py-2 text-sm text-gray-900">{detalle.descripcion || 'Item'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {detalle.tipo === 'servicio' ? 'Servicio' : 'Producto'}
                          </td>
                          <td className="px-4 py-2 text-sm text-center text-gray-600">{detalle.cantidad}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-600">
                            Bs. {toNumber(detalle.precioUnitario).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">
                            Bs. {toNumber(detalle.subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-700">
                          Bs. {toNumber(venta.total).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {venta.factura && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Factura</p>
                  <p className="text-sm font-semibold text-gray-900">{venta.factura.numeroFactura}</p>
                  <p className="text-xs text-gray-500">Emitida: {formatDateTime(venta.factura.fechaEmision)}</p>
                  {venta.factura.pagos?.[0]?.fechaPago && (
                    <p className="text-xs text-gray-500">Pago: {formatDateTime(venta.factura.pagos[0].fechaPago)}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No se pudo cargar el detalle.</div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          {venta && onImprimirFactura && (
            <button
              onClick={() => onImprimirFactura(venta.idVenta)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <PrinterIcon className="h-4 w-4" />
              Ver factura
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
