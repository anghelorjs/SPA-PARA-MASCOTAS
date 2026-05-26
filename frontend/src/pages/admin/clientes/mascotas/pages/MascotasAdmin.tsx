// src/pages/admin/clientes/mascotas/pages/MascotasAdmin.tsx
import { useState } from 'react';
import { PlusIcon, ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useMascotasAdmin } from '../hooks/useMascotasAdmin';
import { TablaMascotas } from '../components/TablaMascotas';
import { ModalMascotaForm } from '../components/ModalMascotaForm';
import { FichaMascotaModal } from '../components/FichaMascotaModal';
import Pagination from '../../../../../components/common/Pagination';
import type { MascotaAdmin, CreateMascotaAdminData } from '../../../../../services/types/admin';

const ESPECIES = [
  { value: '', label: 'Todas' },
  { value: 'perro', label: 'Perros' },
  { value: 'gato', label: 'Gatos' },
  { value: 'otro', label: 'Otros' },
];

export const MascotasAdmin = () => {
  const {
    mascotas,
    searchTerm,
    filtroEspecie,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    cambiarSearchTerm,
    cambiarFiltroEspecie,
    cambiarPagina,
    crearMascota,
    actualizarMascota,
    limpiarFiltros,
    refresh,
  } = useMascotasAdmin();

  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalFichaOpen, setModalFichaOpen] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState<MascotaAdmin | null>(null);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<MascotaAdmin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleNueva = () => {
    setMascotaEditando(null);
    setModalFormOpen(true);
  };

  const handleEditar = (mascota: MascotaAdmin) => {
    setMascotaEditando(mascota);
    setModalFormOpen(true);
  };

  const handleVerFicha = (mascota: MascotaAdmin) => {
    setMascotaSeleccionada(mascota);
    setModalFichaOpen(true);
  };

  const handleSaveMascota = async (data: CreateMascotaAdminData): Promise<boolean> => {
    setIsSubmitting(true);
    let success = false;
    
    if (mascotaEditando) {
      success = await actualizarMascota(mascotaEditando.idMascota, data);
    } else {
      success = await crearMascota(data);
    }
    
    setIsSubmitting(false);
    return success;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mascotas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de mascotas de los clientes
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
            onClick={handleNueva}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Nueva Mascota
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de mascota o dueño..."
              value={searchTerm}
              onChange={(e) => cambiarSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4" />
            Filtros
            {tieneFiltrosActivos && (
              <span className="w-2 h-2 bg-pink-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">Especie</label>
                <select
                  value={filtroEspecie}
                  onChange={(e) => cambiarFiltroEspecie(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  {ESPECIES.map(esp => (
                    <option key={esp.value} value={esp.value}>{esp.label}</option>
                  ))}
                </select>
              </div>
              {tieneFiltrosActivos && (
                <div className="flex items-end">
                  <button
                    onClick={limpiarFiltros}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabla de mascotas */}
      <TablaMascotas
        mascotas={mascotas}
        isLoading={isLoading}
        onVerDetalle={handleVerFicha}
        onEditar={handleEditar}
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
      <ModalMascotaForm
        isOpen={modalFormOpen}
        mascota={mascotaEditando}
        isLoading={isSubmitting}
        onClose={() => {
          setModalFormOpen(false);
          setMascotaEditando(null);
        }}
        onSave={handleSaveMascota}
      />

      {/* Modal de ficha de mascota */}
      <FichaMascotaModal
        isOpen={modalFichaOpen}
        mascotaId={mascotaSeleccionada?.idMascota || null}
        mascotaNombre={mascotaSeleccionada?.nombre || ''}
        onClose={() => {
          setModalFichaOpen(false);
          setMascotaSeleccionada(null);
        }}
      />
    </div>
  );
};