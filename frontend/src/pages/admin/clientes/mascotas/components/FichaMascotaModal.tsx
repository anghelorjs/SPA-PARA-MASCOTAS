// src/pages/admin/clientes/mascotas/components/FichaMascotaModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  HeartIcon, 
  ScaleIcon, 
  TagIcon, 
  CakeIcon, 
  FaceSmileIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ScissorsIcon,
  UserIcon,
  PhotoIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { adminMascotasService } from '../services/admin.mascotas.service';
import type { FichaMascotaAdmin } from '../../../../../services/types/admin';
import { useToast } from '../../../../../hooks/useToast';

interface FichaMascotaModalProps {
  isOpen: boolean;
  mascotaId: number | null;
  mascotaNombre: string;
  onClose: () => void;
}

// ✅ Función para obtener URL completa de la imagen
const getImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  if (url.startsWith('/storage')) return `${baseUrl}${url}`;
  return `${baseUrl}/storage/${url.replace(/^\/?storage\/?/, '')}`;
};

const normalizeList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return value ? [value] : [];
  }
  return [];
};

const getRangoNombre = (mascota: FichaMascotaAdmin['mascota']) =>
  mascota.rangoPeso?.nombre || mascota.rango_nombre || 'No asignado';

const getFechaNacimiento = (mascota: FichaMascotaAdmin['mascota']) =>
  mascota.fechaNacimiento || mascota.fecha_nacimiento;

const formatDate = (value?: string | null) => {
  if (!value) return 'No registrada';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-ES');
};

