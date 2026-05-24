// src/pages/groomer/dashboard/components/CitaCardGroomer.tsx
import {
  ClockIcon,
  ScissorsIcon,
  HeartIcon,
  BeakerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PlayCircleIcon,
  FaceSmileIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import type { CitaDashboard } from '../../../../services/types/groomer';

interface CitaCardGroomerProps {
  cita: CitaDashboard;
  onAbrirFicha: (citaId: number, fichaId?: number | null) => void;
}

export const CitaCardGroomer = ({ cita, onAbrirFicha }: CitaCardGroomerProps) => {
  const puedeAbrirFicha = cita.tiene_ficha && (cita.ficha_abierta || cita.estado === 'completada');
  const puedeIniciar = cita.estado === 'confirmada';
  const isActive = cita.estado === 'confirmada' || cita.estado === 'en_curso';

  // Datos clínicos importantes con íconos
  const datosClinicos = [
    { 
      label: 'Temperamento', 
      value: cita.mascota.temperamento, 
      icon: FaceSmileIcon,
      iconColor: 'text-amber-600'
    },
    { 
      label: 'Alergias', 
      value: cita.mascota.alergias, 
      icon: ExclamationCircleIcon,
      iconColor: 'text-red-500'
    },
    { 
      label: 'Restricciones', 
      value: cita.mascota.restricciones, 
      icon: NoSymbolIcon,
      iconColor: 'text-orange-500'
    },
    { 
      label: 'Vacunas', 
      value: cita.mascota.vacunas, 
      icon: ShieldCheckIcon,
      iconColor: 'text-green-600'
    },
  ].filter(d => d.value);

  const handleClick = () => {
    if (puedeAbrirFicha && cita.ficha_id) {
      onAbrirFicha(cita.id, cita.ficha_id);
    } else if (puedeIniciar) {
      onAbrirFicha(cita.id, null);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer ${
        isActive ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-200'
      }`}
      onClick={handleClick}
    >
      {/* Header con hora y estado */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{cita.hora_inicio} - {cita.hora_fin}</span>
          </div>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500">{cita.duracion} min</span>
        </div>
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={{ backgroundColor: `${cita.estado_color}20`, color: cita.estado_color }}
        >
          {cita.estado_texto}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Mascota */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <HeartIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{cita.mascota.nombre}</h3>
            <p className="text-sm text-gray-500">
              {cita.mascota.especie} • {cita.mascota.raza || 'Raza no especificada'}
            </p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
              <span>Peso: {cita.mascota.peso_kg} kg</span>
              <span>Rango: {cita.mascota.rango_nombre || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Servicio */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
          <ScissorsIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-700">{cita.servicio.nombre}</span>
        </div>

        {/* Datos clínicos importantes */}
        {datosClinicos.length > 0 && (
          <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-1 text-xs text-amber-700 font-medium mb-1.5">
              <ExclamationTriangleIcon className="h-3 w-3" />
              <span>Datos importantes</span>
            </div>
            <div className="space-y-1">
              {datosClinicos.map((dato, idx) => {
                const IconComponent = dato.icon;
                return (
                  <div key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <IconComponent className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${dato.iconColor}`} />
                    <span className="font-medium">{dato.label}:</span>
                    <span className="truncate">{dato.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          {puedeAbrirFicha && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <BeakerIcon className="h-4 w-4" />
              <span>{cita.ficha_abierta ? 'Continuar ficha →' : 'Ver ficha →'}</span>
            </div>
          )}
          {puedeIniciar && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <PlayCircleIcon className="h-4 w-4" />
              <span>Iniciar servicio →</span>
            </div>
          )}
          {!puedeAbrirFicha && !puedeIniciar && cita.estado === 'completada' && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Servicio completado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};