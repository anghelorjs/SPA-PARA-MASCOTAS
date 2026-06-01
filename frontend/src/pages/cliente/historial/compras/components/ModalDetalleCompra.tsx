// src/pages/cliente/historial/compras/components/ModalDetalleCompra.tsx
import { createPortal } from 'react-dom';
import { XMarkIcon, CurrencyDollarIcon, ShoppingBagIcon, CreditCardIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import type { CompraHistorial } from '../../../../../services/types/cliente';

// ✅ Función helper para convertir a número
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

interface ModalDetalleCompraProps {
  isOpen: boolean;
  compra: CompraHistorial | null;
  onClose: () => void;
}

const getTipoInfo = (tipo: string) => {
  switch (tipo) {
    case 'venta_local':
      return { icon: <ShoppingBagIcon className="h-5 w-5" />, label: 'Venta en local', color: 'text-blue-600' };
    case 'pedido_whatsapp':
      return { icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />, label: 'Pedido WhatsApp', color: 'text-green-600' };
    case 'pedido_telegram':
      return { icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />, label: 'Pedido Telegram', color: 'text-purple-600' };
    default:
      return { icon: <ShoppingBagIcon className="h-5 w-5" />, label: 'Compra', color: 'text-gray-600' };
  }
};

export const ModalDetalleCompra = ({ isOpen, compra, onClose }: ModalDetalleCompraProps) => {
  if (!isOpen || !compra) return null;

  const tipoInfo = getTipoInfo(compra.tipo);
  // ✅ Convertir total a número
  const totalNum = toNumber(compra.total);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
          <div>
            <h2 className="text-lg font-semibold text-white">Detalle de Compra</h2>
            <p className="text-xs text-green-100">{compra.fecha}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Tipo y estado */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={tipoInfo.color}>{tipoInfo.icon}</span>
                <span className="text-sm font-medium text-gray-800">{tipoInfo.label}</span>
              </div>
              <span
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{ backgroundColor: `${compra.estado_color}20`, color: compra.estado_color }}
              >
                {compra.estado_texto || compra.estado}
              </span>
            </div>

            {/* Medio de pago (si es venta local) */}
            {compra.medio_pago && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCardIcon className="h-4 w-4 text-gray-400" />
                Medio de pago: <span className="font-medium">{compra.medio_pago}</span>
              </div>
            )}

            {/* Canal (si es pedido) */}
            {compra.canal && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                Canal: <span className="font-medium">{compra.canal === 'whatsapp' ? 'WhatsApp' : 'Telegram'}</span>
              </div>
            )}

            {/* Tabla de productos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Productos</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Cant.</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {compra.items.map((item, idx) => {
                      const precioNum = toNumber(item.precio);
                      const subtotalNum = toNumber(item.subtotal);
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-sm text-gray-800">
                            {item.producto}
                            <div className="text-xs text-gray-400">{item.variante}</div>
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-gray-600">{item.cantidad}</td>
                          <td className="px-3 py-2 text-sm text-right text-gray-600">
                            Bs. {precioNum.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-sm text-right font-medium text-gray-800">
                            Bs. {subtotalNum.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium text-gray-700">
                        Total
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-bold text-green-600">
                        Bs. {totalNum.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};