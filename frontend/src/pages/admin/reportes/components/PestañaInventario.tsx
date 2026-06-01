// src/pages/admin/reportes/components/PestañaInventario.tsx
import { useRef } from 'react';
import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useReporteInventario } from '../hooks/useReporteInventario';
import { FiltroFechas } from './FiltroFechas';
import { FiltroCategoria } from './FiltroCategoria';
import { BotonesExportar } from './BotonesExportar';
import { TablaProductosCriticos } from './TablaProductosCriticos';
import { TablaInsumosConsumidos } from './TablaInsumosConsumidos';
import { TablaProductosVendidos } from './TablaProductosVendidos';

export const PestañaInventario = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isLoading,
    fechaDesde,
    fechaHasta,
    categoriaId,
    setFechaDesde,
    setFechaHasta,
    setCategoriaId,
    generarReporte,
  } = useReporteInventario();

  const tieneFiltros = fechaDesde !== '' || fechaHasta !== '';

  return (
    <div className="space-y-5" ref={printRef}>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-end">
            <FiltroFechas
              fechaDesde={fechaDesde}
              fechaHasta={fechaHasta}
              onFechaDesdeChange={setFechaDesde}
              onFechaHastaChange={setFechaHasta}
              isLoading={isLoading}
            />
            <FiltroCategoria categoriaId={categoriaId} onCategoriaChange={setCategoriaId} isLoading={isLoading} />
            <button
              onClick={generarReporte}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlayIcon className="h-4 w-4 shrink-0" />
              {isLoading ? 'Generando...' : 'Generar'}
            </button>
          </div>
          <BotonesExportar
            data={data}
            exportData={data?.export_data}
            nombreReporte={`reporte_inventario_${fechaDesde || 'inicio'}_${fechaHasta || 'fin'}`}
            printElementId="reporte-inventario-print"
            isLoading={isLoading}
          />
        </div>
        {!tieneFiltros && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            Sin filtros de fecha se muestran los datos historicos completos.
          </p>
        )}
      </div>

      {!data && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">Genera el reporte para revisar inventario.</p>
          <p className="mt-1 text-sm text-slate-500">Puedes filtrar por rango de fechas y categoria.</p>
        </div>
      )}

      {data && (
        <div id="reporte-inventario-print" className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-rose-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-rose-100 bg-rose-50 px-4 py-3">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-rose-600" />
              <h3 className="text-base font-semibold text-rose-900">Productos con stock critico</h3>
            </div>
            <div className="p-4">
              <TablaProductosCriticos data={data.productos_criticos || []} isLoading={isLoading} />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3">
              <ArchiveBoxIcon className="h-5 w-5 shrink-0 text-blue-600" />
              <h3 className="text-base font-semibold text-blue-900">Insumos mas consumidos del periodo</h3>
            </div>
            <div className="p-4">
              <TablaInsumosConsumidos data={data.insumos_mas_consumidos || []} isLoading={isLoading} />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-4 py-3">
              <ShoppingBagIcon className="h-5 w-5 shrink-0 text-emerald-600" />
              <h3 className="text-base font-semibold text-emerald-900">Productos mas vendidos</h3>
            </div>
            <div className="p-4">
              <TablaProductosVendidos data={data.productos_mas_vendidos || []} isLoading={isLoading} />
            </div>
          </div>

          {data.movimientos_recientes && data.movimientos_recientes.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <ClipboardDocumentListIcon className="h-5 w-5 shrink-0 text-slate-600" />
                <h3 className="text-base font-semibold text-slate-900">Movimientos de inventario recientes</h3>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Producto</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Cantidad</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.movimientos_recientes.map((mov, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm text-slate-600">{mov.fecha}</td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-800">{mov.producto}</td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              mov.tipo === 'entrada'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mov.tipo === 'salida'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {mov.tipo === 'entrada' ? 'Entrada' : mov.tipo === 'salida' ? 'Salida' : 'Ajuste'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-semibold text-slate-900">{mov.cantidad}</td>
                        <td className="max-w-xs truncate px-4 py-2 text-sm text-slate-500">{mov.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
