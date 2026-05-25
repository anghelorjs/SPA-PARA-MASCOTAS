// src/pages/groomer/agenda/components/CitaCard.tsx
import { 
  ClockIcon, 
  ScissorsIcon, 
  HeartIcon, 
  ExclamationTriangleIcon, 
  PlayIcon, 
  DocumentTextIcon, 
  BeakerIcon,
  FaceSmileIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import type { CitaGroomer } from '../../../../services/types/groomer';

interface CitaCardProps {
  cita: CitaGroomer;
  onVerHistorial: (mascotaId: number, mascotaNombre: string) => void;
  onIniciarServicio: (citaId: number) => void;
  onVerFicha: (fichaId: number) => void;
  isLoadingAction: boolean;
}

export const CitaCard = ({
  cita,
  onVerHistorial,
  onIniciarServicio,
  onVerFicha,
  isLoadingAction,
}: CitaCardProps) => {
  const puedeIniciar = cita.estado === 'confirmada';
  const tieneFichaAbierta = cita.ficha_abierta;
  const tieneFichaCerrada = cita.tiene_ficha && !cita.ficha_abierta;

  // Datos clínicos para mostrar con iconos de Heroicons
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
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
        {/* Mascota y servicio */}
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

        {/* Acciones */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onVerHistorial(cita.mascota.id, cita.mascota.nombre)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Ver historial
          </button>

          {puedeIniciar && (
            <button
              onClick={() => onIniciarServicio(cita.id)}
              disabled={isLoadingAction}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="h-4 w-4" />
              {isLoadingAction ? 'Iniciando...' : 'Iniciar servicio'}
            </button>
          )}

          {tieneFichaAbierta && (
            <button
              onClick={() => onVerFicha(cita.ficha_id!)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BeakerIcon className="h-4 w-4" />
              Continuar ficha
            </button>
          )}

          {tieneFichaCerrada && (
            <button
              onClick={() => onVerFicha(cita.ficha_id!)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentTextIcon className="h-4 w-4" />
              Ver ficha
            </button>
          )}
        </div>
      </div>
    </div>
  );
};