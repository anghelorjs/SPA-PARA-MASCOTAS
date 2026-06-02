// src/pages/admin/grooming/components/PestañaFichasHoy.tsx
import { useState } from 'react';
import { ArrowPathIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useFichasHoyAdmin } from '../hooks/useFichasHoyAdmin';
import { FiltroGroomerFichas } from './FiltroGroomerFichas';
import { FiltroEstadoFichas } from './FiltroEstadoFichas';
import { TablaFichasHoy } from './TablaFichasHoy';
import { ModalDetalleFichaAdmin } from './ModalDetalleFichaAdmin';
import { toDateInputValue, formatLocalDate } from '../../../recepcionista/agenda/utils/date';

export const PestañaFichasHoy = () => {
  const {
    fichas,
    fecha,
    groomerId,
    filtroEstado,
    isLoading,
    cambiarFecha,
    cambiarGroomer,
    cambiarFiltroEstado,
    refresh,
  } = useFichasHoyAdmin();

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [selectedFichaId, setSelectedFichaId] = useState<number | null>(null);

  const handleVerDetalle = (id: number) => {
    setSelectedFichaId(id);
    setDetalleOpen(true);
  };

  const fechaFormateada = formatLocalDate(fecha, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-5">
      {/* Header con fecha y actualizar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{fechaFormateada}</span>
          <input
            type="date"
            value={fecha}
            onChange={(e) => cambiarFecha(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <FiltroGroomerFichas
          groomerId={groomerId}
          onGroomerChange={cambiarGroomer}
          isLoading={isLoading}
        />
        <FiltroEstadoFichas
          estadoSeleccionado={filtroEstado}
          onEstadoChange={cambiarFiltroEstado}
          isLoading={isLoading}
        />
      </div>

      {/* Tabla */}
      <TablaFichasHoy
        fichas={fichas}
        isLoading={isLoading}
        onVerDetalle={handleVerDetalle}
      />

      {/* Modal detalle */}
      <ModalDetalleFichaAdmin
        isOpen={detalleOpen}
        fichaId={selectedFichaId}
        onClose={() => {
          setDetalleOpen(false);
          setSelectedFichaId(null);
        }}
      />
    </div>
  );
};