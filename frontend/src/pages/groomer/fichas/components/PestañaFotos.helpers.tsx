import { useRef, useState, useEffect, type RefObject } from 'react';
import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { FotoFicha } from '../types';

export interface PreviewFoto {
  id: string;
  tipo: 'antes' | 'despues';
  url: string;
  uploading: boolean;
}

export type FotoItem =
  | FotoFicha
  | (Omit<FotoFicha, 'id' | 'fecha'> & {
      id: string;
      fecha: string;
      isPreview: true;
      uploading: true;
    });

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"%3E%3Crect width="80" height="80" fill="%23f1f5f9"/%3E%3Cpath d="M24 52l12-14 8 10 6-7 10 11H24z" fill="%23cbd5e1"/%3E%3Ccircle cx="50" cy="30" r="5" fill="%23cbd5e1"/%3E%3C/svg%3E';

export const ImgWithFallback = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative w-full h-full ${className ?? ''}`}>
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      <img
        key={src}
        ref={imgRef}
        src={errored ? PLACEHOLDER : src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-200"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
      />
    </div>
  );
};

interface FotoGridProps {
  fotos: FotoItem[];
  titulo: string;
  tipo: 'antes' | 'despues';
  isOpen: boolean;
  isSaving: boolean;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelected: (file: File) => void;
  onSelectFoto: (url: string) => void;
  onDeleteFoto: (fotoId: number) => void;
}

export const FotoGrid = ({
  fotos,
  titulo,
  tipo,
  isOpen,
  isSaving,
  isUploading,
  fileInputRef,
  onFileSelected,
  onSelectFoto,
  onDeleteFoto,
}: FotoGridProps) => (
  <div>
    <div className="flex justify-between items-center mb-3">
      <h4 className="font-medium text-gray-800">{titulo}</h4>
      {isOpen && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileSelected(file);
              }
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSaving}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CameraIcon className="h-4 w-4" />
            {isUploading ? 'Subiendo...' : 'Subir foto'}
          </button>
        </>
      )}
    </div>

    {fotos.length === 0 ? (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
        <CameraIcon className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">
          No hay fotos {tipo === 'antes' ? 'antes' : 'después'} del servicio
        </p>
        {isOpen && (
          <p className="text-xs text-gray-400 mt-2">
            Haz clic en "Subir foto" para agregar imágenes
          </p>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {fotos.map((foto) => (
          <div key={('isPreview' in foto && foto.isPreview) ? foto.id : `server-${foto.id}`} className="relative group">
            <button
              onClick={() => !('uploading' in foto && foto.uploading) && onSelectFoto(foto.url)}
              disabled={('uploading' in foto && foto.uploading) ?? false}
              className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors disabled:cursor-not-allowed"
            >
              <ImgWithFallback src={foto.url} alt="Foto del servicio" />
            </button>

            {('isPreview' in foto && foto.isPreview && foto.uploading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg pointer-events-none">
                <div className="bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-blue-700 font-medium">Subiendo</span>
                </div>
              </div>
            )}

            {isOpen && !(('isPreview' in foto && foto.isPreview)) && (
              <button
                onClick={() => onDeleteFoto(foto.id as number)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
