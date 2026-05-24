// src/pages/groomer/fichas/components/PestañaEstadoIngreso.tsx
import { useState, useEffect } from 'react';
import { LinkIcon, BugAntIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface PestañaEstadoIngresoProps {
  estadoIngreso: string | null;
  nudos: boolean;
  tienePulgas: boolean;
  tieneHeridas: boolean;
  isOpen: boolean;
  isSaving: boolean;
  onSave: (data: {
    estadoIngreso: string;
    nudos: boolean;
    tienePulgas: boolean;
    tieneHeridas: boolean;
  }) => void;
}

export const PestañaEstadoIngreso = ({
  estadoIngreso: initialEstadoIngreso,
  nudos: initialNudos,
  tienePulgas: initialTienePulgas,
  tieneHeridas: initialTieneHeridas,
  isOpen,
  isSaving,
  onSave,
}: PestañaEstadoIngresoProps) => {
  const [estadoIngreso, setEstadoIngreso] = useState(initialEstadoIngreso || '');
  const [nudos, setNudos] = useState(initialNudos);
  const [tienePulgas, setTienePulgas] = useState(initialTienePulgas);
  const [tieneHeridas, setTieneHeridas] = useState(initialTieneHeridas);

  useEffect(() => {
    setEstadoIngreso(initialEstadoIngreso || '');
    setNudos(initialNudos);
    setTienePulgas(initialTienePulgas);
    setTieneHeridas(initialTieneHeridas);
  }, [initialEstadoIngreso, initialNudos, initialTienePulgas, initialTieneHeridas]);

  const handleSubmit = () => {
    onSave({ estadoIngreso, nudos, tienePulgas, tieneHeridas });
  };

  const hasChanges = () =>
    estadoIngreso !== (initialEstadoIngreso || '') ||
    nudos !== initialNudos ||
    tienePulgas !== initialTienePulgas ||
    tieneHeridas !== initialTieneHeridas;

  const condiciones = [
    {
      key: 'nudos',
      label: 'Nudos en el pelo',
      value: nudos,
      setter: setNudos,
      Icon: LinkIcon,
    },
    {
      key: 'pulgas',
      label: 'Tiene pulgas',
      value: tienePulgas,
      setter: setTienePulgas,
      Icon: BugAntIcon,
    },
    {
      key: 'heridas',
      label: 'Tiene heridas o lesiones',
      value: tieneHeridas,
      setter: setTieneHeridas,
      Icon: ExclamationCircleIcon,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado de ingreso
        </label>
        <textarea
          value={estadoIngreso}
          onChange={(e) => setEstadoIngreso(e.target.value)}
          disabled={!isOpen}
          rows={3}
          placeholder="Describe el estado general de la mascota al llegar..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Ej: Mascota tranquila, pelo enmallado, etc.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Condiciones detectadas</h4>
        {condiciones.map(({ key, label, value, setter, Icon }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setter(e.target.checked)}
              disabled={!isOpen}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <Icon className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      {isOpen && hasChanges() && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  );
};