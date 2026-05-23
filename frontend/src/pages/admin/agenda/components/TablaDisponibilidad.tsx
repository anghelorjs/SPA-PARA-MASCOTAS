// src/pages/admin/agenda/components/TablaDisponibilidad.tsx
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { DIAS_SEMANA } from '../types';
import { adminAgendaService } from '../services/admin.agenda.service';
import { useToast } from '../../../../hooks/useToast';

interface DisponibilidadDia {
  id: number;
  diaSemana: number;
  diaNombre: string;
  horaInicio: string;
  horaFin: string;
}

interface GroomerDisponibilidad {
  id: number;
  nombre: string;
  especialidad: string | null;
  maxServiciosSimultaneos: number;
  disponibilidades: DisponibilidadDia[];
}

interface TablaDisponibilidadProps {
  groomer: GroomerDisponibilidad;
  onRefresh: () => void;
}

export const TablaDisponibilidad = ({ groomer, onRefresh }: TablaDisponibilidadProps) => {
  const [editando, setEditando] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ horaInicio: string; horaFin: string }>({
    horaInicio: '',
    horaFin: '',
  });
  const { showToast } = useToast();

  const handleEdit = (disponibilidad: DisponibilidadDia) => {
    setEditando(disponibilidad.id);
    setEditValues({
      horaInicio: disponibilidad.horaInicio.substring(0, 5),
      horaFin: disponibilidad.horaFin.substring(0, 5),
    });
  };

  const handleSave = async (id: number) => {
    if (editValues.horaInicio >= editValues.horaFin) {
      showToast('La hora de inicio debe ser menor que la hora de fin', 'error');
      return;
    }

    try {
      await adminAgendaService.saveDisponibilidad(groomer.id, [
        ...groomer.disponibilidades
          .filter((d) => d.id !== id)
          .map((d) => ({
            diaSemana: d.diaSemana,
            horaInicio: d.horaInicio.substring(0, 5),
            horaFin: d.horaFin.substring(0, 5),
          })),
        {
          diaSemana: groomer.disponibilidades.find((d) => d.id === id)!.diaSemana,
          horaInicio: editValues.horaInicio,
          horaFin: editValues.horaFin,
        },
      ]);
      showToast('Disponibilidad actualizada correctamente', 'success');
      setEditando(null);
      onRefresh();
    } catch {
      showToast('Error al guardar disponibilidad', 'error');
    }
  };

  const handleCancel = () => {
    setEditando(null);
  };

  // Crear un mapa de disponibilidad por día
  const disponibilidadMap = new Map(
    groomer.disponibilidades.map((d) => [d.diaSemana, d])
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Día</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Horario</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {DIAS_SEMANA.map((dia) => {
            const disponibilidad = disponibilidadMap.get(dia.id);
            const isEditing = editando === disponibilidad?.id;

            return (
              <tr key={dia.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{dia.nombre}</td>
                <td className="px-4 py-3">
                  {disponibilidad ? (
                    isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={editValues.horaInicio}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, horaInicio: e.target.value }))}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={editValues.horaFin}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, horaFin: e.target.value }))}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {disponibilidad.horaInicio.substring(0, 5)} - {disponibilidad.horaFin.substring(0, 5)}
                      </span>
                    )
                  ) : (
                    <span className="text-sm text-gray-400">No disponible</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {disponibilidad && (
                    isEditing ? (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleSave(disponibilidad.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(disponibilidad)}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
