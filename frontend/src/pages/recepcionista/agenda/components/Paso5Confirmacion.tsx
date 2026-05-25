// src/pages/recepcionista/agenda/components/Paso5Confirmacion.tsx
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type {
  ClienteSearchResult,
  MascotaData,
  ServicioConPrecio,
  SlotDisponible,
} from '../services/recepcionista.agenda.service';
import { formatLocalDate } from '../utils/date';

interface Paso5ConfirmacionProps {
  cliente: ClienteSearchResult;
  mascota: MascotaData;
  servicio: ServicioConPrecio;
  slot: SlotDisponible;
  fecha: string;
  observaciones?: string;
  onConfirmar: () => void;
  isConfirming: boolean;
  error?: string | null;
}

/** Normaliza precio que puede venir como string ("45.00") o number desde Laravel/MySQL */
const formatPrecio = (precio: number | string | null | undefined): string => {
  const n = Number(precio);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

export const Paso5Confirmacion = ({
  cliente,
  mascota,
  servicio,
  slot,
  fecha,
  observaciones,
  onConfirmar,
  isConfirming,
  error,
}: Paso5ConfirmacionProps) => {
  const fechaFormateada = formatLocalDate(fecha, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Banner de información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircleIcon className="h-6 w-6 text-blue-600 shrink-0" />
        <div>
          <p className="font-medium text-blue-800">Cita pendiente de confirmación</p>
          <p className="text-sm text-blue-600">
            Se enviará una notificación a {cliente.nombre} por{' '}
            {cliente.canal_contacto || 'whatsapp'} para que confirme la cita.
            Tiene 24 horas para hacerlo.
          </p>
        </div>
      </div>

      {/* Resumen de la cita */}
      <div className="border rounded-lg divide-y text-sm">
        <div className="p-3 flex justify-between">
          <span className="text-gray-500">Cliente</span>
          <span className="font-medium text-gray-900">{cliente.nombre}</span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-gray-500">Mascota</span>
          <span className="font-medium text-gray-900">
            {mascota.nombre} ({mascota.especie}
            {mascota.raza ? ` • ${mascota.raza}` : ''})
          </span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-gray-500">Servicio</span>
          <span className="font-medium text-gray-900">{servicio.nombre}</span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-gray-500">Duración</span>
          <span className="font-medium text-gray-900">{servicio.duracion_minutos} minutos</span>
        </div>

        <div className="p-3 flex justify-between items-center">
          <span className="text-gray-500">Precio</span>
          <span className="font-semibold text-lg text-green-600">
            Bs. {formatPrecio(servicio.precio)}
          </span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-gray-500">Groomer</span>
          <span className="font-medium text-gray-900">{slot.groomer_nombre}</span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-gray-500">Fecha y hora</span>
          <span className="font-medium text-gray-900 text-right">
            {fechaFormateada}
            <br />
            <span className="text-blue-600">{slot.hora_inicio} – {slot.hora_fin}</span>
          </span>
        </div>

        {observaciones && (
          <div className="p-3">
            <span className="text-gray-500 block mb-1">Observaciones</span>
            <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs">{observaciones}</p>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Botón crear cita pendiente */}
      <button
        onClick={onConfirmar}
        disabled={isConfirming}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConfirming ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Creando cita pendiente...
          </span>
        ) : (
          'Crear Cita (Pendiente de Confirmación)'
        )}
      </button>

      {/* Texto explicativo */}
      <p className="text-xs text-gray-400 text-center">
        La cita se creará con estado "pendiente de confirmación". 
        El cliente recibirá una notificación para confirmarla en las próximas 24 horas.
      </p>
    </div>
  );
};