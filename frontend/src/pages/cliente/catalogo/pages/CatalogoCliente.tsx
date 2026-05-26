// src/pages/cliente/catalogo/pages/CatalogoCliente.tsx
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, CubeIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCatalogoCliente } from '../hooks/useCatalogoCliente';
import { useCart } from '../context/CartContext';
import { BuscadorProductos } from '../components/BuscadorProductos';
import { FiltrosCategorias } from '../components/FiltrosCategorias';
import { ProductoCard } from '../components/ProductoCard';

export const CatalogoCliente = () => {
  const navigate = useNavigate();
  const { productos, categorias, searchTerm, categoriaSeleccionada, isLoading, setSearchTerm, setCategoriaSeleccionada, limpiarFiltros } = useCatalogoCliente();
  const { totalItems } = useCart();

  const tieneFiltrosActivos = searchTerm !== '' || categoriaSeleccionada !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Encuentra todo lo que necesitas para tu mascota
          </p>
        </div>
        <button
          onClick={() => navigate('/cliente/carrito')}
          className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          Ver Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Barra de búsqueda */}
      <BuscadorProductos searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Filtros por categoría */}
      {categorias.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtrar por categoría</span>
            {tieneFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
              >
                <XMarkIcon className="h-3 w-3" />
                Limpiar filtros
              </button>
            )}
          </div>
          <FiltrosCategorias
            categorias={categorias}
            categoriaSeleccionada={categoriaSeleccionada}
            onCategoriaChange={setCategoriaSeleccionada}
          />
        </div>
      )}

      {/* Resultados */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron productos</p>
          <p className="text-sm text-gray-400 mt-1">Intenta con otros filtros o busca otro término</p>
          {tieneFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
};