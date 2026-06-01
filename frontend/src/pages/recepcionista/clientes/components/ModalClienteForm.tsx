import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { ClienteRecepcionista, CreateClienteData } from '../services/recepcionista.clientes.service';

interface Props {
  isOpen: boolean;
  cliente: ClienteRecepcionista | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateClienteData) => Promise<boolean>;
}

const initialForm: CreateClienteData & { preferenciasTexto: string } = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  preferencias: [],
  preferenciasTexto: '',
  canalContacto: 'whatsapp',
};

const normalizeList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

export const ModalClienteForm = ({ isOpen, cliente, isLoading, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!cliente;

  useEffect(() => {
    if (!isOpen) return;
    if (cliente) {
      const preferencias = normalizeList(cliente.preferencias);
      setFormData({
        nombre: cliente.user.nombre,
        apellido: cliente.user.apellido,
        email: cliente.user.email,
        telefono: cliente.user.telefono || '',
        direccion: cliente.direccion || '',
        preferencias,
        preferenciasTexto: preferencias.join(', '),
        canalContacto: cliente.canalContacto || 'whatsapp',
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
  }, [isOpen, cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) nextErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) nextErrors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) nextErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = 'Email inválido';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const preferencias = formData.preferenciasTexto
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const success = await onSave({ ...formData, preferencias });
    if (success) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg font-semibold text-white">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <p className="text-xs text-blue-100">Datos personales y contacto</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input name="nombre" value={formData.nombre} onChange={handleChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
            <input name="apellido" value={formData.apellido} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.apellido ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input name="direccion" value={formData.direccion} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canal de contacto</label>
            <div className="relative">
              <ChatBubbleLeftRightIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select name="canalContacto" value={formData.canalContacto} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferencias</label>
            <textarea name="preferenciasTexto" value={formData.preferenciasTexto} onChange={handleChange} rows={2} placeholder="Separadas por coma" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
