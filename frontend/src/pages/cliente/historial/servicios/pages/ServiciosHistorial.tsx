// src/pages/cliente/historial/servicios/pages/ServiciosHistorial.tsx
import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useServiciosHistorial } from '../hooks/useServiciosHistorial';
import { FiltroMascotaServicios } from '../components/FiltroMascotaServicios';
import { TablaServiciosHistorial } from '../components/TablaServiciosHistorial';
import { ModalDetalleServicio } from '../components/ModalDetalleServicio';
import Pagination from '../../../../../components/common/Pagination';

export const ServiciosHistorial = () => {
  const {
    servicios,
    mascotas,
    mascotaSeleccionada,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarMascota,
    cambiarPagina,
    refresh,
  } = useServiciosHistorial();

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [selectedServicioId, setSelectedServicioId] = useState<number | null>(null);

  const handleVerDetalle = (id: number) => {
    setSelectedServicioId(id);
    setDetalleOpen(true);
  };

  return (
    <div className="space-y-4">
        <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Servicios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Historial de servicios realizados
        </p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      <FiltroMascotaServicios
        mascotas={mascotas}
        mascotaSeleccionada={mascotaSeleccionada}
        onMascotaChange={cambiarMascota}
      />

      <TablaServiciosHistorial
        servicios={servicios}
        isLoading={isLoading}
        onVerDetalle={handleVerDetalle}
      />

      {!isLoading && total > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          onPageChange={cambiarPagina}
          showTotal={true}
        />
      )}

      <ModalDetalleServicio
        isOpen={detalleOpen}
        servicioId={selectedServicioId}
        onClose={() => {
          setDetalleOpen(false);
          setSelectedServicioId(null);
        }}
      />
    </div>
  );
};