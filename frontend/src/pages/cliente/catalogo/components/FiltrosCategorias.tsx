// src/pages/cliente/catalogo/components/FiltrosCategorias.tsx
import type { CategoriaCatalogo } from '../../../../services/types/cliente';

interface FiltrosCategoriasProps {
  categorias: CategoriaCatalogo[];
  categoriaSeleccionada: number | null;
  onCategoriaChange: (categoriaId: number | null) => void;
}

export const FiltrosCategorias = ({
  categorias,
  categoriaSeleccionada,
  onCategoriaChange,
}: FiltrosCategoriasProps) => {
  if (categorias.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoriaChange(null)}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
          categoriaSeleccionada === null
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Todos
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoriaChange(cat.id)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
            categoriaSeleccionada === cat.id
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.nombre}
          {cat.cantidad_productos > 0 && (
            <span className="ml-1 text-xs opacity-75">({cat.cantidad_productos})</span>
          )}
        </button>
      ))}
    </div>
  );
};