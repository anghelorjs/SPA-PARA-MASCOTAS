// src/pages/admin/agenda/components/BloqueoForm.tsx
import { useState } from 'react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { adminAgendaService } from '../services/admin.agenda.service';
import { useToast } from '../../../../hooks/useToast';

interface BloqueoFormProps {
  groomers: { id: number; nombre: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface BloqueoFormData {
  groomer_id: string;
  fecha_desde: string;
  fecha_hasta: string;
  motivo: string;
}

export const BloqueoForm = ({ groomers, onSuccess, onCancel }: BloqueoFormProps) => {
  const [formData, setFormData] = useState<BloqueoFormData>({
    groomer_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    motivo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.groomer_id || !formData.fecha_desde || !formData.motivo) {
      showToast('Complete todos los campos requeridos', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminAgendaService.registrarBloqueo(
        parseInt(formData.groomer_id),
        formData.fecha_desde,
        formData.fecha_hasta || null,
        formData.motivo
      );
      showToast('Bloqueo registrado correctamente', 'success');
      setFormData({ groomer_id: '', fecha_desde: '', fecha_hasta: '', motivo: '' });
      onSuccess();
    } catch {
      showToast('Error al registrar bloqueo', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-800 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-purple-600" />
          Nuevo Bloqueo
        </h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          name="groomer_id"
          value={formData.groomer_id}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Seleccionar groomer</option>
          {groomers.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="fecha_desde"
          value={formData.fecha_desde}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Fecha desde"
        />

        <input
          type="date"
          name="fecha_hasta"
          value={formData.fecha_hasta}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Fecha hasta (opcional)"
        />

        <input
          type="text"
          name="motivo"
          value={formData.motivo}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Motivo (feriado/ausencia/mantenimiento)"
        />
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Bloqueo'}
        </button>
      </div>
    </div>
  );
};
