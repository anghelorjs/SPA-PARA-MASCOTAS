// src/pages/cliente/catalogo/components/ProductoCard.tsx
import { useState } from 'react';
import { ShoppingCartIcon, CurrencyDollarIcon, CubeIcon, TagIcon } from '@heroicons/react/24/outline';
import type { ProductoCatalogo, VarianteCatalogo } from '../../../../services/types/cliente';
import { useCart } from '../context/CartContext';

interface ProductoCardProps {
  producto: ProductoCatalogo;
}

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const ProductoCard = ({ producto }: ProductoCardProps) => {
  const { agregarAlCarrito } = useCart();
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<VarianteCatalogo | null>(
    producto.variantes[0] || null
  );
  const [cantidad, setCantidad] = useState(1);

  const precioNum = toNumber(producto.precio_desde);
  const tieneVariantes = producto.variantes.length > 1;

  const handleAgregar = () => {
    if (!varianteSeleccionada) return;
    
    agregarAlCarrito({
      idVariante: varianteSeleccionada.id,
      nombreProducto: producto.nombre,
      nombreVariante: varianteSeleccionada.nombre,
      precioUnitario: toNumber(varianteSeleccionada.precio),
      cantidad,
      stock: varianteSeleccionada.stock,
    });
    
    setCantidad(1);
  };

  const handleVarianteChange = (varianteId: number) => {
    const variante = producto.variantes.find(v => v.id === varianteId);
    if (variante) {
      setVarianteSeleccionada(variante);
      setCantidad(1);
    }
  };

  if (!varianteSeleccionada) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Imagen placeholder */}
      <div className="h-40 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
        <CubeIcon className="h-12 w-12 text-gray-400" />
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Categoría */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <TagIcon className="h-3 w-3" />
          <span>{producto.categoria_nombre}</span>
        </div>

        {/* Nombre */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{producto.nombre}</h3>
        
        {/* Descripción */}
        {producto.descripcion && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{producto.descripcion}</p>
        )}

        {/* Precio */}
        <div className="flex items-center gap-1 text-lg font-bold text-green-600 mb-3">
          <CurrencyDollarIcon className="h-4 w-4" />
          Bs. {precioNum.toFixed(2)}
        </div>

        {/* Selector de variante */}
        {tieneVariantes && (
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Variante</label>
            <select
              value={varianteSeleccionada.id}
              onChange={(e) => handleVarianteChange(parseInt(e.target.value))}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {producto.variantes.map((variante) => (
                <option key={variante.id} value={variante.id}>
                  {variante.nombre} - Bs. {toNumber(variante.precio).toFixed(2)} 
                  {variante.stock > 0 ? ` (Stock: ${variante.stock})` : ' (Agotado)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cantidad y botón */}
        <div className="flex gap-2">
          <div className="w-24">
            <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
            <input
              type="number"
              min="1"
              max={varianteSeleccionada.stock}
              value={cantidad}
              onChange={(e) => setCantidad(Math.min(parseInt(e.target.value) || 1, varianteSeleccionada.stock))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAgregar}
            disabled={varianteSeleccionada.stock === 0}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-5"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};