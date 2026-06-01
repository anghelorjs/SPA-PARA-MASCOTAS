// src/pages/admin/reportes/components/PestañaClientes.tsx
import { useRef } from 'react';
import { ChartBarIcon, ClockIcon, PlayIcon, SparklesIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useReporteClientes } from '../hooks/useReporteClientes';
import { FiltroFechas } from './FiltroFechas';
import { BotonesExportar } from './BotonesExportar';
import { TablaTopClientes } from './TablaTopClientes';
import { TablaClientesInactivos } from './TablaClientesInactivos';
import { TablaTopMascotas } from './TablaTopMascotas';

export const PestañaClientes = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, fechaDesde, fechaHasta, setFechaDesde, setFechaHasta, generarReporte } = useReporteClientes();

  const tieneFiltros = fechaDesde !== '' || fechaHasta !== '';
  const distribucion = data?.distribucion_por_especie;
  const clientesNuevos = data?.clientes_nuevos_por_mes;

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
            nombreReporte={`reporte_clientes_${fechaDesde || 'inicio'}_${fechaHasta || 'fin'}`}
            printElementId="reporte-clientes-print"
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
          <p className="text-sm font-semibold text-slate-700">Genera el reporte para visualizar clientes.</p>
          <p className="mt-1 text-sm text-slate-500">Revisa recurrencia, mascotas atendidas y clientes inactivos.</p>
        </div>
      )}

      {data && (
        <div id="reporte-clientes-print" className="space-y-5">
          {distribucion && distribucion.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-50 px-4 py-3">
                <UserGroupIcon className="h-5 w-5 shrink-0 text-violet-600" />
                <h3 className="text-base font-semibold text-violet-900">Distribucion de mascotas por especie</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {distribucion.map((item) => (
                    <div key={item.especie} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-2xl font-bold text-slate-900">{item.total}</p>
                      <p className="mt-1 text-sm font-medium capitalize text-slate-700">{item.especie}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.porcentaje}% del total</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3">
              <TrophyIcon className="h-5 w-5 shrink-0 text-blue-600" />
              <h3 className="text-base font-semibold text-blue-900">Top clientes por numero de citas</h3>
            </div>
            <div className="p-4">
              <TablaTopClientes data={data.top_clientes || []} isLoading={isLoading} />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-orange-100 bg-orange-50 px-4 py-3">
              <ClockIcon className="h-5 w-5 shrink-0 text-orange-600" />
              <h3 className="text-base font-semibold text-orange-900">Clientes sin cita en los ultimos 60 dias</h3>
            </div>
            <div className="p-4">
              <TablaClientesInactivos data={data.clientes_inactivos || []} isLoading={isLoading} />
            </div>
          </div>

          {clientesNuevos && clientesNuevos.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-4 py-3">
                <ChartBarIcon className="h-5 w-5 shrink-0 text-emerald-600" />
                <h3 className="text-base font-semibold text-emerald-900">Clientes nuevos por mes</h3>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mes</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Nuevos clientes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {clientesNuevos.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm font-medium text-slate-700">{item.mes} {item.año}</td>
                        <td className="px-4 py-2 text-right text-sm font-semibold text-blue-700">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-pink-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-pink-100 bg-pink-50 px-4 py-3">
              <SparklesIcon className="h-5 w-5 shrink-0 text-pink-600" />
              <h3 className="text-base font-semibold text-pink-900">Top mascotas mas atendidas</h3>
            </div>
            <div className="p-4">
              <TablaTopMascotas data={data.top_mascotas || []} isLoading={isLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
