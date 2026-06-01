// src/pages/admin/reportes/components/PestañaIngresos.tsx
import { useRef } from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';
import { useReporteIngresos } from '../hooks/useReporteIngresos';
import { FiltroFechas } from './FiltroFechas';
import { FiltroGroomer } from './FiltroGroomer';
import { BotonesExportar } from './BotonesExportar';
import { GraficoIngresosDiarios } from './GraficoIngresosDiarios';
import { GraficoIngresosPorTipo } from './GraficoIngresosPorTipo';
import { GraficoIngresosPorMedioPago } from './GraficoIngresosPorMedioPago';

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const PestañaIngresos = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isLoading,
    fechaDesde,
    fechaHasta,
    groomerId,
    setFechaDesde,
    setFechaHasta,
    setGroomerId,
    generarReporte,
  } = useReporteIngresos();

  const resumen = data?.resumen;

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
            <FiltroGroomer groomerId={groomerId} onGroomerChange={setGroomerId} isLoading={isLoading} />
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
            nombreReporte={`reporte_ingresos_${fechaDesde}_${fechaHasta}`}
            printElementId="reporte-ingresos-print"
            isLoading={isLoading}
          />
        </div>
      </div>

      {!data && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">Genera el reporte para visualizar ingresos.</p>
          <p className="mt-1 text-sm text-slate-500">Filtra por fechas y groomer para comparar ventas y tickets.</p>
        </div>
      )}

      {data && (
        <div id="reporte-ingresos-print" className="space-y-5">
          {resumen && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Total ingresos', `Bs. ${toNumber(resumen.total_ingresos).toFixed(2)}`, 'text-emerald-700'],
                ['Productos', `Bs. ${toNumber(resumen.ingresos_productos).toFixed(2)}`, 'text-blue-700'],
                ['Servicios', `Bs. ${toNumber(resumen.ingresos_servicios).toFixed(2)}`, 'text-orange-700'],
                ['Ticket promedio', `Bs. ${toNumber(resumen.ticket_promedio_general).toFixed(2)}`, 'text-violet-700'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <GraficoIngresosDiarios data={data.grafica_ingresos_diarios || []} isLoading={isLoading} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <GraficoIngresosPorTipo data={data.ingresos_por_tipo || []} isLoading={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <GraficoIngresosPorMedioPago data={data.ingresos_por_medio_pago || []} isLoading={isLoading} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-slate-900">Ticket estimado vs real</h3>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {data.ticket_estimado_real?.slice(0, 10).map((item) => (
                  <div
                    key={item.cita_id}
                    className="flex flex-col gap-1 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium text-slate-700">{item.servicio}</span>
                    <div className="flex flex-wrap gap-3">
                      <span className="text-slate-500">Base: Bs. {toNumber(item.precio_base).toFixed(2)}</span>
                      <span className="font-semibold text-emerald-700">
                        Real: Bs. {toNumber(item.precio_ajustado).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
