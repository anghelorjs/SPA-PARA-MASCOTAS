// src/pages/admin/catalogo/insumos/components/AjustarStockModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PlusIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { Insumo, AjustarStockData } from '../../../../../services/types/admin';

interface AjustarStockModalProps {
  isOpen: boolean;
  insumo: Insumo | null;
  isLoading: boolean;
  onClose: () => void;
  onAjustar: (data: AjustarStockData) => Promise<boolean>;
}

const initialForm: AjustarStockData = {
  tipo: 'entrada',
  cantidad: 0,
  motivo: '',
};

export const AjustarStockModal = ({ isOpen, insumo, isLoading, onClose, onAjustar }: AjustarStockModalProps) => {
  const [formData, setFormData] = useState<AjustarStockData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (name === 'cantidad') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }
    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await onAjustar(formData);
    if (success) onClose();
  };

  if (!isOpen || !insumo) return null;

  const stockActual = typeof insumo.stockActual === 'number' ? insumo.stockActual : parseFloat(insumo.stockActual as any) || 0;
  const stockMinimo = typeof insumo.stockMinimo === 'number' ? insumo.stockMinimo : parseFloat(insumo.stockMinimo as any) || 0;
  const nuevaCantidad = formData.tipo === 'entrada' 
    ? stockActual + formData.cantidad 
    : formData.cantidad;

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-500 to-orange-500">
          <div>
            <h2 className="text-lg font-semibold text-white">Ajustar Stock</h2>
            <p className="text-xs text-yellow-100">{insumo.nombre}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Stock actual */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Stock actual</p>
            <p className="text-xl font-bold text-gray-800">
              {stockActual} {insumo.unidadMedida}
            </p>
            {stockActual <= stockMinimo && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Stock por debajo del mínimo ({stockMinimo} {insumo.unidadMedida})
              </p>
            )}
          </div>

          {/* Tipo de ajuste */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de ajuste
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: 'entrada' }))}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  formData.tipo === 'entrada'
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <PlusIcon className="h-4 w-4" />
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: 'ajuste' }))}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  formData.tipo === 'ajuste'
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <PencilIcon className="h-4 w-4" />
                Ajuste directo
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.tipo === 'entrada' ? 'Cantidad a agregar' : 'Nuevo stock'}
            </label>
            <input
              type="number"
              name="cantidad"
              step="0.01"
              min="0.01"
              value={formData.cantidad}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 ${
                errors.cantidad ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.tipo === 'entrada' ? '0.00' : '0'}
            />
            {errors.cantidad && <p className="mt-1 text-xs text-red-500">{errors.cantidad}</p>}
          </div>

          {/* Vista previa del nuevo stock */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Nuevo stock después del ajuste</p>
            <p className="text-lg font-bold text-gray-800">
              {nuevaCantidad.toFixed(2)} {insumo.unidadMedida}
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 ${
                errors.motivo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Compra a proveedor, Ajuste por inventario físico, Devolución, etc."
            />
            {errors.motivo && <p className="mt-1 text-xs text-red-500">{errors.motivo}</p>}
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
            className="flex items-center gap-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {isLoading ? 'Procesando...' : 'Confirmar Ajuste'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};