// src/pages/admin/reportes/components/PestañaAgenda.tsx
import { useRef } from 'react';
import { ClipboardDocumentListIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useReporteAgenda } from '../hooks/useReporteAgenda';
import { FiltroFechas } from './FiltroFechas';
import { FiltroGroomer } from './FiltroGroomer';
import { BotonesExportar } from './BotonesExportar';
import { GraficaCitasPorDia } from './GraficaCitasPorDia';
import { GraficaCitasPorGroomer } from './GraficaCitasPorGroomer';
import { GraficaCitasPorServicio } from './GraficaCitasPorServicio';

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const PestañaAgenda = () => {
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
  } = useReporteAgenda();

  const estadisticas = data?.estadisticas;
  const canceladasVsCompletadas = data?.canceladas_vs_completadas;
  const completadasTotal = canceladasVsCompletadas?.find((c) => c.tipo === 'Completadas')?.total || 0;
  const canceladasTotal = canceladasVsCompletadas?.find((c) => c.tipo === 'Canceladas')?.total || 0;
  const totalCanceladasCompletadas = completadasTotal + canceladasTotal;
  const completadasPercent = totalCanceladasCompletadas ? (completadasTotal / totalCanceladasCompletadas) * 100 : 0;
  const canceladasPercent = totalCanceladasCompletadas ? (canceladasTotal / totalCanceladasCompletadas) * 100 : 0;

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
            nombreReporte={`reporte_agenda_${fechaDesde}_${fechaHasta}`}
            printElementId="reporte-agenda-print"
            isLoading={isLoading}
          />
        </div>
      </div>

      {!data && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">Genera el reporte para visualizar la agenda.</p>
          <p className="mt-1 text-sm text-slate-500">Ajusta el rango de fechas o el groomer y presiona Generar.</p>
        </div>
      )}

      {data && (
        <div id="reporte-agenda-print" className="space-y-5">
          {estadisticas && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[
                ['Total citas', estadisticas.total_citas, 'text-blue-700'],
                ['Completadas', estadisticas.citas_completadas, 'text-emerald-700'],
                ['Canceladas', estadisticas.citas_canceladas, 'text-rose-700'],
                ['Tasa completadas', `${toNumber(estadisticas.tasa_completadas).toFixed(1)}%`, 'text-emerald-700'],
                ['Tasa canceladas', `${toNumber(estadisticas.tasa_canceladas).toFixed(1)}%`, 'text-rose-700'],
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
              <GraficaCitasPorDia data={data.grafica_citas_por_dia || []} isLoading={isLoading} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <GraficaCitasPorGroomer data={data.grafica_citas_por_groomer || []} isLoading={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <GraficaCitasPorServicio data={data.grafica_citas_por_servicio || []} isLoading={isLoading} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardDocumentListIcon className="h-5 w-5 shrink-0 text-orange-500" />
                <h3 className="text-base font-semibold text-slate-900">Completadas vs canceladas</h3>
              </div>
              {canceladasVsCompletadas && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">Completadas</span>
                      <span className="font-semibold text-slate-900">{completadasTotal}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${completadasPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">Canceladas</span>
                      <span className="font-semibold text-slate-900">{canceladasTotal}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-rose-500" style={{ width: `${canceladasPercent}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
