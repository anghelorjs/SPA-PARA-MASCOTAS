// src/pages/admin/catalogo/categorias/components/CategoriasTable.tsx
import { PencilIcon, TrashIcon, TagIcon, CubeIcon, BeakerIcon } from '@heroicons/react/24/outline';
import type { Categoria } from '../../../../../services/types/admin';

interface CategoriasTableProps {
  categorias: Categoria[];
  isLoading: boolean;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number, nombre: string) => void;
}

const TIPO_LABELS: Record<string, string> = {
  producto: 'Producto',
  insumo: 'Insumo',
};

const TIPO_COLORS: Record<string, string> = {
  producto: 'bg-blue-100 text-blue-800',
  insumo: 'bg-green-100 text-green-800',
};

const TIPO_ICONS: Record<string, React.ReactNode> = {
  producto: <CubeIcon className="h-3.5 w-3.5" />,
  insumo: <BeakerIcon className="h-3.5 w-3.5" />,
};

export const CategoriasTable = ({ categorias, isLoading, onEdit, onDelete }: CategoriasTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No hay categorías registradas
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items Asociados
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categorias.map((categoria) => (
              <tr key={categoria.idCategoria} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{categoria.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${TIPO_COLORS[categoria.tipo]}`}>
                    {TIPO_ICONS[categoria.tipo]}
                    {TIPO_LABELS[categoria.tipo]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-md truncate">
                    {categoria.descripcion || 'Sin descripción'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-600">
                    {categoria.tipo === 'producto' 
                      ? `${categoria.productos_count || 0} productos`
                      : `${categoria.insumos_count || 0} insumos`
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(categoria)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(categoria.idCategoria, categoria.nombre)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};