// src/pages/cliente/mascotas/components/ModalMascotaForm.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Mascota, CreateMascotaData, RangoPesoCliente } from '../../../../services/types/cliente';

interface ModalMascotaFormProps {
  isOpen: boolean;
  mascota: Mascota | null;
  rangosPeso: RangoPesoCliente[];
  isLoadingRangos: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateMascotaData) => Promise<boolean>;
}

const ESPECIES = [
  { value: 'perro', label: 'Perro', icon: '🐕' },
  { value: 'gato', label: 'Gato', icon: '🐱' },
  { value: 'otro', label: 'Otro', icon: '🐾' },
];

// ✅ Función helper para asegurar que sea array
const ensureArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Si no es JSON válido, intentar separar por comas
      if (value.includes(',')) {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  }
  return [];
};

const initialForm: CreateMascotaData = {
  nombre: '',
  especie: 'perro',
  raza: '',
  tamanio: '',
  pesoKg: 0,
  fechaNacimiento: '',
  temperamento: '',
  alergias: [],
  restricciones: [],
  vacunas: [],
};

const formatRangoPeso = (rango: RangoPesoCliente) => {
  const min = Number(rango.pesoMinKg).toFixed(1).replace('.0', '');
  const max = Number(rango.pesoMaxKg).toFixed(1).replace('.0', '');
  return `${rango.nombre} (${min} - ${max} kg)`;
};

const findRangoByPeso = (rangos: RangoPesoCliente[], pesoKg: number) => {
  return rangos.find((rango) => pesoKg >= Number(rango.pesoMinKg) && pesoKg <= Number(rango.pesoMaxKg));
};

export const ModalMascotaForm = ({
  isOpen,
  mascota,
  rangosPeso,
  isLoadingRangos,
  isLoading,
  onClose,
  onSave,
}: ModalMascotaFormProps) => {
  const [formData, setFormData] = useState<CreateMascotaData>(initialForm);
  const [alergiasInput, setAlergiasInput] = useState('');
  const [restriccionesInput, setRestriccionesInput] = useState('');
  const [vacunasInput, setVacunasInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!mascota;
  const rangoAsignado = findRangoByPeso(rangosPeso, Number(formData.pesoKg));

  useEffect(() => {
    if (isOpen) {
      if (mascota) {
        // ✅ Asegurar que los campos sean arrays antes de usar join
        const alergiasArray = ensureArray(mascota.alergias);
        const restriccionesArray = ensureArray(mascota.restricciones);
        const vacunasArray = ensureArray(mascota.vacunas);

        setFormData({
          nombre: mascota.nombre,
          especie: mascota.especie,
          raza: mascota.raza || '',
          tamanio: mascota.tamanio || '',
          pesoKg: mascota.peso_kg,
          fechaNacimiento: mascota.fecha_nacimiento || '',
          temperamento: mascota.temperamento || '',
          alergias: alergiasArray,
          restricciones: restriccionesArray,
          vacunas: vacunasArray,
        });
        setAlergiasInput(alergiasArray.join(', '));
        setRestriccionesInput(restriccionesArray.join(', '));
        setVacunasInput(vacunasArray.join(', '));
      } else {
        setFormData(initialForm);
        setAlergiasInput('');
        setRestriccionesInput('');
        setVacunasInput('');
      }
      setErrors({});
    }
  }, [isOpen, mascota]);

  useEffect(() => {
    if (!isOpen || !formData.pesoKg || rangosPeso.length === 0) return;

    const rango = findRangoByPeso(rangosPeso, Number(formData.pesoKg));
    if (rango && formData.tamanio !== rango.nombre) {
      setFormData(prev => ({ ...prev, tamanio: rango.nombre }));
    }
  }, [isOpen, formData.pesoKg, formData.tamanio, rangosPeso]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'pesoKg') {
      const pesoKg = Number(value);
      const rango = findRangoByPeso(rangosPeso, pesoKg);
      setFormData(prev => ({ ...prev, pesoKg, tamanio: rango?.nombre || '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'pesoKg' && errors.tamanio) setErrors(prev => ({ ...prev, tamanio: '' }));
  };

  const handleArrayInput = (field: 'alergias' | 'restricciones' | 'vacunas', value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.especie) newErrors.especie = 'La especie es requerida';
    if (!formData.pesoKg || formData.pesoKg <= 0) newErrors.pesoKg = 'El peso debe ser mayor a 0';
    if (formData.pesoKg > 100) newErrors.pesoKg = 'El peso no puede superar los 100 kg';
    if (rangosPeso.length === 0) newErrors.tamanio = 'No hay rangos de peso configurados';
    if (formData.pesoKg > 0 && !findRangoByPeso(rangosPeso, Number(formData.pesoKg))) {
      newErrors.tamanio = 'El peso ingresado no coincide con ningun rango configurado';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    const success = await onSave(formData);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-rose-500">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar Mascota' : 'Agregar Mascota'}
            </h2>
            <p className="text-xs text-pink-100">Completa los datos de tu mascota</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ej: Luna, Max, Simba"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
          </div>

          {/* Especie y Raza */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
              <select
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                {ESPECIES.map(esp => (
                  <option key={esp.value} value={esp.value}>
                    {esp.icon} {esp.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input
                type="text"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Ej: Golden Retriever, Persa"
              />
            </div>
          </div>

          {/* Tamaño y Peso */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
              <select
                name="tamanio"
                value={formData.tamanio}
                onChange={handleChange}
                disabled={isLoadingRangos || rangosPeso.length === 0}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 ${errors.tamanio ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">
                  {isLoadingRangos ? 'Cargando rangos...' : 'Seleccionar tamano'}
                </option>
                {rangosPeso.map(rango => (
                  <option key={rango.idRango} value={rango.nombre}>
                    {formatRangoPeso(rango)}
                  </option>
                ))}
              </select>
              {rangoAsignado && (
                <p className="mt-1 text-xs text-gray-500">
                  Rango para el peso exacto: {formatRangoPeso(rangoAsignado)}
                </p>
              )}
              {errors.tamanio && <p className="mt-1 text-xs text-red-500">{errors.tamanio}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
              <input
                type="number"
                name="pesoKg"
                step="0.1"
                min="0"
                max="100"
                value={formData.pesoKg}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${errors.pesoKg ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.pesoKg && <p className="mt-1 text-xs text-red-500">{errors.pesoKg}</p>}
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Temperamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperamento</label>
            <textarea
              name="temperamento"
              value={formData.temperamento}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder="Ej: Tranquilo, Juguetón, Activo, Tímido..."
            />
          </div>

          {/* Alergias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
            <input
              type="text"
              value={alergiasInput}
              onChange={(e) => {
                setAlergiasInput(e.target.value);
                handleArrayInput('alergias', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder="Separar con comas - Ej: Polen, Alimentos, Ácaros"
            />
            <p className="text-xs text-gray-400 mt-1">Separa cada alergia con una coma</p>
          </div>

          {/* Restricciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restricciones</label>
            <input
              type="text"
              value={restriccionesInput}
              onChange={(e) => {
                setRestriccionesInput(e.target.value);
                handleArrayInput('restricciones', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder="Separar con comas - Ej: No levantar, Evitar corrientes"
            />
          </div>

          {/* Vacunas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vacunas</label>
            <input
              type="text"
              value={vacunasInput}
              onChange={(e) => {
                setVacunasInput(e.target.value);
                handleArrayInput('vacunas', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder="Separar con comas - Ej: Rabia, Parvovirus, Moquillo"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Mascota'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
