// src/pages/cliente/mascotas/pages/DetalleMascota.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  HeartIcon, 
  ClipboardDocumentListIcon, 
  PhotoIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useDetalleMascota, useMascotasCliente } from '../hooks/useMascotasCliente';
import { PestañaDatosSalud } from '../components/PestañaDatosSalud';
import { PestañaHistorialServicios } from '../components/PestañaHistorialServicios';
import { PestañaGaleriaFotos } from '../components/PestañaGaleriaFotos';
import { ModalMascotaForm } from '../components/ModalMascotaForm';
import type { Mascota } from '../../../../services/types/cliente';

type TabType = 'salud' | 'historial' | 'fotos';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'salud', label: 'Datos de salud', icon: <HeartIcon className="h-4 w-4" /> },
  { id: 'historial', label: 'Historial de servicios', icon: <ClipboardDocumentListIcon className="h-4 w-4" /> },
  { id: 'fotos', label: 'Fotos', icon: <PhotoIcon className="h-4 w-4" /> },
];

export const DetalleMascota = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('salud');
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const { detalle, isLoading, refresh: refreshDetalle } = useDetalleMascota(id ? parseInt(id) : undefined);
  const { actualizarMascota, subirFotoPerfil, rangosPeso, isLoadingRangos } = useMascotasCliente();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const handleVolver = () => {
    navigate('/cliente/mis-mascotas');
  };

  const handleEditar = () => {
    setModalEditOpen(true);
  };

  const handleSaveEdit = async (data: any): Promise<boolean> => {
    if (!id) return false;
    setIsSubmitting(true);
    const success = await actualizarMascota(parseInt(id), data);
    setIsSubmitting(false);
    if (success) {
      await refreshDetalle();
      setModalEditOpen(false);
    }
    return success;
  };

  const handleFotoPerfilChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    
    setUploadingFoto(true);
    await subirFotoPerfil(parseInt(id), file);
    await refreshDetalle();
    setUploadingFoto(false);
    e.target.value = '';
  };

  const getEspecieIcon = () => {
    // Heroicons package doesn't include specific pet icons here; use a generic icon
    return <HeartIcon className="w-10 h-10 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudo cargar la información de la mascota</p>
        <button onClick={handleVolver} className="mt-4 text-pink-600 hover:text-pink-800">
          Volver a mis mascotas
        </button>
      </div>
    );
  }

  const { mascota } = detalle;

  return (
    <div className="space-y-6">
      {/* Header con botón volver */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleVolver}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ficha de Mascota</h1>
      </div>

      {/* Tarjeta de información básica */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-pink-400 to-rose-500">
          {/* Foto de perfil */}
          <div className="absolute -bottom-10 left-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                {mascota.foto_perfil_url ? (
                  <img
                    src={mascota.foto_perfil_url}
                    alt={mascota.nombre}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                    {getEspecieIcon()}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                <CameraIcon className="h-4 w-4 text-gray-500" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoPerfilChange}
                  disabled={uploadingFoto}
                />
              </label>
              {uploadingFoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-14 pb-4 px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{mascota.nombre}</h2>
              <p className="text-sm text-gray-500">
                {mascota.especie} • {mascota.raza || 'Raza no especificada'}
                {mascota.tamanio && ` • ${mascota.tamanio}`}
              </p>
            </div>
            <button
              onClick={handleEditar}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Editar datos
            </button>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'salud' && (
          <PestañaDatosSalud mascota={mascota} onEditar={handleEditar} />
        )}
        {activeTab === 'historial' && (
          <PestañaHistorialServicios historial={detalle.historial_servicios} isLoading={isLoading} />
        )}
        {activeTab === 'fotos' && (
          <PestañaGaleriaFotos galeria={detalle.galeria_fotos} isLoading={isLoading} />
        )}
      </div>

      {/* Modal de edición */}
      <ModalMascotaForm
        isOpen={modalEditOpen}
        mascota={mascota as Mascota}
        rangosPeso={rangosPeso}
        isLoadingRangos={isLoadingRangos}
        isLoading={isSubmitting}
        onClose={() => setModalEditOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};