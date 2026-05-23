/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/admin/agenda/components/ModalRangoPeso.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { RangoPeso, CreateRangoPesoData } from '../types';
import { adminAgendaService } from '../services/admin.agenda.service';
import { useToast } from '../../../../hooks/useToast';

interface ModalRangoPesoProps {
  isOpen: boolean;
  rango: RangoPeso | null;
  onClose: () => void;
  onSuccess: () => void;
}

const initialForm: CreateRangoPesoData = {
  nombre: '',
  pesoMinKg: 0,
  pesoMaxKg: 0,
  factorTiempo: 1,
  factorPrecio: 1,
};

export const ModalRangoPeso = ({ isOpen, rango, onClose, onSuccess }: ModalRangoPesoProps) => {
  const [formData, setFormData] = useState<CreateRangoPesoData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const isEditing = !!rango;

  useEffect(() => {
    if (isOpen) {
      if (rango) {
        setFormData({
          nombre: rango.nombre,
          pesoMinKg: rango.pesoMinKg,
          pesoMaxKg: rango.pesoMaxKg,
          factorTiempo: rango.factorTiempo,
          factorPrecio: rango.factorPrecio,
        });
      } else {
        setFormData(initialForm);
      }
    }
  }, [isOpen, rango]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Kg') || name.includes('factor') ? parseFloat(value) || 0 : value,
    }));
  };

  const validate = () => {
    if (!formData.nombre.trim()) {
      showToast('El nombre es requerido', 'error');
      return false;
    }
    if (formData.pesoMinKg >= formData.pesoMaxKg) {
      showToast('El peso mínimo debe ser menor que el peso máximo', 'error');
      return false;
    }
    if (formData.factorTiempo < 0.5 || formData.factorTiempo > 3) {
      showToast('El factor tiempo debe estar entre 0.5 y 3', 'error');
      return false;
    }
    if (formData.factorPrecio < 0.5 || formData.factorPrecio > 3) {
      showToast('El factor precio debe estar entre 0.5 y 3', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && rango) {
        await adminAgendaService.updateRangoPeso(rango.idRango, formData);
        showToast('Rango actualizado correctamente', 'success');
      } else {
        await adminAgendaService.createRangoPeso(formData);
        showToast('Rango creado correctamente', 'success');
      }
      onSuccess();
      onClose();
    } catch {
      showToast('Error al guardar rango', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-indigo-600 text-white">
          <h3 className="text-lg font-semibold">{isEditing ? 'Editar Rango' : 'Nuevo Rango de Peso'}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Pequeño, Mediano, Grande"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso mínimo (kg) *</label>
              <input
                type="number"
                name="pesoMinKg"
                min="0"
                step="0.1"
                value={formData.pesoMinKg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso máximo (kg) *</label>
              <input
                type="number"
                name="pesoMaxKg"
                min="0"
                step="0.1"
                value={formData.pesoMaxKg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factor Tiempo</label>
              <input
                type="number"
                name="factorTiempo"
                min="0.5"
                max="3"
                step="0.1"
                value={formData.factorTiempo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Multiplica la duración base del servicio</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factor Precio</label>
              <input
                type="number"
                name="factorPrecio"
                min="0.5"
                max="3"
                step="0.1"
                value={formData.factorPrecio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Multiplica el precio base del servicio</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