// ✅ Componente Lightbox interno
const Lightbox = ({ 
  fotos, 
  initialIndex, 
  onClose 
}: { 
  fotos: Array<{ url: string; tipo: string }>; 
  initialIndex: number; 
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : fotos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < fotos.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="relative max-w-[90vw] max-h-[90vh]">
        <img
          src={getImageUrl(fotos[currentIndex].url)}
          alt="Foto ampliada"
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />
        
        {fotos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowRightIcon className="h-6 w-6 text-white" />
            </button>
          </>
        )}
        
        <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
          {currentIndex + 1} / {fotos.length}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const FichaMascotaModal = ({ isOpen, mascotaId, mascotaNombre, onClose }: FichaMascotaModalProps) => {
  const [ficha, setFicha] = useState<FichaMascotaAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'salud' | 'historial' | 'fotos'>('salud');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedFotoIndex, setSelectedFotoIndex] = useState(0);
  const [allFotos, setAllFotos] = useState<Array<{ url: string; tipo: string }>>([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && mascotaId) {
      loadFicha();
    }
  }, [isOpen, mascotaId]);

  const loadFicha = async () => {
    if (!mascotaId) return;
    try {
      setIsLoading(true);
      const data = await adminMascotasService.getMascota(mascotaId);
      setFicha(data);
      // Preparar todas las fotos para el lightbox
      if (data.mascota.fotos) {
        setAllFotos(data.mascota.fotos.map((f: any) => ({ url: f.urlFoto, tipo: f.tipo })));
      }
    } catch (error) {
      showToast('Error al cargar ficha de la mascota', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFotoClick = (index: number) => {
    setSelectedFotoIndex(index);
    setLightboxOpen(true);
  };

  if (!isOpen) return null;

  const mascota = ficha?.mascota;
  const estadisticas = ficha?.estadisticas;

  const datosClinicos = [
    { label: 'Temperamento', value: mascota?.temperamento, icon: FaceSmileIcon, color: 'text-amber-600' },
    { label: 'Alergias', value: normalizeList(mascota?.alergias).join(', '), icon: ExclamationCircleIcon, color: 'text-red-500' },
    { label: 'Restricciones', value: normalizeList(mascota?.restricciones).join(', '), icon: NoSymbolIcon, color: 'text-orange-500' },
    { label: 'Vacunas', value: normalizeList(mascota?.vacunas).join(', '), icon: ShieldCheckIcon, color: 'text-green-600' },
  ].filter(d => d.value && d.value !== '');

  // Agrupar fotos por tipo para mostrar
  const fotosAntes = mascota?.fotos?.filter(f => f.tipo === 'antes') || [];
  const fotosDespues = mascota?.fotos?.filter(f => f.tipo === 'despues') || [];
  const fotosPerfil = mascota?.fotos?.filter(f => f.tipo === 'perfil') || [];

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-600 to-rose-600">
            <div>
              <h2 className="text-lg font-semibold text-white">Ficha de Mascota</h2>
              <p className="text-xs text-pink-100">{mascotaNombre}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab('salud')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'salud'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <HeartIcon className="h-4 w-4" />
                Datos de salud
              </span>
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'historial'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4" />
                Historial de servicios
              </span>
            </button>
            <button
              onClick={() => setActiveTab('fotos')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'fotos'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <PhotoIcon className="h-4 w-4" />
                Fotos
              </span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
              </div>
            ) : mascota ? (
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ScaleIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-gray-500">Peso actual</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{mascota.pesoKg} kg</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TagIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-xs text-gray-500">Rango asignado</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{getRangoNombre(mascota)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CakeIcon className="h-4 w-4 text-pink-500" />
                      <span className="text-xs text-gray-500">Fecha nacimiento</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(getFechaNacimiento(mascota))}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <HeartIcon className="h-4 w-4 text-pink-500" />
                      <span className="text-xs text-gray-500">Especie / Raza</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{mascota.especie} • {mascota.raza || 'N/A'}</p>
                  </div>
                </div>

                {/* Datos clínicos */}
                {datosClinicos.length > 0 && (
                  <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                    <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      Datos importantes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {datosClinicos.map((dato, idx) => {
                        const IconComponent = dato.icon;
                        return (
                          <div key={idx} className="flex items-start gap-2">
                            <IconComponent className={`h-4 w-4 flex-shrink-0 mt-0.5 ${dato.color}`} />
                            <div>
                              <span className="text-xs font-medium text-gray-700">{dato.label}:</span>
                              <p className="text-sm text-gray-600">{dato.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Estadísticas */}
                {estadisticas && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-800">{estadisticas.total_citas}</p>
                      <p className="text-xs text-gray-500">Total citas</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-800">{estadisticas.citas_completadas}</p>
                      <p className="text-xs text-gray-500">Completadas</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-800">{estadisticas.fotos_registradas}</p>
                      <p className="text-xs text-gray-500">Fotos</p>
                    </div>
                  </div>
                )}

                {/* Historial de servicios */}
                {activeTab === 'historial' && mascota.citas && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Servicios realizados</h3>
                    {mascota.citas.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <ScissorsIcon className="h-10 w-10 mx-auto mb-2" />
                        <p>No hay servicios registrados</p>
                      </div>
                    ) : (
                      mascota.citas.map((cita) => (
                        <div key={cita.idCita} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                {new Date(cita.fechaHoraInicio).toLocaleString()}
                              </div>
                              <p className="font-medium text-gray-800 mt-1">{cita.servicio.nombre}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <UserIcon className="h-3 w-3" />
                                {cita.groomer.user.nombre} {cita.groomer.user.apellido}
                              </div>
                            </div>
                            {cita.fichaGrooming && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                Con ficha
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Fotos */}
                {activeTab === 'fotos' && (
                  <div className="space-y-6">
                    {/* Fotos de perfil */}
                    {fotosPerfil.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Foto de perfil</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {fotosPerfil.map((foto, idx) => (
                            <button
                              key={foto.idFoto}
                              onClick={() => handleFotoClick(allFotos.findIndex(f => f.url === foto.urlFoto))}
                              className="relative group"
                            >
                              <img
                                src={getImageUrl(foto.urlFoto)}
                                alt="Foto de perfil"
                                className="w-full aspect-square rounded-lg object-cover border-2 border-gray-200 hover:border-pink-500 transition-colors"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
                                }}
                              />
                              <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1 rounded">
                                Perfil
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fotos Antes */}
                    {fotosAntes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Antes del servicio</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {fotosAntes.map((foto, idx) => {
                            const globalIndex = allFotos.findIndex(f => f.url === foto.urlFoto);
                            return (
                              <button
                                key={foto.idFoto}
                                onClick={() => handleFotoClick(globalIndex)}
                                className="relative group"
                              >
                                <img
                                  src={getImageUrl(foto.urlFoto)}
                                  alt="Antes"
                                  className="w-full aspect-square rounded-lg object-cover border-2 border-gray-200 hover:border-pink-500 transition-colors"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
                                  }}
                                />
                                <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1 rounded">
                                  Antes
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fotos Después */}
                    {fotosDespues.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Después del servicio</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {fotosDespues.map((foto, idx) => {
                            const globalIndex = allFotos.findIndex(f => f.url === foto.urlFoto);
                            return (
                              <button
                                key={foto.idFoto}
                                onClick={() => handleFotoClick(globalIndex)}
                                className="relative group"
                              >
                                <img
                                  src={getImageUrl(foto.urlFoto)}
                                  alt="Después"
                                  className="w-full aspect-square rounded-lg object-cover border-2 border-gray-200 hover:border-pink-500 transition-colors"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
                                  }}
                                />
                                <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1 rounded">
                                  Después
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Mensaje si no hay fotos */}
                    {fotosPerfil.length === 0 && fotosAntes.length === 0 && fotosDespues.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <PhotoIcon className="h-10 w-10 mx-auto mb-2" />
                        <p>No hay fotos disponibles</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No se pudo cargar la ficha de la mascota
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && allFotos.length > 0 && (
        <Lightbox
          fotos={allFotos}
          initialIndex={selectedFotoIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>,
    document.body
  );
};
