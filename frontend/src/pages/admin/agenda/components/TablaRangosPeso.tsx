// src/pages/admin/agenda/components/TablaRangosPeso.tsx
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { RangoPeso } from '../types';

interface TablaRangosPesoProps {
  rangos: RangoPeso[];
  isLoading: boolean;
  onEdit: (rango: RangoPeso) => void;
  onDelete: (id: number, nombre: string) => void;
  onNuevo: () => void;
}

export const TablaRangosPeso = ({
  rangos,
  isLoading,
  onEdit,
  onDelete,
  onNuevo,
}: TablaRangosPesoProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (rangos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">
        <p>No hay rangos de peso registrados</p>
        <button
          onClick={onNuevo}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo Rango
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Peso (kg)</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Factor Tiempo</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Factor Precio</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rangos.map((rango) => (
            <tr key={rango.idRango} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{rango.nombre}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {rango.pesoMinKg} - {rango.pesoMaxKg} kg
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-600">×{rango.factorTiempo}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-600">×{rango.factorPrecio}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(rango)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(rango.idRango, rango.nombre)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
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
  );
};