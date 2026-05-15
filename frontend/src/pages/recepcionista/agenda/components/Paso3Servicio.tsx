// src/pages/recepcionista/agenda/components/Paso3Servicio.tsx
import { ScissorsIcon, ClockIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { ServicioConPrecio } from '../services/recepcionista.agenda.service';

interface Paso3ServicioProps {
  servicios: ServicioConPrecio[];
  onSelectServicio: (servicio: ServicioConPrecio | null) => void;
  selectedServicio: ServicioConPrecio | null;
  isLoading: boolean;
}

/** El backend puede devolver precio como string ("45.00") o number. Lo normalizamos aquí. */
const formatPrecio = (precio: number | string | null | undefined): string => {
  const n = Number(precio);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

export const Paso3Servicio = ({
  servicios,
  onSelectServicio,
  selectedServicio,
  isLoading,
}: Paso3ServicioProps) => {
  // ── Servicio ya seleccionado ──────────────────────────────────────────────
  if (selectedServicio) {
    return (
      <div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ScissorsIcon className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedServicio.nombre}</p>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  {selectedServicio.duracion_minutos} min
                </span>
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  {formatPrecio(selectedServicio.precio)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectServicio(null)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Cambiar
          </button>
        </div>
        <p className="mt-2 text-xs text-green-600 text-center">
          ✓ Servicio seleccionado. Haz clic en <strong>Siguiente</strong> para continuar.
        </p>
      </div>
    );
  }

  // ── Cargando ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-sm text-gray-500">Cargando servicios disponibles...</p>
      </div>
    );
  }

  // ── Sin servicios ─────────────────────────────────────────────────────────
  if (servicios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="p-3 bg-yellow-50 rounded-full">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400" />
        </div>
        <p className="text-gray-700 font-medium">No hay servicios activos</p>
        <p className="text-sm text-gray-400">
          Contacta al administrador para activar servicios en el sistema.
        </p>
      </div>
    );
  }

  // ── Lista ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {servicios.map((servicio) => (
        <button
          key={servicio.id}
          onClick={() => onSelectServicio(servicio)}
          className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
              <ScissorsIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 group-hover:text-blue-900">
                {servicio.nombre}
              </p>
              <div className="flex flex-wrap gap-4 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3" />
                  {servicio.duracion_minutos} min
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <CurrencyDollarIcon className="h-3 w-3" />
                  {formatPrecio(servicio.precio)}
                </span>
                {servicio.admite_doble_booking && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Doble booking
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity self-center">
              Elegir →
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};