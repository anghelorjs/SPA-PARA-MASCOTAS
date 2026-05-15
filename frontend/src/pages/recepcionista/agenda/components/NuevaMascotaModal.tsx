// src/pages/recepcionista/agenda/components/NuevaMascotaModal.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { recepcionistaClienteService } from '../../clientes/services/recepcionista.clientes.service';
import type { MascotaData } from '../services/recepcionista.agenda.service';
import { useToast } from '../../../../hooks/useToast';

interface MascotaCreadaResponse {
  idMascota: number;
  nombre: string;
  especie: string;
  raza?: string | null;
  pesoKg: number;
  rangoPeso?: { nombre: string } | null;
  temperamento?: string | null;
}

interface NuevaMascotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: number;
  onMascotaCreada: (mascota: MascotaData) => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
};

const initialForm = {
  nombre: '',
  especie: 'perro',
  raza: '',
  pesoKg: '',
  fechaNacimiento: '',
  temperamento: '',
  alergias: '',
  vacunas: '',
};

export const NuevaMascotaModal = ({ isOpen, onClose, clienteId, onMascotaCreada }: NuevaMascotaModalProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.especie) newErrors.especie = 'La especie es requerida';
    if (!formData.pesoKg) newErrors.pesoKg = 'El peso es requerido';
    else if (isNaN(parseFloat(formData.pesoKg)) || parseFloat(formData.pesoKg) <= 0)
      newErrors.pesoKg = 'Ingresa un peso válido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setFormData(initialForm);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const alergiasArray = formData.alergias
        ? formData.alergias.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const vacunasArray = formData.vacunas
        ? formData.vacunas.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const response = await recepcionistaClienteService.createMascota({
        idCliente: clienteId,
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza || undefined,
        pesoKg: parseFloat(formData.pesoKg),
        fechaNacimiento: formData.fechaNacimiento || undefined,
        temperamento: formData.temperamento || undefined,
        alergias: alergiasArray,
        vacunas: vacunasArray,
      }) as MascotaCreadaResponse;

      showToast('Mascota creada exitosamente', 'success');
      onMascotaCreada({
        id: response.idMascota,
        nombre: response.nombre,
        especie: response.especie,
        raza: response.raza || '',
        peso_kg: response.pesoKg,
        rango_nombre: response.rangoPeso?.nombre || null,
        temperamento: response.temperamento || null,
      });
      handleClose();
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al crear mascota'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Nueva Mascota</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>

          {/* Especie + Raza */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especie <span className="text-red-500">*</span>
              </label>
              <select
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input
                type="text"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Peso + Fecha nacimiento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                name="pesoKg"
                value={formData.pesoKg}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pesoKg ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pesoKg && <p className="text-xs text-red-500 mt-1">{errors.pesoKg}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Temperamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperamento</label>
            <input
              type="text"
              name="temperamento"
              value={formData.temperamento}
              onChange={handleChange}
              placeholder="Ej: Tranquilo, Juguetón, Activo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Alergias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
            <input
              type="text"
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              placeholder="Separar con comas (ej: Polen, Alimentos)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vacunas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vacunas</label>
            <input
              type="text"
              name="vacunas"
              value={formData.vacunas}
              onChange={handleChange}
              placeholder="Separar con comas (ej: Rabia, Parvovirus)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? 'Creando...' : 'Crear Mascota'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};