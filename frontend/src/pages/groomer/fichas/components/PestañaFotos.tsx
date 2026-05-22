// src/pages/groomer/fichas/components/PestañaFotos.tsx
import { useRef, useState, useEffect } from 'react';
import { CameraIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { FotoFicha, GaleriaHistorica } from '../types';

interface PestañaFotosProps {
  fotosAntes: FotoFicha[];
  fotosDespues: FotoFicha[];
  galeriaHistorica: GaleriaHistorica[];
  isOpen: boolean;
  isSaving: boolean;
  onUploadFoto: (tipo: 'antes' | 'despues', file: File) => Promise<any>;
  onDeleteFoto: (fotoId: number) => void;
}

interface PreviewFoto {
  id: string;
  tipo: 'antes' | 'despues';
  url: string;
}

export const PestañaFotos = ({
  fotosAntes,
  fotosDespues,
  galeriaHistorica,
  isOpen,
  isSaving,
  onUploadFoto,
  onDeleteFoto,
}: PestañaFotosProps) => {
  const [uploadingTipo, setUploadingTipo] = useState<'antes' | 'despues' | null>(null);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);
  const [previews, setPreviews] = useState<PreviewFoto[]>([]);
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const fileInputRefAntes = useRef<HTMLInputElement>(null);
  const fileInputRefDespues = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, []);

  const revokePreviewUrl = (url: string) => {
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  };

  const handleFileSelect = async (tipo: 'antes' | 'despues', file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    // Crear ID único para el preview
    const previewId = `preview-${Date.now()}-${Math.random()}`;
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(previewUrl);

    // Agregar preview
    setPreviews(prev => [...prev, {
      id: previewId,
      tipo,
      url: previewUrl
    }]);

    // Subir al servidor
    setUploadingTipo(tipo);
    try {
      await onUploadFoto(tipo, file);
      setPreviews(prev => prev.filter(p => p.id !== previewId));
      revokePreviewUrl(previewUrl);
    } catch (error) {
      console.error('Error al subir foto:', error);
      // Si hay error, eliminar el preview y revocar URL
      setPreviews(prev => prev.filter(p => p.id !== previewId));
      revokePreviewUrl(previewUrl);
    } finally {
      setUploadingTipo(null);
    }
  };

  // Función para obtener todas las fotos (incluyendo previews)
  const getFotosConPreview = (tipo: 'antes' | 'despues', fotos: FotoFicha[]) => {
    const previewsDelTipo = previews.filter(p => p.tipo === tipo).map(p => ({
      id: p.id,
      url: p.url,
      tipo: tipo,
      fecha: '',
      isPreview: true,
      isUploading: uploadingTipo === tipo
    }));
    return [...previewsDelTipo, ...fotos];
  };

  const FotoGrid = ({ fotos, titulo, tipo }: { fotos: FotoFicha[]; titulo: string; tipo: 'antes' | 'despues' }) => {
    const todasLasFotos = getFotosConPreview(tipo, fotos);
    const isUploading = uploadingTipo === tipo;

    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800">{titulo}</h4>
          {isOpen && (
            <>
              <input
                ref={tipo === 'antes' ? fileInputRefAntes : fileInputRefDespues}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(tipo, file);
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => (tipo === 'antes' ? fileInputRefAntes : fileInputRefDespues).current?.click()}
                disabled={isUploading || isSaving}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <CameraIcon className="h-4 w-4" />
                {isUploading ? 'Subiendo...' : 'Subir foto'}
              </button>
            </>
          )}
        </div>

        {todasLasFotos.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
            <CameraIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No hay fotos {tipo === 'antes' ? 'antes' : 'después'} del servicio</p>
            {isOpen && (
              <p className="text-xs text-gray-400 mt-2">
                Haz clic en "Subir foto" para agregar imágenes
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {todasLasFotos.map((foto: any) => (
              <div key={foto.id} className="relative group">
                <button
                  onClick={() => setSelectedFoto(foto.url)}
                  className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                >
                  <img 
                    src={foto.url} 
                    alt="Foto" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Si la imagen falla al cargar, mostrar placeholder
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
                    }}
                  />
                </button>
                {isOpen && !foto.isPreview && (
                  <button
                    onClick={() => onDeleteFoto(foto.id)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                )}
                {foto.isPreview && (
                  <div className={`absolute top-1 right-1 p-1 rounded-full ${foto.isUploading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}>
                    <div className="h-3 w-3 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Fotos Antes */}
      <FotoGrid fotos={fotosAntes} titulo="📸 Antes del servicio" tipo="antes" />

      {/* Fotos Después */}
      <FotoGrid fotos={fotosDespues} titulo="✨ Después del servicio" tipo="despues" />

      {/* Galería histórica */}
      {galeriaHistorica.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">📷 Galería histórica de esta mascota</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galeriaHistorica.map((foto) => (
              <button
                key={foto.id}
                onClick={() => setSelectedFoto(foto.url)}
                className="relative group"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
                  <img 
                    src={foto.url} 
                    alt={`${foto.servicio} - ${foto.tipo}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg truncate">
                  {foto.servicio}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedFoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-pointer"
          onClick={() => setSelectedFoto(null)}
        >
          <img 
            src={selectedFoto} 
            alt="Foto ampliada" 
            className="max-w-[90vw] max-h-[90vh] object-contain" 
          />
          <button
            onClick={() => setSelectedFoto(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};
