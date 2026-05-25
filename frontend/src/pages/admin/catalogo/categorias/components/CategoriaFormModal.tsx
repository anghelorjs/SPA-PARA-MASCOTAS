// src/pages/admin/catalogo/categorias/components/CategoriaFormModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, CubeIcon, BeakerIcon } from '@heroicons/react/24/outline';
import type { Categoria, CreateCategoriaData } from '../../../../../services/types/admin';

interface CategoriaFormModalProps {
  isOpen: boolean;
  categoria: Categoria | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateCategoriaData) => Promise<boolean>;
}

const TIPOS = [
  { value: 'producto', label: 'Producto', icon: <CubeIcon className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
  { value: 'insumo', label: 'Insumo', icon: <BeakerIcon className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
];

const initialForm: CreateCategoriaData = {
  nombre: '',
  tipo: 'producto',
  descripcion: '',
};

export const CategoriaFormModal = ({ isOpen, categoria, isLoading, onClose, onSave }: CategoriaFormModalProps) => {
  const [formData, setFormData] = useState<CreateCategoriaData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!categoria;

  useEffect(() => {
    if (isOpen) {
      if (categoria) {
        setFormData({
          nombre: categoria.nombre,
          tipo: categoria.tipo,
          descripcion: categoria.descripcion || '',
        });
      } else {
        setFormData(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, categoria]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.tipo) newErrors.tipo = 'El tipo es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await onSave(formData);
    if (success) onClose();
  };

  const selectedTipo = TIPOS.find(t => t.value === formData.tipo);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <p className="text-xs text-blue-100">Configuración de categorías</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Alimentos, Accesorios, Medicamentos"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.value as 'producto' | 'insumo' }))}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    formData.tipo === tipo.value
                      ? `${tipo.color} border-transparent ring-2 ring-blue-500`
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tipo.icon}
                  <span className="text-sm font-medium">{tipo.label}</span>
                </button>
              ))}
            </div>
            {errors.tipo && <p className="mt-1 text-xs text-red-500">{errors.tipo}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción opcional de la categoría..."
            />
          </div>

          {/* Preview del tipo seleccionado */}
          {selectedTipo && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${selectedTipo.color}`}>
                  {selectedTipo.icon}
                  {selectedTipo.label}
                </span>
                <span className="text-sm text-gray-600">{formData.nombre || 'Nueva categoría'}</span>
              </div>
            </div>
          )}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Categoría'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};