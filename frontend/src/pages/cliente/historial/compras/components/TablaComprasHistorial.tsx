// src/pages/cliente/historial/compras/components/TablaComprasHistorial.tsx
import { 
  CalendarIcon, 
  ShoppingBagIcon, 
  ChatBubbleLeftRightIcon, 
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
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

interface TablaComprasHistorialProps {
  compras: CompraHistorial[];
  isLoading: boolean;
  onVerDetalle: (compra: CompraHistorial) => void;
  onCancelarPedido?: (id: number) => void;
}

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'venta_local':
      return { icon: <ShoppingBagIcon className="h-4 w-4" />, label: 'Venta en local', color: 'text-blue-600' };
    case 'pedido_whatsapp':
      return { icon: <ChatBubbleLeftRightIcon className="h-4 w-4" />, label: 'Pedido WhatsApp', color: 'text-green-600' };
    case 'pedido_telegram':
      return { icon: <DevicePhoneMobileIcon className="h-4 w-4" />, label: 'Pedido Telegram', color: 'text-purple-600' };
    default:
      return { icon: <ShoppingBagIcon className="h-4 w-4" />, label: 'Compra', color: 'text-gray-600' };
  }
};

export const TablaComprasHistorial = ({ compras, isLoading, onVerDetalle, onCancelarPedido }: TablaComprasHistorialProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando compras...</p>
        </div>
      </div>
    );
  }

  if (compras.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay compras registradas
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {compras.map((compra) => {
              const tipoInfo = getTipoIcon(compra.tipo);
              const puedeCancelar = compra.estado === 'pendiente' && (compra.tipo === 'pedido_whatsapp' || compra.tipo === 'pedido_telegram');
              // ✅ Convertir total a número
              const totalNum = toNumber(compra.total);
              
              return (
                <tr key={`${compra.tipo}-${compra.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      {compra.fecha}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={tipoInfo.color}>{tipoInfo.icon}</span>
                      <span className="text-sm text-gray-700">{tipoInfo.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">{compra.items.length} items</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CurrencyDollarIcon className="h-3.5 w-3.5 text-green-500" />
                      {/* ✅ Usar totalNum en lugar de compra.total */}
                      <span className="text-sm font-semibold text-green-600">
                        Bs. {totalNum.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                      style={{ backgroundColor: `${compra.estado_color}20`, color: compra.estado_color }}
                    >
                      {compra.estado_texto || compra.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onVerDetalle(compra)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ver detalle"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {puedeCancelar && onCancelarPedido && (
                        <button
                          onClick={() => onCancelarPedido(compra.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Cancelar pedido"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};