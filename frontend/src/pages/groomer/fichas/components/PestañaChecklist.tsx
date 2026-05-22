// src/pages/groomer/fichas/components/PestañaChecklist.tsx
import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import type { ChecklistItem } from '../types';

interface PestañaChecklistProps {
  checklist: ChecklistItem[];
  isOpen: boolean;
  isSaving: boolean;
  onSave: (checklist: { nombre: string; completado: boolean; observacion?: string }[]) => void;
}

const CHECKLIST_ICONS: Record<string, string> = {
  'Baño': '🛁',
  'Corte': '✂️',
  'Uñas': '🔪',
  'Oídos': '👂',
  'Glándulas': '🩺',
  'Perfume': '🌸',
};

export const PestañaChecklist = ({
  checklist: initialChecklist,
  isOpen,
  isSaving,
  onSave,
}: PestañaChecklistProps) => {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});

  useEffect(() => {
    setChecklist(initialChecklist);
    const obs: Record<number, string> = {};
    initialChecklist.forEach((item) => {
      if (item.observacion) obs[item.id] = item.observacion;
    });
    setObservaciones(obs);
  }, [initialChecklist]);

  const completados = checklist.filter((item) => item.completado).length;
  const total = checklist.length;
  const progreso = Math.round((completados / total) * 100);
  const puedeCerrar = completados >= 5;

  const toggleCompletado = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completado: !item.completado } : item
      )
    );
  };

  const updateObservacion = (id: number, value: string) => {
    setObservaciones((prev) => ({ ...prev, [id]: value }));
  };

  const hasChanges = () => {
    for (const item of checklist) {
      const original = initialChecklist.find((i) => i.id === item.id);
      if (original && original.completado !== item.completado) return true;
      if ((original?.observacion || '') !== (observaciones[item.id] || '')) return true;
    }
    return false;
  };

  const handleSave = () => {
    const updatedChecklist = checklist.map((item) => ({
      nombre: item.nombre,
      completado: item.completado,
      observacion: observaciones[item.id] || undefined,
    }));
    onSave(updatedChecklist);
  };

  return (
    <div className="space-y-6">
      {/* Progreso */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progreso: {completados} de {total} completados
          </span>
          <span className="text-sm font-semibold text-blue-600">{progreso}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 rounded-full h-2 transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
        {!puedeCerrar && isOpen && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ Necesitas al menos 5 items completados para poder cerrar la ficha
          </p>
        )}
      </div>

      {/* Lista de checklist */}
      <div className="space-y-4">
        {checklist.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={item.completado}
                  onChange={() => toggleCompletado(item.id)}
                  disabled={!isOpen}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <span className="text-base mr-2">{CHECKLIST_ICONS[item.nombre] || '✓'}</span>
                  <span className={`font-medium ${item.completado ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                    {item.nombre}
                  </span>
                </div>
              </label>
              {item.completado && (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              )}
            </div>
            
            {/* Observación del item */}
            {isOpen && (
              <div className="mt-2 ml-8">
                <input
                  type="text"
                  value={observaciones[item.id] || ''}
                  onChange={(e) => updateObservacion(item.id, e.target.value)}
                  placeholder="Observación (opcional)"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            {!isOpen && observaciones[item.id] && (
              <div className="mt-2 ml-8 text-sm text-gray-500">
                <span className="text-xs text-gray-400">Observación:</span> {observaciones[item.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón guardar */}
      {isOpen && hasChanges() && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar checklist'}
          </button>
        </div>
      )}
    </div>
  );
};
