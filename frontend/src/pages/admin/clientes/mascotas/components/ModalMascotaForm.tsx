// src/pages/admin/clientes/mascotas/components/ModalMascotaForm.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  HeartIcon, 
  ScaleIcon, 
  CakeIcon, 
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import type { MascotaAdmin, CreateMascotaAdminData } from '../../../../../services/types/admin';
import { adminClientesService } from '../../clientes/services/admin.clientes.service';

interface ModalMascotaFormProps {
  isOpen: boolean;
  mascota: MascotaAdmin | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateMascotaAdminData) => Promise<boolean>;
}

const ESPECIES = [
  { value: 'perro', label: 'Perro', icon: <HeartIcon className="h-4 w-4" /> },
  { value: 'gato', label: 'Gato', icon: <HeartIcon className="h-4 w-4" /> },
  { value: 'otro', label: 'Otro', icon: <HeartIcon className="h-4 w-4" /> },
];

const TAMANIOS = [
  { value: 'Toy', label: 'Toy' },
  { value: 'Pequeño', label: 'Pequeño' },
  { value: 'Mediano', label: 'Mediano' },
  { value: 'Grande', label: 'Grande' },
  { value: 'Gigante', label: 'Gigante' },
];

const initialForm: CreateMascotaAdminData = {
  idCliente: 0,
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

// ✅ Función para asegurar que sea array
const ensureArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export const ModalMascotaForm = ({ isOpen, mascota, isLoading, onClose, onSave }: ModalMascotaFormProps) => {
  const [formData, setFormData] = useState<CreateMascotaAdminData>(initialForm);
  const [clientes, setClientes] = useState<any[]>([]);
  const [buscandoClientes, setBuscandoClientes] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alergiasInput, setAlergiasInput] = useState('');
  const [restriccionesInput, setRestriccionesInput] = useState('');
  const [vacunasInput, setVacunasInput] = useState('');

  const isEditing = !!mascota;

  // Cargar clientes para el selector
  useEffect(() => {
    const loadClientes = async () => {
      try {
        setBuscandoClientes(true);
        const response = await adminClientesService.getClientes({ page: 1 });
        setClientes(response.data);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setBuscandoClientes(false);
      }
    };
    if (isOpen) {
      loadClientes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (mascota) {
        // ✅ Usar ensureArray para los campos que pueden ser array o null
        const alergiasArray = ensureArray(mascota.alergias);
        const restriccionesArray = ensureArray(mascota.restricciones);
        const vacunasArray = ensureArray(mascota.vacunas);

        setFormData({
          idCliente: mascota.idCliente,
          nombre: mascota.nombre,
          especie: mascota.especie,
          raza: mascota.raza || '',
          tamanio: mascota.tamanio || '',
          pesoKg: mascota.pesoKg,
          fechaNacimiento: mascota.fechaNacimiento || mascota.fecha_nacimiento || '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleArrayInput = (field: 'alergias' | 'restricciones' | 'vacunas', value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const pesoKg = Number(formData.pesoKg ?? 0);
    if (!formData.idCliente) newErrors.idCliente = 'Seleccione un dueño';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.especie) newErrors.especie = 'La especie es requerida';
    if (!pesoKg || pesoKg <= 0) newErrors.pesoKg = 'El peso debe ser mayor a 0';
    if (pesoKg > 100) newErrors.pesoKg = 'El peso no puede superar los 100 kg';
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-600 to-rose-600">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar Mascota' : 'Nueva Mascota'}
            </h2>
            <p className="text-xs text-pink-100">Datos de la mascota</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Dueño */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dueño <span className="text-red-500">*</span>
            </label>
            <select
              name="idCliente"
              value={formData.idCliente}
              onChange={handleChange}
              disabled={buscandoClientes}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${
                errors.idCliente ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="0">Seleccionar dueño</option>
              {clientes.map(cli => (
                <option key={cli.idCliente} value={cli.idCliente}>
                  {cli.user.nombre} {cli.user.apellido} - {cli.user.email}
                </option>
              ))}
            </select>
            {errors.idCliente && <p className="mt-1 text-xs text-red-500">{errors.idCliente}</p>}
          </div>

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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Luna, Max, Simba"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
          </div>

          {/* Especie y Raza */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especie <span className="text-red-500">*</span>
              </label>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Seleccionar tamaño</option>
                {TAMANIOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ScaleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="pesoKg"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.pesoKg}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${
                    errors.pesoKg ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5.0"
                />
              </div>
              {errors.pesoKg && <p className="mt-1 text-xs text-red-500">{errors.pesoKg}</p>}
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <div className="relative">
              <CakeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Temperamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperamento</label>
            <div className="relative">
              <FaceSmileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <textarea
                name="temperamento"
                value={formData.temperamento}
                onChange={handleChange}
                rows={2}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Ej: Tranquilo, Juguetón, Activo, Tímido..."
              />
            </div>
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
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Mascota'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
