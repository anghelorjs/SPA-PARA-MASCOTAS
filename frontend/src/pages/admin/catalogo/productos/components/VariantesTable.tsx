// src/pages/admin/catalogo/productos/components/VariantesTable.tsx
import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, CurrencyDollarIcon, CubeIcon } from '@heroicons/react/24/outline';
import type { VarianteProducto } from '../../../../../services/types/admin';
import { VarianteFormModal } from './VarianteFormModal';

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

interface VariantesTableProps {
  variantes: VarianteProducto[];
  productoId: number;
  productoNombre: string;
  isLoading?: boolean;
  onCrearVariante: (productoId: number, data: any) => Promise<any>;
  onActualizarVariante: (varianteId: number, data: any) => Promise<any>;
  onEliminarVariante: (varianteId: number) => Promise<boolean>;
  onRefresh: () => void;
}

export const VariantesTable = ({
  variantes,
  productoId,
  productoNombre,
  isLoading,
  onCrearVariante,
  onActualizarVariante,
  onEliminarVariante,
  onRefresh,
}: VariantesTableProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [varianteEditando, setVarianteEditando] = useState<VarianteProducto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNuevaVariante = () => {
    setVarianteEditando(null);
    setModalOpen(true);
  };

  const handleEditarVariante = (variante: VarianteProducto) => {
    setVarianteEditando(variante);
    setModalOpen(true);
  };

  const handleEliminarVariante = async (varianteId: number) => {
    await onEliminarVariante(varianteId);
  };

  const handleSaveVariante = async (data: any): Promise<boolean> => {
    setIsSubmitting(true);
    let success = false;
    
    if (varianteEditando) {
      const result = await onActualizarVariante(varianteEditando.idVariante, data);
      success = !!result;
    } else {
      const result = await onCrearVariante(productoId, data);
      success = !!result;
    }
    
    setIsSubmitting(false);
    if (success) {
      setModalOpen(false);
      onRefresh();
    }
    return success;
  };

  // ✅ Convertir valores a número para cálculos
  const stockTotal = variantes.reduce((sum, v) => sum + toNumber(v.stock), 0);
  const precios = variantes.map(v => toNumber(v.precio));
  const precioMinimo = Math.min(...precios);
  const precioMaximo = Math.max(...precios);

  return (
    <div className="space-y-3">
      {/* Resumen de variantes */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CubeIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Stock total:</span>
            <span className="font-semibold text-gray-800">{stockTotal}</span>
          </div>
          <div className="flex items-center gap-1">
            <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Precio desde:</span>
            <span className="font-semibold text-gray-800">
              Bs. {precioMinimo.toFixed(2)}
              {precioMaximo !== precioMinimo && ` - Bs. ${precioMaximo.toFixed(2)}`}
            </span>
          </div>
        </div>
        <button
          onClick={handleNuevaVariante}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Agregar Variante
        </button>
      </div>

      {/* Tabla de variantes */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variante</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estado Stock</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variantes.map((variante) => {
              const stock = toNumber(variante.stock);
              const precio = toNumber(variante.precio);
              const isLowStock = stock <= 5;
              const stockStatus = isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
              const stockText = isLowStock ? 'Stock bajo' : 'Stock normal';
              
              return (
                <tr key={variante.idVariante} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">
                    {variante.nombreVariante}
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-700">
                    Bs. {precio.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-medium text-gray-700">
                    {stock}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${stockStatus}`}>
                      {stockText}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEditarVariante(variante)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar variante"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarVariante(variante.idVariante)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar variante"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal para variante */}
      <VarianteFormModal
        isOpen={modalOpen}
        variante={varianteEditando}
        productoNombre={productoNombre}
        isLoading={isSubmitting}
        onClose={() => {
          setModalOpen(false);
          setVarianteEditando(null);
        }}
        onSave={handleSaveVariante}
      />
    </div>
  );
};