// src/pages/admin/catalogo/productos/pages/ProductosAdmin.tsx
import { useState, useEffect } from 'react';
import { PlusIcon, ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useProductosAdmin } from '../hooks/useProductosAdmin';
import { ProductosTable } from '../components/ProductosTable';
import { ProductoFormModal } from '../components/ProductoFormModal';
import Pagination from '../../../../../components/common/Pagination';
import type { Producto, CreateProductoData, Categoria } from '../../../../../services/types/admin';
import { adminCategoriasService } from '../../categorias/services/admin.categorias.service';

export const ProductosAdmin = () => {
  const {
    productos,
    filtroCategoria,
    filtroSearch,
    filtroActivo,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFiltroCategoria,
    cambiarFiltroSearch,
    cambiarFiltroActivo,
    cambiarPagina,
    crearProducto,
    actualizarProducto,
    toggleProducto,
    eliminarProducto,
    crearVariante,
    actualizarVariante,
    eliminarVariante,
    refresh,
  } = useProductosAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);

  // Cargar categorías para el selector
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setCargandoCategorias(true);
        const response = await adminCategoriasService.getCategorias('producto', 1);
        setCategorias(response.data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setCargandoCategorias(false);
      }
    };
    loadCategorias();
  }, []);

  const handleNuevo = () => {
    setProductoEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (producto: Producto) => {
    setProductoEditando(producto);
    setModalOpen(true);
  };

  const handleSave = async (data: CreateProductoData): Promise<boolean> => {
    setIsSubmitting(true);
    let success = false;
    
    if (productoEditando) {
      success = await actualizarProducto(productoEditando.idProducto, data);
    } else {
      success = await crearProducto(data);
    }
    
    setIsSubmitting(false);
    return success;
  };

  const limpiarFiltros = () => {
    cambiarFiltroCategoria('');
    cambiarFiltroSearch('');
    cambiarFiltroActivo(undefined);
  };

  const tieneFiltrosActivos = filtroCategoria || filtroSearch || filtroActivo !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión del catálogo de productos y sus variantes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={handleNuevo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros - siempre visibles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Buscador */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroSearch}
              onChange={(e) => cambiarFiltroSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por categoría */}
          <div className="w-56">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Categoría
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => cambiarFiltroCategoria(e.target.value)}
              disabled={cargandoCategorias}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Estado
            </label>
            <select
              value={filtroActivo === undefined ? '' : filtroActivo ? 'activo' : 'inactivo'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'activo') cambiarFiltroActivo(true);
                else if (val === 'inactivo') cambiarFiltroActivo(false);
                else cambiarFiltroActivo(undefined);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          {/* Botón limpiar filtros */}
          {tieneFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              style={{ marginBottom: 0 }}
            >
              <XMarkIcon className="h-4 w-4" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de productos */}
      <ProductosTable
        productos={productos}
        isLoading={isLoading}
        onEdit={handleEditar}
        onDelete={eliminarProducto}
        onToggle={toggleProducto}
        onCreateVariante={crearVariante}
        onUpdateVariante={actualizarVariante}
        onDeleteVariante={eliminarVariante}
        onRefresh={refresh}
      />

      {/* Paginación */}
      {!isLoading && total > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          onPageChange={cambiarPagina}
          showTotal={true}
        />
      )}

      {/* Modal de formulario */}
      <ProductoFormModal
        isOpen={modalOpen}
        producto={productoEditando}
        isLoading={isSubmitting}
        onClose={() => {
          setModalOpen(false);
          setProductoEditando(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};