// src/pages/admin/catalogo/productos/components/ProductosTable.tsx
import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import type { Producto, VarianteProducto } from '../../../../../services/types/admin';
import { VariantesTable } from './VariantesTable';

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

interface ProductosTableProps {
  productos: Producto[];
  isLoading: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number, nombre: string) => void;
  onToggle: (id: number) => void;
  onCreateVariante: (productoId: number, data: any) => Promise<any>;
  onUpdateVariante: (varianteId: number, data: any) => Promise<any>;
  onDeleteVariante: (varianteId: number) => Promise<boolean>;
  onRefresh: () => void;
}

export const ProductosTable = ({
  productos,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
  onCreateVariante,
  onUpdateVariante,
  onDeleteVariante,
  onRefresh,
}: ProductosTableProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay productos registrados
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Base
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto) => {
              const isExpanded = expandedId === producto.idProducto;
              const hasLowStock = producto.alerta_stock;
              const stockTotal = producto.stock_total || 0;
              // ✅ Convertir precioBase a número
              const precioBaseNum = toNumber(producto.precioBase);
              
              return (
                <>
                  <tr 
                    key={producto.idProducto} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${hasLowStock ? 'bg-red-50' : ''}`}
                    onClick={() => toggleExpand(producto.idProducto)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                          {producto.descripcion && (
                            <div className="text-xs text-gray-500 truncate max-w-md">
                              {producto.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {producto.categoria?.nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <CurrencyDollarIcon className="h-3.5 w-3.5 text-gray-400" />
                        {/* ✅ Usar precioBaseNum en lugar de producto.precioBase */}
                        <span className="text-sm font-medium text-gray-900">
                          Bs. {precioBaseNum.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CubeIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className={`text-sm font-medium ${hasLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                          {stockTotal}
                        </span>
                        {hasLowStock && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" title="Stock bajo" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        producto.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEdit(producto)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onToggle(producto.idProducto)}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title={producto.activo ? 'Desactivar' : 'Activar'}
                        >
                          {producto.activo ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onDelete(producto.idProducto, producto.nombre)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Fila expandida con variantes */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Variantes de "{producto.nombre}"
                          </h4>
                          <VariantesTable
                            variantes={producto.variantes || []}
                            productoId={producto.idProducto}
                            productoNombre={producto.nombre}
                            onCrearVariante={onCreateVariante}
                            onActualizarVariante={onUpdateVariante}
                            onEliminarVariante={onDeleteVariante}
                            onRefresh={onRefresh}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};