import { EyeIcon, PrinterIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { Venta } from '../types';
import { ESTADO_LABELS, ESTADO_COLORS, MEDIO_PAGO_LABELS } from '../types';

type NumericLike = number | string | null | undefined;

const toNumber = (value: NumericLike): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTime = (value: string): string => {
  if (!value) return '--:--';
  const match = value.match(/\d{4}-\d{2}-\d{2}[ T](\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  return value;
};

const formatDate = (value: string): string => {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const getTipoVenta = (venta: Venta) => {
  const tipo = venta.tipo_venta ?? (
    venta.detalleVentas?.some((d) => d.tipo === 'producto') && venta.detalleVentas?.some((d) => d.tipo === 'servicio')
      ? 'mixta'
      : venta.detalleVentas?.[0]?.tipo ?? 'sin_items'
  );

  if (tipo === 'servicio') {
    return {
      label: 'Servicio',
      description: 'Cobro grooming',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Icon: SparklesIcon,
    };
  }

  if (tipo === 'mixta') {
    return {
      label: 'Mixta',
      description: 'Productos y servicio',
      className: 'bg-violet-50 text-violet-700 border-violet-200',
      Icon: ShoppingBagIcon,
    };
  }

  return {
    label: 'Producto',
    description: 'Venta de tienda',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    Icon: ShoppingBagIcon,
  };
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
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          <p className="mt-2 text-gray-500">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay registros para esta fecha y filtros.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Medio de pago</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ventas.map((venta) => {
              const tipo = getTipoVenta(venta);
              const TipoIcon = tipo.Icon;

              return (
                <tr
                  key={venta.idVenta}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onVerDetalle(venta)}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">#{venta.idVenta}</div>
                    <div className="text-xs text-gray-500">{formatDate(venta.fecha)} - {formatTime(venta.fecha)}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {venta.cliente ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {venta.cliente.user.nombre} {venta.cliente.user.apellido}
                        </div>
                        <div className="text-xs text-gray-500">{venta.cliente.user.telefono || 'Sin telefono'}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Venta anonima</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-full border ${tipo.className}`}>
                      <TipoIcon className="h-4 w-4" />
                      <span>{tipo.label}</span>
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{tipo.description}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">Bs. {toNumber(venta.total).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{venta.detalleVentas?.length || 0} item(s)</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {MEDIO_PAGO_LABELS[venta.medioPago] || venta.medioPago}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ESTADO_COLORS[venta.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {ESTADO_LABELS[venta.estado] || venta.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onVerDetalle(venta);
                        }}
                        className="p-1.5 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {onImprimirFactura && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onImprimirFactura(venta.idVenta);
                          }}
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
