// src/pages/groomer/fichas/components/PestañaObservaciones.tsx
import { useState, useEffect } from 'react';

interface PestañaObservacionesProps {
  observaciones: string | null;
  recomendaciones: string | null;
  isOpen: boolean;
  isSaving: boolean;
  onSave: (observaciones: string | null, recomendaciones: string | null) => void;
}

export const PestañaObservaciones = ({
  observaciones: initialObservaciones,
  recomendaciones: initialRecomendaciones,
  isOpen,
  isSaving,
  onSave,
}: PestañaObservacionesProps) => {
  const [observaciones, setObservaciones] = useState(initialObservaciones || '');
  const [recomendaciones, setRecomendaciones] = useState(initialRecomendaciones || '');

  useEffect(() => {
    setObservaciones(initialObservaciones || '');
    setRecomendaciones(initialRecomendaciones || '');
  }, [initialObservaciones, initialRecomendaciones]);

  const hasChanges = () => {
    return observaciones !== (initialObservaciones || '') ||
           recomendaciones !== (initialRecomendaciones || '');
  };

  const handleSave = () => {
    onSave(observaciones || null, recomendaciones || null);
  };

  return (
    <div className="space-y-6">
      {/* Observaciones internas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones internas
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          disabled={!isOpen}
          rows={4}
          placeholder="Notas internas del groomer sobre el servicio (no visible para el cliente)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Estas notas son solo para uso interno del equipo
        </p>
      </div>

      {/* Recomendaciones para el cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recomendaciones para el cliente
        </label>
        <textarea
          value={recomendaciones}
          onChange={(e) => setRecomendaciones(e.target.value)}
          disabled={!isOpen}
          rows={4}
          placeholder="Recomendaciones que verá el cliente en su historial (ej: cepillado semanal, próxima visita en 4 semanas)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Estas recomendaciones serán visibles para el cliente en su historial
        </p>
      </div>

      {/* Botón guardar */}
      {isOpen && hasChanges() && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar observaciones'}
          </button>
        </div>
      )}
    </div>
  );
};