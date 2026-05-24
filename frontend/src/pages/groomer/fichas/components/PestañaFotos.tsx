// src/pages/groomer/fichas/components/PestañaFotos.tsx
import { useRef, useState, useEffect, useCallback } from 'react';
import { XMarkIcon, CameraIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { FotoFicha, GaleriaHistorica } from '../types';
import { FotoGrid, ImgWithFallback, type FotoItem, type PreviewFoto } from './PestañaFotos.helpers';

interface PestañaFotosProps {
  fotosAntes: FotoFicha[];
  fotosDespues: FotoFicha[];
  galeriaHistorica: GaleriaHistorica[];
  isOpen: boolean;
  isSaving: boolean;
  onUploadFoto: (tipo: 'antes' | 'despues', file: File) => Promise<void>;
  onDeleteFoto: (fotoId: number) => void;
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
  const previewIdCounterRef = useRef(0);
  const fileInputRefAntes = useRef<HTMLInputElement>(null);
  const fileInputRefDespues = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = Array.from(previewUrlsRef.current);
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  const removePreview = useCallback((previewId: string, previewUrl: string) => {
    setPreviews((prev) => prev.filter((p) => p.id !== previewId));
    setTimeout(() => {
      URL.revokeObjectURL(previewUrl);
      previewUrlsRef.current.delete(previewUrl);
    }, 500);
  }, []);

  const handleFileSelect = async (tipo: 'antes' | 'despues', file: File) => {
    if (!file.type.startsWith('image/')) { alert('Por favor selecciona una imagen válida'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('La imagen no puede superar los 5MB'); return; }

    previewIdCounterRef.current += 1;
    const previewId = `preview-${previewIdCounterRef.current}`;
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(previewUrl);

    setPreviews((prev) => [...prev, { id: previewId, tipo, url: previewUrl, uploading: true }]);
    setUploadingTipo(tipo);

    try {
      await onUploadFoto(tipo, file);
      removePreview(previewId, previewUrl);
    } catch (error) {
      console.error('Error al subir foto:', error);
      removePreview(previewId, previewUrl);
    } finally {
      setUploadingTipo(null);
    }
  };

  const getFotosConPreview = (tipo: 'antes' | 'despues', fotos: FotoFicha[]): FotoItem[] => {
    const previewsDelTipo: FotoItem[] = previews
      .filter((p) => p.tipo === tipo)
      .map((p) => ({ id: p.id, url: p.url, tipo, fecha: '', isPreview: true, uploading: true }));
    return [...fotos, ...previewsDelTipo];
  };

  // Títulos con íconos en lugar de emojis
  const tituloAntes = (
    <span className="flex items-center gap-2 font-medium text-gray-800">
      <CameraIcon className="h-4 w-4 text-gray-500" />
      Antes del servicio
    </span>
  );

  const tituloDespues = (
    <span className="flex items-center gap-2 font-medium text-gray-800">
      <SparklesIcon className="h-4 w-4 text-gray-500" />
      Después del servicio
    </span>
  );

  return (
    <div className="space-y-8">
      <FotoGrid
        fotos={getFotosConPreview('antes', fotosAntes)}
        titulo={tituloAntes as unknown as string}
        tipo="antes"
        isOpen={isOpen}
        isSaving={isSaving}
        isUploading={uploadingTipo === 'antes'}
        fileInputRef={fileInputRefAntes}
        onFileSelected={(file) => handleFileSelect('antes', file)}
        onSelectFoto={setSelectedFoto}
        onDeleteFoto={onDeleteFoto}
      />
      <FotoGrid
        fotos={getFotosConPreview('despues', fotosDespues)}
        titulo={tituloDespues as unknown as string}
        tipo="despues"
        isOpen={isOpen}
        isSaving={isSaving}
        isUploading={uploadingTipo === 'despues'}
        fileInputRef={fileInputRefDespues}
        onFileSelected={(file) => handleFileSelect('despues', file)}
        onSelectFoto={setSelectedFoto}
        onDeleteFoto={onDeleteFoto}
      />

      {galeriaHistorica.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 font-medium text-gray-800 mb-3">
            <PhotoIcon className="h-4 w-4 text-gray-500" />
            Galería histórica de esta mascota
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galeriaHistorica.map((foto) => (
              <button
                key={foto.id}
                onClick={() => setSelectedFoto(foto.url)}
                className="relative group"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
                  <ImgWithFallback src={foto.url} alt={`${foto.servicio} - ${foto.tipo}`} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg truncate">
                  {foto.servicio}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedFoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedFoto(null)}
        >
          <img src={selectedFoto} alt="Foto ampliada" className="max-w-[90vw] max-h-[90vh] object-contain" />
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