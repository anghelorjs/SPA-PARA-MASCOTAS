import { XMarkIcon } from '@heroicons/react/24/outline';

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

interface FiltroVentasProps {
  fecha: string;
  filtroEstado: string;
  filtroTipo: string;
  resumen: {
    general: number;
    productos: number;
    servicios: number;
  };
  onFechaChange: (fecha: string) => void;
  onFiltroEstadoChange: (estado: string) => void;
  onFiltroTipoChange: (tipo: string) => void;
  onLimpiarFiltros?: () => void;
}

const tipos = [
  { value: 'todas', label: 'Todas' },
  { value: 'producto', label: 'Productos' },
  { value: 'servicio', label: 'Servicios' },
  { value: 'mixta', label: 'Mixtas' },
];

const estados = [
  { value: 'todas', label: 'Todas' },
  { value: 'pagado', label: 'Pagadas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'cancelado', label: 'Canceladas' },
];

export const FiltroVentas = ({
  fecha,
  filtroEstado,
  filtroTipo,
  resumen,
  onFechaChange,
  onFiltroEstadoChange,
  onFiltroTipoChange,
  onLimpiarFiltros,
}: FiltroVentasProps) => {
  const tieneFiltros = filtroEstado !== 'todas' || filtroTipo !== 'todas';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-500">Total del dia</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">Bs. {toNumber(resumen.general).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-700">Productos</p>
          <p className="mt-1 text-xl font-semibold text-blue-800">Bs. {toNumber(resumen.productos).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs font-medium text-emerald-700">Servicios grooming</p>
          <p className="mt-1 text-xl font-semibold text-emerald-800">Bs. {toNumber(resumen.servicios).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr_auto] gap-3 items-end">
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">Fecha</span>
          <input
            type="date"
            value={fecha}
            onChange={(e) => onFechaChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </label>

        <div>
          <span className="block text-xs font-medium text-gray-500 mb-1">Tipo</span>
          <div className="flex flex-wrap gap-2">
            {tipos.map((tipo) => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => onFiltroTipoChange(tipo.value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  filtroTipo === tipo.value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tipo.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-gray-500 mb-1">Estado</span>
          <div className="flex flex-wrap gap-2">
            {estados.map((estado) => (
              <button
                key={estado.value}
                type="button"
                onClick={() => onFiltroEstadoChange(estado.value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  filtroEstado === estado.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </div>

        {tieneFiltros && onLimpiarFiltros && (
          <button
            type="button"
            onClick={onLimpiarFiltros}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <XMarkIcon className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};
