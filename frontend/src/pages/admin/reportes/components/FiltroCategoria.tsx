// src/pages/admin/reportes/components/FiltroCategoria.tsx
import { useState, useEffect } from 'react';
import { TagIcon } from '@heroicons/react/24/outline';
import { adminCategoriasService } from '../../catalogo/categorias/services/admin.categorias.service';

interface FiltroCategoriaProps {
  categoriaId: number | undefined;
  onCategoriaChange: (id: number | undefined) => void;
  isLoading?: boolean;
}

export const FiltroCategoria = ({ categoriaId, onCategoriaChange, isLoading }: FiltroCategoriaProps) => {
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const response = await adminCategoriasService.getCategorias(undefined, 1);
        setCategorias(response.data.map((categoria) => ({ id: categoria.idCategoria, nombre: categoria.nombre })));
      } catch (error) {
        console.error('Error al cargar categorias:', error);
      }
    };
    loadCategorias();
  }, []);

  return (
    <label className="min-w-0 flex-1 xl:flex-none">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <TagIcon className="h-4 w-4 shrink-0" />
        Categoria
      </span>
      <select
        value={categoriaId || ''}
        onChange={(e) => onCategoriaChange(e.target.value ? parseInt(e.target.value) : undefined)}
        disabled={isLoading}
        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 sm:min-w-[220px]"
      >
        <option value="">Todas las categorias</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
    </label>
  );
};
