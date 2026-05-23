// src/pages/admin/agenda/components/TablaServicios.tsx`
import { useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import type { Servicio, RangoPeso } from '../types';

interface TablaServiciosProps {
  servicios: Servicio[];
  rangos: RangoPeso[];
  isLoading: boolean;
  onEdit: (servicio: Servicio) => void;
  onDelete: (id: number, nombre: string) => void;
  onNuevo: () => void;
}

export const TablaServicios = ({
  servicios,
  rangos,
  isLoading,
  onEdit,
  onDelete,
  onNuevo,
}: TablaServiciosProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (servicios.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">
        <p>No hay servicios registrados</p>
        <button
          onClick={onNuevo}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo Servicio
        </button>
      </div>
    );
  }

  const getRangoInfo = (idRango: number) => {
    return rangos.find((r) => r.idRango === idRango);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={onNuevo}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo Servicio
        </button>
      </div>

      {servicios.map((servicio) => (
        <div key={servicio.idServicio} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header del servicio */}
          <div
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleExpand(servicio.idServicio)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900">{servicio.nombre}</h3>
                {servicio.admiteDobleBooking && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    Doble booking
                  </span>
                )}
              </div>
              <div className="flex gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  Duración base: {servicio.duracionMinutos} min
                </span>
                <span className="flex items-center gap-1">
                  <CurrencyDollarIcon className="h-3 w-3" />
                  Precio base: Bs. {Number(servicio.precioBase).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(servicio);
                }}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                title="Editar"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(servicio.idServicio, servicio.nombre);
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                title="Eliminar"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              {expandedId === servicio.idServicio ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Subtabla de rangos (expandida) */}
          {expandedId === servicio.idServicio && (
            <div className="p-4 bg-white border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Precios por rango de peso</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rango</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Peso (kg)</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Duración ajustada</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio ajustado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {servicio.rangosPeso.map((rango) => {
                      const rangoInfo = getRangoInfo(rango.idRango);
                      return (
                        <tr key={rango.idRango} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-800">{rangoInfo?.nombre || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {rangoInfo?.pesoMinKg} - {rangoInfo?.pesoMaxKg} kg
                          </td>
                          <td className="px-4 py-2 text-sm text-center text-gray-600">
                            {rango.duracionAjustadaMin} min
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-green-600">
                            Bs. {Number(rango.precioAjustado).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};