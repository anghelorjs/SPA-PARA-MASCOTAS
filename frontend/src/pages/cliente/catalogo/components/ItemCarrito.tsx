// src/pages/cliente/catalogo/components/ItemCarrito.tsx
import { TrashIcon, PlusIcon, MinusIcon, CubeIcon } from '@heroicons/react/24/outline';
import type { ItemCarrito } from '../../../../services/types/cliente';

interface ItemCarritoProps {
  item: ItemCarrito;
  onActualizarCantidad: (idVariante: number, cantidad: number) => void;
  onEliminar: (idVariante: number) => void;
}

export const ItemCarrito = ({ item, onActualizarCantidad, onEliminar }: ItemCarritoProps) => {
  const incrementar = () => {
    if (item.cantidad < item.stock) {
      onActualizarCantidad(item.idVariante, item.cantidad + 1);
    }
  };

  const decrementar = () => {
    if (item.cantidad > 1) {
      onActualizarCantidad(item.idVariante, item.cantidad - 1);
    } else {
      onEliminar(item.idVariante);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Icono */}
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <CubeIcon className="h-6 w-6 text-gray-400" />
      </div>

      {/* Info producto */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.nombreProducto}</h4>
        <p className="text-xs text-gray-500">{item.nombreVariante}</p>
        <p className="text-xs text-gray-400 mt-0.5">Bs. {item.precioUnitario.toFixed(2)} c/u</p>
      </div>

      {/* Cantidad */}
      <div className="flex items-center gap-2">
        <button
          onClick={decrementar}
          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-gray-700 w-8 text-center">{item.cantidad}</span>
        <button
          onClick={incrementar}
          disabled={item.cantidad >= item.stock}
          className="p-1 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-30"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[80px]">
        <p className="text-sm font-semibold text-green-600">
          Bs. {item.subtotal.toFixed(2)}
        </p>
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onEliminar(item.idVariante)}
        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
};