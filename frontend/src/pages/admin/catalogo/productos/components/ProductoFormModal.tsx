// src/pages/admin/catalogo/productos/components/ProductoFormModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PlusIcon, TrashIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline';
import type { Producto, CreateProductoData, CreateVarianteData, Categoria } from '../../../../../services/types/admin';
import { adminCategoriasService } from '../../categorias/services/admin.categorias.service';

interface ProductoFormModalProps {
  isOpen: boolean;
  producto: Producto | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateProductoData) => Promise<boolean>;
}

const initialVariante: CreateVarianteData = {
  nombreVariante: '',
  precio: 0,
  stock: 0,
};

const initialForm: CreateProductoData = {
  idCategoria: 0,
  nombre: '',
  descripcion: '',
  precioBase: 0,
  variantes: [{ ...initialVariante }],
};

export const ProductoFormModal = ({ isOpen, producto, isLoading, onClose, onSave }: ProductoFormModalProps) => {
  const [formData, setFormData] = useState<CreateProductoData>(initialForm);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [varianteErrors, setVarianteErrors] = useState<Record<number, Record<string, string>>>({});

  const isEditing = !!producto;

  // Cargar categorías
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setCargandoCategorias(true);
        const response = await adminCategoriasService.getCategorias('producto', 1);
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
      if (producto) {
        setFormData({
          idCategoria: producto.idCategoria,
          nombre: producto.nombre,
          descripcion: producto.descripcion || '',
          precioBase: producto.precioBase,
          variantes: producto.variantes?.map(v => ({
            nombreVariante: v.nombreVariante,
            precio: v.precio,
            stock: v.stock,
          })) || [{ ...initialVariante }],
        });
      } else {
        setFormData(initialForm);
      }
      setErrors({});
      setVarianteErrors({});
    }
  }, [isOpen, producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (name === 'precioBase' || name === 'idCategoria') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleVarianteChange = (index: number, field: keyof CreateVarianteData, value: string | number) => {
    const updatedVariantes = [...formData.variantes];
    updatedVariantes[index] = { ...updatedVariantes[index], [field]: value };
    setFormData(prev => ({ ...prev, variantes: updatedVariantes }));
    
    if (varianteErrors[index]?.[field]) {
      setVarianteErrors(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: '' }
      }));
    }
  };

  const addVariante = () => {
    setFormData(prev => ({
      ...prev,
      variantes: [...prev.variantes, { ...initialVariante }]
    }));
  };

  const removeVariante = (index: number) => {
    if (formData.variantes.length === 1) {
      setErrors({ variantes: 'Debe tener al menos una variante' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index)
    }));
    setVarianteErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.idCategoria) newErrors.idCategoria = 'Seleccione una categoría';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (formData.precioBase <= 0) newErrors.precioBase = 'El precio base debe ser mayor a 0';
    
    const newVarianteErrors: Record<number, Record<string, string>> = {};
    let hasVarianteErrors = false;
    
    formData.variantes.forEach((variante, idx) => {
      const vErrors: Record<string, string> = {};
      if (!variante.nombreVariante.trim()) vErrors.nombreVariante = 'Requerido';
      if (variante.precio <= 0) vErrors.precio = 'Debe ser mayor a 0';
      if (variante.stock < 0) vErrors.stock = 'No puede ser negativo';
      if (Object.keys(vErrors).length > 0) {
        newVarianteErrors[idx] = vErrors;
        hasVarianteErrors = true;
      }
    });
    
    setErrors(newErrors);
    setVarianteErrors(newVarianteErrors);
    return Object.keys(newErrors).length === 0 && !hasVarianteErrors;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await onSave(formData);
    if (success) onClose();
  };

  if (!isOpen) return null;

  const categoriasProducto = categorias.filter(c => c.tipo === 'producto');

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-xs text-blue-100">Configuración de producto y sus variantes</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Datos básicos */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-gray-400" />
              Datos del Producto
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="idCategoria"
                  value={formData.idCategoria}
                  onChange={handleChange}
                  disabled={cargandoCategorias}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.idCategoria ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="0">Seleccionar categoría</option>
                  {categoriasProducto.map(cat => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.idCategoria && <p className="mt-1 text-xs text-red-500">{errors.idCategoria}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Base <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">Bs.</span>
                  </div>
                  <input
                    type="number"
                    name="precioBase"
                    step="0.01"
                    min="0"
                    value={formData.precioBase}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.precioBase ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.precioBase && <p className="mt-1 text-xs text-red-500">{errors.precioBase}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre del producto"
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del producto (opcional)"
              />
            </div>
          </div>

          {/* Variantes */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                Variantes
              </h3>
              <button
                type="button"
                onClick={addVariante}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <PlusIcon className="h-3 w-3" />
                Agregar variante
              </button>
            </div>
            
            {errors.variantes && <p className="text-xs text-red-500">{errors.variantes}</p>}
            
            <div className="space-y-3">
              {formData.variantes.map((variante, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Variante {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVariante(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={variante.nombreVariante}
                        onChange={(e) => handleVarianteChange(idx, 'nombreVariante', e.target.value)}
                        className={`w-full px-2 py-1.5 text-sm border rounded ${
                          varianteErrors[idx]?.nombreVariante ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {varianteErrors[idx]?.nombreVariante && (
                        <p className="text-xs text-red-500 mt-0.5">{varianteErrors[idx].nombreVariante}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Precio"
                        value={variante.precio}
                        onChange={(e) => handleVarianteChange(idx, 'precio', parseFloat(e.target.value) || 0)}
                        className={`w-full px-2 py-1.5 text-sm border rounded ${
                          varianteErrors[idx]?.precio ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {varianteErrors[idx]?.precio && (
                        <p className="text-xs text-red-500 mt-0.5">{varianteErrors[idx].precio}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Stock"
                        value={variante.stock}
                        onChange={(e) => handleVarianteChange(idx, 'stock', parseInt(e.target.value) || 0)}
                        className={`w-full px-2 py-1.5 text-sm border rounded ${
                          varianteErrors[idx]?.stock ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {varianteErrors[idx]?.stock && (
                        <p className="text-xs text-red-500 mt-0.5">{varianteErrors[idx].stock}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};