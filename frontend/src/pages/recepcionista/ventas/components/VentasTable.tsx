// src/pages/recepcionista/ventas/components/VentasTable.tsx
import { EyeIcon, PrinterIcon } from '@heroicons/react/24/outline';
import type { Venta } from '../types';
import { ESTADO_LABELS, ESTADO_COLORS, MEDIO_PAGO_LABELS, MEDIO_PAGO_ICONS } from '../types';

type NumericLike = number | string | null | undefined;

const toNumber = (value: NumericLike): number => {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// ✅ Función para determinar el tipo de venta
const getTipoVenta = (venta: Venta): { tipo: string; icon: string; color: string } => {
  if (!venta.detalleVentas || venta.detalleVentas.length === 0) {
    return { tipo: 'Sin items', icon: '❓', color: 'bg-gray-100 text-gray-600' };
  }
  
  // Verificar si todos los items son del mismo tipo
  const tieneProducto = venta.detalleVentas.some(d => d.tipo === 'producto');
  const tieneServicio = venta.detalleVentas.some(d => d.tipo === 'servicio');
  
  if (tieneProducto && tieneServicio) {
    return { tipo: 'Mixta', icon: '🔄', color: 'bg-purple-100 text-purple-700' };
  } else if (tieneProducto) {
    return { tipo: 'Productos', icon: '📦', color: 'bg-blue-100 text-blue-700' };
  } else if (tieneServicio) {
    return { tipo: 'Servicio', icon: '✂️', color: 'bg-green-100 text-green-700' };
  }
  
  return { tipo: 'Otro', icon: '❓', color: 'bg-gray-100 text-gray-600' };
};

interface VentasTableProps {
  ventas: Venta[];
  isLoading: boolean;
  onVerDetalle: (venta: Venta) => void;
  onImprimirFactura?: (ventaId: number) => void;
}

export const VentasTable = ({
  ventas,
  isLoading,
  onVerDetalle,
  onImprimirFactura,
}: VentasTableProps) => {
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFechaCompleta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay ventas registradas para esta fecha
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              {/* ✅ NUEVA COLUMNA: Tipo */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medio Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ventas.map((venta) => {
              const tipoInfo = getTipoVenta(venta);
              return (
                <tr key={venta.idVenta} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{venta.idVenta}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFechaCompleta(venta.fecha)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {venta.cliente ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {venta.cliente.user.nombre} {venta.cliente.user.apellido}
                        </div>
                        <div className="text-xs text-gray-500">
                          {venta.cliente.user.telefono || 'Sin teléfono'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Venta anónima</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatFecha(venta.fecha)}</div>
                    <div className="text-xs text-gray-500">hs</div>
                  </td>
                  {/* ✅ NUEVA CELDA: Tipo */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${tipoInfo.color}`}>
                      <span>{tipoInfo.icon}</span>
                      <span>{tipoInfo.tipo}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-green-600">
                      Bs. {toNumber(venta.total).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {venta.detalleVentas?.length || 0} item(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                      <span>{MEDIO_PAGO_ICONS[venta.medioPago] || '💵'}</span>
                      <span>{MEDIO_PAGO_LABELS[venta.medioPago] || venta.medioPago}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ESTADO_COLORS[venta.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {ESTADO_LABELS[venta.estado] || venta.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onVerDetalle(venta)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {onImprimirFactura && (
                        <button
                          onClick={() => onImprimirFactura(venta.idVenta)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Imprimir factura"
                        >
                          <PrinterIcon className="h-4 w-4" />
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