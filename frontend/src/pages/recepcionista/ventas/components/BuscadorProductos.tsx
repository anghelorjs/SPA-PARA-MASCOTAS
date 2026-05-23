// src/pages/recepcionista/ventas/components/BuscadorProductos.tsx
import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { recepcionistaVentasService } from '../services/recepcionista.ventas.service';
import type { ProductoVenta, CategoriaVenta } from '../types';

interface BuscadorProductosProps {
  onAgregarProducto: (producto: ProductoVenta, varianteId: number, cantidad: number) => boolean;
  isDisabled?: boolean;
}

export const BuscadorProductos = ({ onAgregarProducto, isDisabled = false }: BuscadorProductosProps) => {
  const [search, setSearch] = useState('');
  const [categorias, setCategorias] = useState<CategoriaVenta[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [resultados, setResultados] = useState<ProductoVenta[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoVenta | null>(null);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [mostrarDropdownCategorias, setMostrarDropdownCategorias] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cargar categorías al montar
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await recepcionistaVentasService.getCategorias();
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    loadCategorias();
  }, []);

  // Buscar productos
  useEffect(() => {
    const searchProducts = async () => {
      if (search.length < 2) {
        setResultados([]);
        setMostrarResultados(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await recepcionistaVentasService.buscarProductos(search);
        // Filtrar por categoría si está seleccionada
        const filtered = categoriaSeleccionada
          ? results.filter(p => p.categoria === categorias.find(c => c.id === categoriaSeleccionada)?.nombre)
          : results;
        setResultados(filtered);
        setMostrarResultados(true);
      } catch (error) {
        console.error('Error al buscar productos:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [search, categoriaSeleccionada, categorias]);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProducto = (producto: ProductoVenta) => {
    setProductoSeleccionado(producto);
    setVarianteSeleccionada(producto.variantes[0]?.idVariante || null);
    setMostrarResultados(false);
    setSearch('');
  };

  const handleAgregar = () => {
    if (!productoSeleccionado || !varianteSeleccionada) return;
    const success = onAgregarProducto(productoSeleccionado, varianteSeleccionada, cantidad);
    if (success) {
      setProductoSeleccionado(null);
      setVarianteSeleccionada(null);
      setCantidad(1);
    }
  };

  const handleCancelar = () => {
    setProductoSeleccionado(null);
    setVarianteSeleccionada(null);
    setCantidad(1);
    setSearch('');
  };

  const varianteSeleccionadaObj = productoSeleccionado?.variantes.find(v => v.idVariante === varianteSeleccionada);

  return (
    <div className="space-y-3" ref={searchRef}>
      {/* Filtro de categorías y buscador */}
      <div className="flex gap-2">
        {/* Dropdown de categorías */}
        <div className="relative">
          <button
            type="button"
            aria-label="Abrir selector de categoría"
            onClick={() => setMostrarDropdownCategorias(!mostrarDropdownCategorias)}
            className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <span>{categoriaSeleccionada ? categorias.find(c => c.id === categoriaSeleccionada)?.nombre : 'Todas las categorías'}</span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>
          {mostrarDropdownCategorias && (
            <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                onClick={() => {
                  setCategoriaSeleccionada(null);
                  setMostrarDropdownCategorias(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
              >
                Todas las categorías
              </button>
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoriaSeleccionada(cat.id);
                    setMostrarDropdownCategorias(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  {cat.nombre} ({cat.cantidad_productos})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buscador */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre o categoría..."
            aria-label="Buscar producto"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isDisabled}
          />
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {mostrarResultados && (
        <div className="absolute z-10 mt-1 w-full max-w-[calc(100%-40px)] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
              Buscando...
            </div>
          ) : resultados.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No se encontraron productos</div>
          ) : (
            resultados.map((producto) => (
              <button
                key={producto.idProducto}
                onClick={() => handleSelectProducto(producto)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="font-medium text-gray-800">{producto.nombre}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {producto.categoria} • {producto.variantes.length} variante(s)
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Formulario de selección de variante y cantidad */}
      {productoSeleccionado && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-800">{productoSeleccionado.nombre}</h4>
              <p className="text-xs text-gray-500">{productoSeleccionado.categoria}</p>
            </div>
            <button type="button" aria-label="Cancelar selección de producto" onClick={handleCancelar} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Selector de variante */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Variante</label>
            <select
              value={varianteSeleccionada || ''}
              onChange={(e) => setVarianteSeleccionada(parseInt(e.target.value))}
              aria-label="Seleccionar variante"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {productoSeleccionado.variantes.map(v => (
                <option key={v.idVariante} value={v.idVariante}>
                  {v.nombreVariante} - Bs. {v.precio.toFixed(2)} (Stock: {v.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad y botón agregar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                max={varianteSeleccionadaObj?.stock || 999}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                aria-label="Cantidad del producto"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAgregar}
              className="mt-5 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};