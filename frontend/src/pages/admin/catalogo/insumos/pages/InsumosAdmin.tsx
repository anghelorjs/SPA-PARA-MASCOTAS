// src/pages/admin/catalogo/insumos/pages/InsumosAdmin.tsx
import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useInsumosAdmin } from '../hooks/useInsumosAdmin';
import { InsumosTable } from '../components/InsumosTable';
import { InsumoFormModal } from '../components/InsumoFormModal';
import { AjustarStockModal } from '../components/AjustarStockModal';
import { HistorialConsumoModal } from '../components/HistorialConsumoModal';
import Pagination from '../../../../../components/common/Pagination';
import type { Insumo, CreateInsumoData, AjustarStockData, Categoria } from '../../../../../services/types/admin';
import { adminCategoriasService } from '../../categorias/services/admin.categorias.service';

export const InsumosAdmin = () => {
  const {
    insumos,
    filtroCategoria,
    filtroSearch,
    filtroBajoStock,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFiltroCategoria,
    cambiarFiltroSearch,
    cambiarFiltroBajoStock,
    cambiarPagina,
    crearInsumo,
    actualizarInsumo,
    ajustarStock,
    eliminarInsumo,
    refresh,
  } = useInsumosAdmin();

  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [modalHistorialOpen, setModalHistorialOpen] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<Insumo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);

  // Cargar categorías para el selector
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setCargandoCategorias(true);
        const response = await adminCategoriasService.getCategorias('insumo', 1);
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
    setInsumoEditando(null);
    setModalFormOpen(true);
  };

  const handleEditar = (insumo: Insumo) => {
    setInsumoEditando(insumo);
    setModalFormOpen(true);
  };

  const handleVerDetalle = (insumo: Insumo) => {
    setInsumoSeleccionado(insumo);
    setModalHistorialOpen(true);
  };

  const handleAjustarStock = (insumo: Insumo) => {
    setInsumoSeleccionado(insumo);
    setModalStockOpen(true);
  };

  const handleSaveInsumo = async (data: CreateInsumoData): Promise<boolean> => {
    setIsSubmitting(true);
    let success = false;
    
    if (insumoEditando) {
      success = await actualizarInsumo(insumoEditando.idInsumo, data);
    } else {
      success = await crearInsumo(data);
    }
    
    setIsSubmitting(false);
    return success;
  };

  const handleAjustar = async (data: AjustarStockData): Promise<boolean> => {
    if (!insumoSeleccionado) return false;
    setIsSubmitting(true);
    const success = await ajustarStock(insumoSeleccionado.idInsumo, data);
    setIsSubmitting(false);
    return success;
  };

  const limpiarFiltros = () => {
    cambiarFiltroCategoria('');
    cambiarFiltroSearch('');
    cambiarFiltroBajoStock(false);
  };

  const tieneFiltrosActivos = filtroCategoria || filtroSearch || filtroBajoStock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de insumos para grooming
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
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Nuevo Insumo
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
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
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filtro por categoría - Selector */}
          <div className="w-56">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Categoría
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => cambiarFiltroCategoria(e.target.value)}
              disabled={cargandoCategorias}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de stock bajo */}
          <button
            onClick={() => cambiarFiltroBajoStock(!filtroBajoStock)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              filtroBajoStock
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            Stock bajo
          </button>

          {/* Botón limpiar filtros */}
          {tieneFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de insumos */}
      <InsumosTable
        insumos={insumos}
        isLoading={isLoading}
        onEdit={handleEditar}
        onDelete={eliminarInsumo}
        onVerDetalle={handleVerDetalle}
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
      <InsumoFormModal
        isOpen={modalFormOpen}
        insumo={insumoEditando}
        isLoading={isSubmitting}
        onClose={() => {
          setModalFormOpen(false);
          setInsumoEditando(null);
        }}
        onSave={handleSaveInsumo}
      />

      {/* Modal de ajuste de stock */}
      <AjustarStockModal
        isOpen={modalStockOpen}
        insumo={insumoSeleccionado}
        isLoading={isSubmitting}
        onClose={() => {
          setModalStockOpen(false);
          setInsumoSeleccionado(null);
        }}
        onAjustar={handleAjustar}
      />

      {/* Modal de historial de consumo */}
      <HistorialConsumoModal
        isOpen={modalHistorialOpen}
        insumo={insumoSeleccionado}
        onClose={() => {
          setModalHistorialOpen(false);
          setInsumoSeleccionado(null);
        }}
      />
    </div>
  );
};