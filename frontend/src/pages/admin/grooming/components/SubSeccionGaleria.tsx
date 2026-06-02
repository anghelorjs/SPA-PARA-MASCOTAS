// src/pages/admin/grooming/components/SubSeccionGaleria.tsx
import { useState } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGaleriaAdmin } from '../hooks/useGaleriaAdmin';
import { FiltroGroomerFichas } from './FiltroGroomerFichas';
import { FiltroTipoFoto } from './FiltroTipoFoto';
import { FiltroFechasFichas } from './FiltroFechasFichas';
import { BuscadorMascota } from './BuscadorMascota';
import { GridGaleriaFotos } from './GridGaleriaFotos';
import { LightboxGaleria } from './LightboxGaleria';
import { ModalConfirmarEliminarFoto } from './ModalConfirmarEliminarFoto';
import Pagination from '../../../../components/common/Pagination';

interface SubSeccionGaleriaProps {
  onClose: () => void;
}

export const SubSeccionGaleria = ({ onClose }: SubSeccionGaleriaProps) => {
  const {
    fotos,
    tiposFoto,
    mascotaSearch,
    groomerId,
    tipoFoto,
    fechaDesde,
    fechaHasta,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    setMascotaSearch,
    setGroomerId,
    setTipoFoto,
    setFechaDesde,
    setFechaHasta,
    limpiarFiltros,
    cambiarPagina,
    eliminarFoto,
    refresh,
  } = useGaleriaAdmin();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedFotoIndex, setSelectedFotoIndex] = useState(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [fotoAEliminar, setFotoAEliminar] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFotoClick = (foto: any, index: number) => {
    setSelectedFotoIndex(index);
    setLightboxOpen(true);
  };

  const handleEliminarClick = (fotoId: number) => {
    setFotoAEliminar(fotoId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!fotoAEliminar) return;
    setIsDeleting(true);
    await eliminarFoto(fotoAEliminar);
    setIsDeleting(false);
    setConfirmDeleteOpen(false);
    setFotoAEliminar(null);
    if (lightboxOpen) setLightboxOpen(false);
  };

  const handleLimpiarFiltros = () => {
    limpiarFiltros();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div>
          <h2 className="text-lg font-semibold text-white">Galería de Fotos</h2>
          <p className="text-xs text-blue-100">Todas las fotos del sistema</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Filtros */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <BuscadorMascota
              search={mascotaSearch}
              onSearchChange={setMascotaSearch}
              placeholder="Buscar por mascota..."
              isLoading={isLoading}
            />
          </div>
          <FiltroGroomerFichas
            groomerId={groomerId}
            onGroomerChange={setGroomerId}
            isLoading={isLoading}
          />
          <FiltroTipoFoto
            tiposFoto={tiposFoto}
            tipoSeleccionado={tipoFoto}
            onTipoChange={setTipoFoto}
            isLoading={isLoading}
          />
          <FiltroFechasFichas
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            onFechaDesdeChange={setFechaDesde}
            onFechaHastaChange={setFechaHasta}
            isLoading={isLoading}
          />
          <button
            onClick={refresh}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          {tieneFiltrosActivos && (
            <button
              onClick={handleLimpiarFiltros}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid de fotos */}
      <div className="flex-1 overflow-y-auto p-6">
        <GridGaleriaFotos
          fotos={fotos}
          isLoading={isLoading}
          onFotoClick={handleFotoClick}
          onEliminarFoto={handleEliminarClick}
        />

        {/* Paginación */}
        {!isLoading && total > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              onPageChange={cambiarPagina}
              showTotal={true}
            />
          </div>
        )}
      </div>

      {/* Lightbox */}
      <LightboxGaleria
        isOpen={lightboxOpen}
        fotos={fotos}
        currentIndex={selectedFotoIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setSelectedFotoIndex((prev) => (prev + 1) % fotos.length)}
        onPrev={() => setSelectedFotoIndex((prev) => (prev - 1 + fotos.length) % fotos.length)}
        onEliminar={(fotoId) => {
          setLightboxOpen(false);
          handleEliminarClick(fotoId);
        }}
      />

      {/* Confirmación eliminar */}
      <ModalConfirmarEliminarFoto
        isOpen={confirmDeleteOpen}
        isLoading={isDeleting}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setFotoAEliminar(null);
        }}
        onConfirmar={handleConfirmarEliminar}
      />
    </div>
  );
};