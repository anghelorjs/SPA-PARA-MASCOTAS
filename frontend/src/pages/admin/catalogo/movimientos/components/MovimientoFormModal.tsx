// src/pages/admin/catalogo/movimientos/components/MovimientoFormModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { CreateMovimientoData, ProductoMovimiento } from '../../../../../services/types/admin';
import { adminMovimientosService } from '../services/admin.movimientos.service';

interface MovimientoFormModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateMovimientoData) => Promise<boolean>;
}

const TIPOS_MOVIMIENTO = [
  { id: 'entrada', label: 'Entrada', description: 'Agregar stock al inventario' },
  { id: 'salida', label: 'Salida', description: 'Retirar stock del inventario' },
  { id: 'ajuste', label: 'Ajuste', description: 'Corregir stock manualmente' },
];

const initialForm: CreateMovimientoData = {
  idProducto: 0,
  tipoMovimiento: 'entrada',
  cantidad: 0,
  variante_id: 0,
  motivo: '',
};

export const MovimientoFormModal = ({ isOpen, isLoading, onClose, onSave }: MovimientoFormModalProps) => {
  const [formData, setFormData] = useState<CreateMovimientoData>(initialForm);
  const [productos, setProductos] = useState<ProductoMovimiento[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [buscandoProductos, setBuscandoProductos] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setBusquedaProducto('');
      setProductos([]);
      setErrors({});
    }
  }, [isOpen]);

  // Buscar productos
  useEffect(() => {
    const searchProducts = async () => {
      if (busquedaProducto.length < 2) {
        setProductos([]);
        return;
      }

      try {
        setBuscandoProductos(true);
        const results = await adminMovimientosService.getProductosList(busquedaProducto);
        setProductos(results);
        setMostrarResultados(true);
      } catch (error) {
        console.error('Error al buscar productos:', error);
      } finally {
        setBuscandoProductos(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [busquedaProducto]);

  const handleSelectProducto = (producto: ProductoMovimiento) => {
    setFormData(prev => ({ 
      ...prev, 
      idProducto: producto.id,
      variante_id: producto.variantes[0]?.id || 0
    }));
    setBusquedaProducto(producto.nombre);
    setMostrarResultados(false);
    if (errors.idProducto) setErrors(prev => ({ ...prev, idProducto: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (name === 'cantidad') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleVarianteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const varianteId = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, variante_id: varianteId }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.idProducto) newErrors.idProducto = 'Seleccione un producto';
    if (!formData.cantidad || formData.cantidad <= 0) newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    if (!formData.motivo.trim()) newErrors.motivo = 'El motivo es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await onSave(formData);
    if (success) onClose();
  };

  const selectedProducto = productos.find(p => p.id === formData.idProducto);
  const variantes = selectedProducto?.variantes || [];

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
            <h2 className="text-lg font-semibold text-white">Registrar Movimiento</h2>
            <p className="text-xs text-blue-100">Entrada / Salida / Ajuste de stock</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Producto - Buscador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.idProducto ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {mostrarResultados && productos.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {buscandoProductos ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Buscando...
                    </div>
                  ) : (
                    productos.map((producto) => (
                      <button
                        key={producto.id}
                        onClick={() => handleSelectProducto(producto)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="font-medium text-gray-800">{producto.nombre}</div>
                        <div className="text-xs text-gray-500">
                          {producto.variantes.length} variante(s)
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.idProducto && <p className="mt-1 text-xs text-red-500">{errors.idProducto}</p>}
          </div>

          {/* Variante (si el producto tiene múltiples variantes) */}
          {variantes.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variante
              </label>
              <select
                value={formData.variante_id}
                onChange={handleVarianteChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {variantes.map((variante) => (
                  <option key={variante.id} value={variante.id}>
                    {variante.nombre} (Stock actual: {variante.stock_actual})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de movimiento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS_MOVIMIENTO.map((tipo) => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipoMovimiento: tipo.id as any }))}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    formData.tipoMovimiento === tipo.id
                      ? tipo.id === 'entrada'
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : tipo.id === 'salida'
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-yellow-100 border-yellow-500 text-yellow-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cantidad"
              step={formData.tipoMovimiento === 'ajuste' ? '1' : '0.01'}
              min="0.01"
              value={formData.cantidad}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.cantidad ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.tipoMovimiento === 'entrada' ? 'Cantidad a agregar' : 'Nueva cantidad'}
            />
            {errors.cantidad && <p className="mt-1 text-xs text-red-500">{errors.cantidad}</p>}
            {formData.tipoMovimiento === 'ajuste' && (
              <p className="text-xs text-gray-400 mt-1">
                El stock se establecerá exactamente a esta cantidad
              </p>
            )}
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
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.motivo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Compra a proveedor, Ajuste por inventario, Devolución de cliente, Merma, etc."
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
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {isLoading ? 'Registrando...' : 'Registrar Movimiento'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};