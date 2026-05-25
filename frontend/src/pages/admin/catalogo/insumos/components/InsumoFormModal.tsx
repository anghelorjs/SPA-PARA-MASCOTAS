// src/pages/admin/catalogo/insumos/components/InsumoFormModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, CubeIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline';
import type { Insumo, CreateInsumoData, Categoria } from '../../../../../services/types/admin';
import { adminCategoriasService } from '../../categorias/services/admin.categorias.service';

interface InsumoFormModalProps {
  isOpen: boolean;
  insumo: Insumo | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateInsumoData) => Promise<boolean>;
}

// ✅ Función helper para convertir a número
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const initialForm: CreateInsumoData = {
  idCategoria: 0,
  nombre: '',
  unidadMedida: '',
  stockActual: 0,
  stockMinimo: 0,
  costoUnitario: 0,
};

const UNIDADES_MEDIDA = [
  'Unidad', 'Kilogramo', 'Gramo', 'Litro', 'Mililitro', 
  'Metro', 'Centímetro', 'Caja', 'Paquete', 'Bolsa', 'Frasco'
];

export const InsumoFormModal = ({ isOpen, insumo, isLoading, onClose, onSave }: InsumoFormModalProps) => {
  const [formData, setFormData] = useState<CreateInsumoData>(initialForm);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!insumo;

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setCargandoCategorias(true);
        const response = await adminCategoriasService.getCategorias('insumo', 1);
        setCategorias(response.data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setCargandoCategorias(false);
      }
    };
    if (isOpen) {
      loadCategorias();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (insumo) {
        setFormData({
          idCategoria: insumo.idCategoria,
          nombre: insumo.nombre,
          unidadMedida: insumo.unidadMedida,
          stockActual: toNumber(insumo.stockActual),
          stockMinimo: toNumber(insumo.stockMinimo),
          costoUnitario: toNumber(insumo.costoUnitario),
        });
      } else {
        setFormData(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, insumo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (name === 'stockActual' || name === 'stockMinimo' || name === 'costoUnitario') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.idCategoria) newErrors.idCategoria = 'Seleccione una categoría';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.unidadMedida) newErrors.unidadMedida = 'Seleccione una unidad de medida';
    if (formData.stockActual < 0) newErrors.stockActual = 'El stock no puede ser negativo';
    if (formData.stockMinimo < 0) newErrors.stockMinimo = 'El stock mínimo no puede ser negativo';
    if (formData.costoUnitario <= 0) newErrors.costoUnitario = 'El costo unitario debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await onSave(formData);
    if (success) onClose();
  };

  const categoriasInsumo = categorias.filter(c => c.tipo === 'insumo');

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-teal-600">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar Insumo' : 'Nuevo Insumo'}
            </h2>
            <p className="text-xs text-green-100">Gestión de insumos para grooming</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              name="idCategoria"
              value={formData.idCategoria}
              onChange={handleChange}
              disabled={cargandoCategorias}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.idCategoria ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="0">Seleccionar categoría</option>
              {categoriasInsumo.map(cat => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.idCategoria && <p className="mt-1 text-xs text-red-500">{errors.idCategoria}</p>}
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Shampoo, Cepillo, Tijeras"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
          </div>

          {/* Unidad de Medida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidad de Medida <span className="text-red-500">*</span>
            </label>
            <select
              name="unidadMedida"
              value={formData.unidadMedida}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.unidadMedida ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar unidad</option>
              {UNIDADES_MEDIDA.map(unidad => (
                <option key={unidad} value={unidad}>{unidad}</option>
              ))}
            </select>
            {errors.unidadMedida && <p className="mt-1 text-xs text-red-500">{errors.unidadMedida}</p>}
          </div>

          {/* Stock Actual y Stock Mínimo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Actual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CubeIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="stockActual"
                  step="0.01"
                  min="0"
                  value={formData.stockActual}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.stockActual ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.stockActual && <p className="mt-1 text-xs text-red-500">{errors.stockActual}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stockMinimo"
                step="0.01"
                min="0"
                value={formData.stockMinimo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.stockMinimo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.stockMinimo && <p className="mt-1 text-xs text-red-500">{errors.stockMinimo}</p>}
            </div>
          </div>

          {/* Costo Unitario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo Unitario (Bs.) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">Bs.</span>
              </div>
              <input
                type="number"
                name="costoUnitario"
                step="0.01"
                min="0"
                value={formData.costoUnitario}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.costoUnitario ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.costoUnitario && <p className="mt-1 text-xs text-red-500">{errors.costoUnitario}</p>}
          </div>

          {/* Preview de nivel de stock */}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Vista previa de stock:</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Stock actual</span>
                  <span>{formData.stockActual} / {formData.stockMinimo}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      formData.stockActual <= formData.stockMinimo ? 'bg-red-500' : 
                      formData.stockActual <= formData.stockMinimo * 2 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((formData.stockActual / (formData.stockMinimo || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                formData.stockActual <= formData.stockMinimo ? 'bg-red-100 text-red-700' :
                formData.stockActual <= formData.stockMinimo * 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {formData.stockActual <= formData.stockMinimo ? 'Stock crítico' :
                 formData.stockActual <= formData.stockMinimo * 2 ? 'Stock medio' : 'Stock óptimo'}
              </span>
            </div>
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Insumo'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};