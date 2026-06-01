import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HeartIcon, ScaleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { CreateMascotaData, MascotaRecepcionista } from '../services/recepcionista.clientes.service';

interface Props {
  isOpen: boolean;
  idCliente: number | null;
  mascota: MascotaRecepcionista | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateMascotaData) => Promise<boolean>;
}

const initialForm = {
  nombre: '',
  especie: 'perro',
  raza: '',
  pesoKg: '',
};

export const ModalMascotaForm = ({ isOpen, idCliente, mascota, isLoading, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!mascota;

  useEffect(() => {
    if (!isOpen) return;
    if (mascota) {
      setFormData({
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza || '',
        pesoKg: String(mascota.pesoKg || ''),
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
  }, [isOpen, mascota]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) nextErrors.nombre = 'El nombre es requerido';
    if (!formData.especie.trim()) nextErrors.especie = 'La especie es requerida';
    if (!formData.pesoKg || Number(formData.pesoKg) <= 0) nextErrors.pesoKg = 'El peso debe ser mayor a 0';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!idCliente || !validate()) return;
    const success = await onSave({
      idCliente,
      nombre: formData.nombre.trim(),
      especie: formData.especie.trim(),
      raza: formData.raza.trim() || undefined,
      pesoKg: Number(formData.pesoKg),
    });
    if (success) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-600 to-rose-600">
          <div>
            <h2 className="text-lg font-semibold text-white">{isEditing ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
            <p className="text-xs text-pink-100">El rango se asigna por peso al guardar</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <div className="relative">
              <HeartIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input name="nombre" value={formData.nombre} onChange={handleChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
              <select name="especie" value={formData.especie} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input name="raza" value={formData.raza} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso kg *</label>
            <div className="relative">
              <ScaleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="number" step="0.1" min="0" name="pesoKg" value={formData.pesoKg} onChange={handleChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${errors.pesoKg ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            {errors.pesoKg && <p className="mt-1 text-xs text-red-500">{errors.pesoKg}</p>}
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50">
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
