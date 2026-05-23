// src/pages/recepcionista/ventas/components/CarritoItems.tsx
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import type { ItemCarrito } from '../types';

interface CarritoItemsProps {
  items: ItemCarrito[];
  onEliminar: (idVariante: number) => void;
  onActualizarCantidad: (idVariante: number, nuevaCantidad: number) => void;
}

export const CarritoItems = ({ items, onEliminar, onActualizarCantidad }: CarritoItemsProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Carrito vacío</p>
        <p className="text-xs mt-1">Busca y agrega productos para comenzar la venta</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500">
        <div className="col-span-5">Producto</div>
        <div className="col-span-3 text-center">Cantidad</div>
        <div className="col-span-3 text-right">Subtotal</div>
        <div className="col-span-1 text-right"></div>
      </div>

      {/* Items */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.idVariante}
            className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
          >
            {/* Producto info */}
            <div className="col-span-5">
              <p className="text-sm font-medium text-gray-800 truncate">{item.nombreProducto}</p>
              <p className="text-xs text-gray-400 truncate">{item.nombreVariante}</p>
              <p className="text-xs text-gray-500">Bs. {item.precioUnitario.toFixed(2)}</p>
            </div>

            {/* Cantidad */}
            <div className="col-span-3 flex items-center justify-center gap-1">
              <button
                type="button"
                aria-label={`Disminuir cantidad de ${item.nombreProducto}`}
                onClick={() => onActualizarCantidad(item.idVariante, item.cantidad - 1)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <MinusIcon className="h-3 w-3" />
              </button>
              <span className="text-sm font-medium text-gray-700 w-8 text-center">{item.cantidad}</span>
              <button
                type="button"
                aria-label={`Aumentar cantidad de ${item.nombreProducto}`}
                onClick={() => onActualizarCantidad(item.idVariante, item.cantidad + 1)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <PlusIcon className="h-3 w-3" />
              </button>
            </div>

            {/* Subtotal */}
            <div className="col-span-3 text-right">
              <span className="text-sm font-semibold text-gray-800">
                Bs. {item.subtotal.toFixed(2)}
              </span>
            </div>

            {/* Eliminar */}
            <div className="col-span-1 text-right">
              <button
                type="button"
                aria-label={`Eliminar ${item.nombreProducto} del carrito`}
                onClick={() => onEliminar(item.idVariante)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Total</span>
          <span className="text-xl font-bold text-green-600">
            Bs. {items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};