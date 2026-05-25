// src/pages/admin/catalogo/productos/components/VarianteFormModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, CurrencyDollarIcon, CubeIcon } from '@heroicons/react/24/outline';
import type { VarianteProducto, CreateVarianteData } from '../../../../../services/types/admin';

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

interface VarianteFormModalProps {
  isOpen: boolean;
  variante: VarianteProducto | null;
  productoNombre: string;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateVarianteData) => Promise<boolean>;
}

const initialForm: CreateVarianteData = {
  nombreVariante: '',
  precio: 0,
  stock: 0,
};

export const VarianteFormModal = ({ 
  isOpen, 
  variante, 
  productoNombre, 
  isLoading, 
  onClose, 
  onSave 
}: VarianteFormModalProps) => {
  const [formData, setFormData] = useState<CreateVarianteData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!variante;

  useEffect(() => {
    if (isOpen) {
      if (variante) {
        setFormData({
          nombreVariante: variante.nombreVariante,
          precio: toNumber(variante.precio),
          stock: toNumber(variante.stock),
        });
      } else {
        setFormData(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, variante]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (name === 'precio' || name === 'stock') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombreVariante.trim()) newErrors.nombreVariante = 'El nombre es requerido';
    if (toNumber(formData.precio) <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (toNumber(formData.stock) < 0) newErrors.stock = 'El stock no puede ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await onSave(formData);
    if (success) onClose();
  };

  // ✅ Valores numéricos para mostrar
  const precioNum = toNumber(formData.precio);
  const stockNum = toNumber(formData.stock);

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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar Variante' : 'Nueva Variante'}
            </h2>
            <p className="text-xs text-blue-100">
              Producto: {productoNombre}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Nombre de variante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la variante <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombreVariante"
              value={formData.nombreVariante}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.nombreVariante ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 1kg, 500ml, Grande, Premium"
            />
            {errors.nombreVariante && <p className="mt-1 text-xs text-red-500">{errors.nombreVariante}</p>}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Bs.</span>
              </div>
              <input
                type="number"
                name="precio"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.precio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.precio && <p className="mt-1 text-xs text-red-500">{errors.precio}</p>}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock inicial <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CubeIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                name="stock"
                step="1"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
            </div>
            {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
            <p className="text-xs text-gray-400 mt-1">Cantidad disponible en inventario</p>
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                {formData.nombreVariante || 'Nueva variante'}
              </span>
              {/* ✅ Usar precioNum en lugar de formData.precio */}
              <span className="text-sm font-semibold text-green-600">
                Bs. {precioNum.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">Stock: {stockNum}</span>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Variante'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};