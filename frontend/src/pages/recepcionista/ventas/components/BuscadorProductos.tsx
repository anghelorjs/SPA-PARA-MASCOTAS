// src/pages/recepcionista/ventas/components/BuscadorProductos.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { recepcionistaVentasService } from '../services/recepcionista.ventas.service';
import type { CategoriaVenta, ItemCarrito, ProductoVenta } from '../types';

interface BuscadorProductosProps {
  onAgregarProducto: (producto: ProductoVenta, varianteId: number, cantidad: number) => boolean;
  carrito?: ItemCarrito[];
  isDisabled?: boolean;
}

export const BuscadorProductos = ({
  onAgregarProducto,
  carrito = [],
  isDisabled = false,
}: BuscadorProductosProps) => {
  const [search, setSearch] = useState('');
  const [categorias, setCategorias] = useState<CategoriaVenta[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await recepcionistaVentasService.getCategorias();
        setCategorias(data);
      } catch (err) {
        console.error('Error al cargar categorias:', err);
      }
    };

    void loadCategorias();
  }, []);

  useEffect(() => {
    const term = search.trim();

    const loadProductos = async () => {
      if (term.length === 1) {
        setProductos([]);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await recepcionistaVentasService.buscarProductos(
          term.length >= 2 ? term : undefined,
          categoriaSeleccionada
        );
        setProductos(data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('No se pudieron cargar los productos.');
        setProductos([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = window.setTimeout(loadProductos, term.length >= 2 ? 250 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [categoriaSeleccionada, search]);

  const productosFiltrados = useMemo(() => {
    return productos;
  }, [productos]);

  const totalProductos = productosFiltrados.length;

  const cantidadEnCarrito = (idVariante: number) =>
    carrito.find((item) => item.idVariante === idVariante)?.cantidad ?? 0;

  const getCantidad = (idVariante: number) => cantidades[idVariante] ?? 1;

  const setCantidadVariante = (idVariante: number, value: number, stock: number) => {
    const safeValue = Number.isFinite(value) ? value : 1;
    const nextValue = Math.min(Math.max(safeValue, 1), Math.max(stock, 1));
    setCantidades((prev) => ({ ...prev, [idVariante]: nextValue }));
  };

  const handleAgregar = (producto: ProductoVenta, varianteId: number, stock: number) => {
    const cantidad = getCantidad(varianteId);
    const success = onAgregarProducto(producto, varianteId, cantidad);

    if (success && stock > 1) {
      setCantidades((prev) => ({ ...prev, [varianteId]: 1 }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Catalogo de productos</h3>
            <p className="text-xs text-gray-500">
              {totalProductos} producto{totalProductos === 1 ? '' : 's'} disponible{totalProductos === 1 ? '' : 's'}
            </p>
          </div>

          <div className="relative w-full xl:max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por producto o categoria"
              aria-label="Buscar producto"
              disabled={isDisabled}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setCategoriaSeleccionada(null)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              categoriaSeleccionada === null
                ? 'border-green-600 bg-green-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50'
            }`}
          >
            Todos
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => setCategoriaSeleccionada(categoria.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                categoriaSeleccionada === categoria.id
                  ? 'border-green-600 bg-green-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50'
              }`}
            >
              {categoria.nombre}
              <span className="ml-2 text-xs opacity-75">{categoria.cantidad_productos}</span>
            </button>
          ))}
        </div>
      </div>

      {search.trim().length === 1 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Escribe al menos 2 caracteres para buscar.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="min-h-[360px]">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
            <ShoppingBagIcon className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">No hay productos para mostrar</p>
            <p className="mt-1 text-xs text-gray-500">Cambia de categoria o prueba con otra busqueda.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {productosFiltrados.map((producto) => (
              <article
                key={producto.idProducto}
                className="flex min-h-[190px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="line-clamp-2 text-sm font-semibold text-gray-900">{producto.nombre}</h4>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <TagIcon className="h-3.5 w-3.5" />
                      <span className="truncate">{producto.categoria}</span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Bs. {producto.precio_base.toFixed(2)}
                  </span>
                </div>

                {producto.descripcion && (
                  <p className="mt-2 line-clamp-2 text-xs text-gray-500">{producto.descripcion}</p>
                )}

                <div className="mt-3 space-y-2">
                  {producto.variantes.map((variante) => {
                    const cantidad = getCantidad(variante.idVariante);
                    const enCarrito = cantidadEnCarrito(variante.idVariante);
                    const sinStock = variante.stock <= 0;

                    return (
                      <div
                        key={variante.idVariante}
                        className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-gray-800">{variante.nombreVariante}</p>
                            <p className={`text-xs ${sinStock ? 'text-red-500' : 'text-gray-500'}`}>
                              Stock: {variante.stock}
                              {enCarrito > 0 && (
                                <span className="ml-2 font-medium text-green-700">En carrito: {enCarrito}</span>
                              )}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-gray-900">
                            Bs. {variante.precio.toFixed(2)}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex h-9 shrink-0 items-center rounded-lg border border-gray-200 bg-white">
                            <button
                              type="button"
                              aria-label={`Disminuir ${variante.nombreVariante}`}
                              onClick={() => setCantidadVariante(variante.idVariante, cantidad - 1, variante.stock)}
                              disabled={sinStock || cantidad <= 1}
                              className="grid h-9 w-8 place-items-center text-gray-500 hover:text-green-700 disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={Math.max(variante.stock, 1)}
                              value={cantidad}
                              onChange={(e) =>
                                setCantidadVariante(variante.idVariante, Number(e.target.value), variante.stock)
                              }
                              disabled={sinStock}
                              aria-label={`Cantidad de ${variante.nombreVariante}`}
                              className="h-8 w-10 border-x border-gray-100 text-center text-sm font-medium text-gray-800 outline-none disabled:bg-gray-100"
                            />
                            <button
                              type="button"
                              aria-label={`Aumentar ${variante.nombreVariante}`}
                              onClick={() => setCantidadVariante(variante.idVariante, cantidad + 1, variante.stock)}
                              disabled={sinStock || cantidad >= variante.stock}
                              className="grid h-9 w-8 place-items-center text-gray-500 hover:text-green-700 disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAgregar(producto, variante.idVariante, variante.stock)}
                            disabled={isDisabled || sinStock}
                            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Agregar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
