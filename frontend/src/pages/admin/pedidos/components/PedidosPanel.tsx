import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { CheckCircleIcon, CreditCardIcon, EyeIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Pagination from '../../../../components/common/Pagination';
import { useToast } from '../../../../hooks/useToast';
import { adminPedidosService } from '../services/admin.pedidos.service';
import type { EstadoPedido, MedioPagoPedido, Pedido, ResumenPedidos } from '../types';

const estados: Array<{ id: EstadoPedido | 'todos'; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'pagado', label: 'Pagados' },
  { id: 'cancelado', label: 'Cancelados' },
];

const estadoClass: Record<EstadoPedido, string> = {
  pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmado: 'bg-blue-100 text-blue-700 border-blue-200',
  pagado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelado: 'bg-rose-100 text-rose-700 border-rose-200',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
};

const currency = (value: number) => `Bs. ${Number(value || 0).toFixed(2)}`;

export const PedidosPanel = () => {
  const { showToast } = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [resumen, setResumen] = useState<ResumenPedidos>({ pendiente: 0, confirmado: 0, pagado: 0, cancelado: 0 });
  const [estado, setEstado] = useState<EstadoPedido | 'todos'>('pendiente');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [pedidoPago, setPedidoPago] = useState<Pedido | null>(null);
  const [medioPago, setMedioPago] = useState<MedioPagoPedido>('efectivo');
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const loadPedidos = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminPedidosService.listar({ estado, page });
      setPedidos(data.pedidos.data);
      setResumen(data.resumen);
      setLastPage(data.pedidos.last_page);
      setTotal(data.pedidos.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar pedidos'), 'error');
      setPedidos([]);
    } finally {
      setIsLoading(false);
    }
  }, [estado, page, showToast]);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  const totalPendiente = useMemo(() => resumen.pendiente + resumen.confirmado, [resumen]);

  const handleConfirmar = async (pedido: Pedido) => {
    try {
      setSubmittingId(pedido.idPedido);
      await adminPedidosService.confirmar(pedido.idPedido);
      showToast('Pedido confirmado y cliente notificado', 'success');
      await loadPedidos();
    } catch (error) {
      showToast(getErrorMessage(error, 'No se pudo confirmar el pedido'), 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handlePagar = async () => {
    if (!pedidoPago) return;
    try {
      setSubmittingId(pedidoPago.idPedido);
      const result = await adminPedidosService.pagar(pedidoPago.idPedido, medioPago);
      showToast(`Pedido pagado. Venta #${result.venta_id} registrada`, 'success');
      setPedidoPago(null);
      await loadPedidos();
    } catch (error) {
      showToast(getErrorMessage(error, 'No se pudo registrar el pago'), 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Seguimiento, confirmacion y cobro de pedidos del catalogo.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">Por atender</p>
            <p className="text-lg font-semibold text-gray-900">{totalPendiente}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">Pendientes</p>
            <p className="text-lg font-semibold text-amber-600">{resumen.pendiente}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">Confirmados</p>
            <p className="text-lg font-semibold text-blue-600">{resumen.confirmado}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">Pagados</p>
            <p className="text-lg font-semibold text-emerald-600">{resumen.pagado}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2">
        {estados.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setEstado(item.id);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              estado === item.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Cliente', 'Fecha', 'Total', 'Estado', 'Canal', 'Acciones'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">Cargando pedidos...</td>
                </tr>
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ShoppingBagIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No hay pedidos para este filtro</p>
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.idPedido} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">#{pedido.idPedido}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Sin cliente'}
                      </p>
                      <p className="text-xs text-gray-500">{pedido.cliente?.telefono || pedido.cliente?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{pedido.fecha}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{currency(pedido.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${estadoClass[pedido.estado]}`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{pedido.canal || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setDetalle(pedido)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Ver detalle
                        </button>
                        {pedido.estado === 'pendiente' && (
                          <button
                            onClick={() => handleConfirmar(pedido)}
                            disabled={submittingId === pedido.idPedido}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Confirmar
                          </button>
                        )}
                        {pedido.estado !== 'pagado' && pedido.estado !== 'cancelado' && (
                          <button
                            onClick={() => {
                              setPedidoPago(pedido);
                              setMedioPago('efectivo');
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <CreditCardIcon className="h-4 w-4" />
                            Marcar pagado
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && total > 0 && (
        <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} showTotal />
      )}

      {detalle && (
        <PedidoDetalleModal pedido={detalle} onClose={() => setDetalle(null)} />
      )}

      {pedidoPago && (
        <PagoPedidoModal
          pedido={pedidoPago}
          medioPago={medioPago}
          isLoading={submittingId === pedidoPago.idPedido}
          onMedioPagoChange={setMedioPago}
          onClose={() => setPedidoPago(null)}
          onConfirm={handlePagar}
        />
      )}
    </div>
  );
};

const PedidoDetalleModal = ({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) => (
  <ModalShell title={`Detalle del pedido #${pedido.idPedido}`} onClose={onClose}>
    <PedidoItems pedido={pedido} />
  </ModalShell>
);

const PagoPedidoModal = ({
  pedido,
  medioPago,
  isLoading,
  onMedioPagoChange,
  onClose,
  onConfirm,
}: {
  pedido: Pedido;
  medioPago: MedioPagoPedido;
  isLoading: boolean;
  onMedioPagoChange: (value: MedioPagoPedido) => void;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <ModalShell title={`Cobrar pedido #${pedido.idPedido}`} onClose={onClose}>
    <PedidoItems pedido={pedido} />
    <div className="mt-5 border-t border-gray-200 pt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Metodo de pago</label>
      <select
        value={medioPago}
        onChange={(event) => onMedioPagoChange(event.target.value as MedioPagoPedido)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="efectivo">Efectivo</option>
        <option value="qr">QR</option>
        <option value="transferencia">Transferencia</option>
      </select>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
      >
        {isLoading ? 'Registrando pago...' : 'Confirmar pago y registrar venta'}
      </button>
    </div>
  </ModalShell>
);

const PedidoItems = ({ pedido }: { pedido: Pedido }) => (
  <div className="space-y-3">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Sin cliente'}
        </p>
        <p className="text-xs text-gray-500">{pedido.cliente?.telefono || pedido.cliente?.email}</p>
      </div>
      <p className="text-lg font-bold text-gray-900">{currency(pedido.total)}</p>
    </div>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {pedido.items.map((item) => (
        <div key={item.idItemPedido} className="flex items-center justify-between gap-4 px-3 py-3 border-b last:border-b-0 border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">{item.producto}</p>
            <p className="text-xs text-gray-500">{item.variante} · Stock actual: {item.stockActual}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-700">{item.cantidad} x {currency(item.precioUnitario)}</p>
            <p className="text-sm font-semibold text-gray-900">{currency(item.subtotal)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ModalShell = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(event) => event.stopPropagation()}>
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto max-h-[calc(90vh-72px)]">{children}</div>
    </div>
  </div>
);
