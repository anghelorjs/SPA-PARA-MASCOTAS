// src/pages/admin/catalogo/categorias/pages/CategoriasAdmin.tsx
import { useState } from 'react';
import { PlusIcon, ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useCategoriasAdmin } from '../hooks/useCategoriasAdmin';
import { CategoriasTable } from '../components/CategoriasTable';
import { CategoriaFormModal } from '../components/CategoriaFormModal';
import Pagination from '../../../../../components/common/Pagination';
import type { Categoria, CreateCategoriaData } from '../../../../../services/types/admin';

export const CategoriasAdmin = () => {
  const {
    categorias,
    filtroTipo,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFiltroTipo,
    cambiarPagina,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    refresh,
  } = useCategoriasAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNuevo = () => {
    setCategoriaEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setModalOpen(true);
  };

  const handleEliminar = (id: number, nombre: string) => {
    eliminarCategoria(id, nombre);
  };

  const handleSave = async (data: CreateCategoriaData): Promise<boolean> => {
    setIsSubmitting(true);
    let success = false;
    
    if (categoriaEditando) {
      success = await actualizarCategoria(categoriaEditando.idCategoria, data);
    } else {
      success = await crearCategoria(data);
    }
    
    setIsSubmitting(false);
    return success;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de categorías para productos e insumos
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
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => cambiarFiltroTipo('')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filtroTipo === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => cambiarFiltroTipo('producto')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filtroTipo === 'producto'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => cambiarFiltroTipo('insumo')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filtroTipo === 'insumo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Insumos
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <CategoriasTable
        categorias={categorias}
        isLoading={isLoading}
        onEdit={handleEditar}
        onDelete={handleEliminar}
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
      <CategoriaFormModal
        isOpen={modalOpen}
        categoria={categoriaEditando}
        isLoading={isSubmitting}
        onClose={() => {
          setModalOpen(false);
          setCategoriaEditando(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};