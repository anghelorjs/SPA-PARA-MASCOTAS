// src/pages/cliente/mascotas/pages/MisMascotas.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ArrowPathIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useMascotasCliente } from '../hooks/useMascotasCliente';
import { MascotaCard } from '../components/MascotaCard';
import { ModalMascotaForm } from '../components/ModalMascotaForm';
import type { Mascota } from '../../../../services/types/cliente';

export const MisMascotas = () => {
  const navigate = useNavigate();
  const { mascotas, rangosPeso, isLoading, isLoadingRangos, crearMascota, actualizarMascota, refresh } = useMascotasCliente();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState<Mascota | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditar = (mascota: Mascota) => {
    setMascotaEditando(mascota);
    setModalOpen(true);
  };

  const handleVerDetalle = (mascotaId: number) => {
    navigate(`/cliente/mis-mascotas/${mascotaId}`);
  };

  const handleNuevaMascota = () => {
    setMascotaEditando(null);
    setModalOpen(true);
  };

  const handleSave = async (data: any): Promise<boolean> => {
    setIsSubmitting(true);
    let success = false;
    
    if (mascotaEditando) {
      success = await actualizarMascota(mascotaEditando.id, data);
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Mascotas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona la información de tus mascotas
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
            onClick={handleNuevaMascota}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Mascota
          </button>
        </div>
      </div>

      {/* Lista de mascotas */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
        </div>
      ) : mascotas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes mascotas registradas</h3>
          <p className="text-gray-500 mb-4">Agrega tu primera mascota para empezar</p>
          <button
            onClick={handleNuevaMascota}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Mascota
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mascotas.map((mascota) => (
            <MascotaCard
              key={mascota.id}
              mascota={mascota}
              onEditar={handleEditar}
              onVerDetalle={handleVerDetalle}
            />
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      <ModalMascotaForm
        isOpen={modalOpen}
        mascota={mascotaEditando}
        rangosPeso={rangosPeso}
        isLoadingRangos={isLoadingRangos}
        isLoading={isSubmitting}
        onClose={() => {
          setModalOpen(false);
          setMascotaEditando(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};
