import { useState } from 'react';
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CubeIcon,
  TagIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
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

  const precioDesde = toNumber(producto.precio_desde);
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
    const variante = producto.variantes.find((item) => item.id === varianteId);
    if (variante) {
      setVarianteSeleccionada(variante);
      setCantidad(1);
    }
  };

  if (!varianteSeleccionada) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-44 bg-gray-100">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center">
            <CubeIcon className="h-14 w-14 text-blue-200" />
          </div>
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
          <TagIcon className="h-3 w-3 text-blue-500" />
          {producto.categoria_nombre}
        </div>
        <div className="absolute right-3 bottom-3 rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
          Desde {precioDesde.toFixed(2)} Bs.
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-1">{producto.nombre}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{producto.stock_total} unidades disponibles</p>
        </div>

        {producto.descripcion && (
          <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{producto.descripcion}</p>
        )}

        <div className="flex items-center gap-1 text-lg font-bold text-emerald-600">
          <CurrencyDollarIcon className="h-4 w-4" />
          Bs. {toNumber(varianteSeleccionada.precio).toFixed(2)}
        </div>

        {tieneVariantes && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Variante</label>
            <select
              value={varianteSeleccionada.id}
              onChange={(event) => handleVarianteChange(parseInt(event.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

        <div className="flex gap-2 items-end">
          <div className="w-28">
            <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-8 h-9 flex items-center justify-center hover:bg-gray-50"
              >
                <MinusIcon className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                min="1"
                max={varianteSeleccionada.stock}
                value={cantidad}
                onChange={(event) => setCantidad(Math.min(parseInt(event.target.value) || 1, varianteSeleccionada.stock))}
                className="w-10 h-9 text-center text-sm border-x border-gray-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCantidad(Math.min(varianteSeleccionada.stock, cantidad + 1))}
                className="w-8 h-9 flex items-center justify-center hover:bg-gray-50"
              >
                <PlusIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <button
            onClick={handleAgregar}
            disabled={varianteSeleccionada.stock === 0}
            className="flex-1 h-10 flex items-center justify-center gap-1 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};
