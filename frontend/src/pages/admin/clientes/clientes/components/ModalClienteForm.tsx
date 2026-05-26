// src/pages/admin/clientes/clientes/components/ModalClienteForm.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon as EmailIcon
} from '@heroicons/react/24/outline';
import type { ClienteAdmin, CreateClienteAdminData, UpdateClienteAdminData } from '../../../../../services/types/admin';

interface ModalClienteFormProps {
  isOpen: boolean;
  cliente: ClienteAdmin | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateClienteAdminData | UpdateClienteAdminData) => Promise<boolean>;
}

const initialForm: CreateClienteAdminData = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  canalContacto: 'whatsapp',
};

const CANALES = [
  { value: 'whatsapp', label: 'WhatsApp', icon: <ChatBubbleLeftRightIcon className="h-4 w-4" />, iconColor: 'text-green-500' },
  { value: 'telegram', label: 'Telegram', icon: <DevicePhoneMobileIcon className="h-4 w-4" />, iconColor: 'text-blue-500' },
  { value: 'email', label: 'Email', icon: <EmailIcon className="h-4 w-4" />, iconColor: 'text-purple-500' },
  { value: 'sms', label: 'SMS', icon: <DevicePhoneMobileIcon className="h-4 w-4" />, iconColor: 'text-gray-500' },
];

export const ModalClienteForm = ({ isOpen, cliente, isLoading, onClose, onSave }: ModalClienteFormProps) => {
  const [formData, setFormData] = useState<CreateClienteAdminData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!cliente;

  useEffect(() => {
    if (isOpen) {
      if (cliente) {
        setFormData({
          nombre: cliente.user.nombre,
          apellido: cliente.user.apellido,
          email: cliente.user.email,
          telefono: cliente.user.telefono || '',
          direccion: cliente.direccion || '',
          canalContacto: cliente.canalContacto || 'whatsapp',
        });
      } else {
        setFormData(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await onSave(formData);
    if (success) onClose();
  };

  if (!isOpen) return null;

  const selectedCanal = CANALES.find(c => c.value === formData.canalContacto);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-xs text-blue-100">Datos personales y contacto</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan"
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.apellido ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Pérez"
              />
              {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="juan@ejemplo.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+591 7XX XXX XXX"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Calle, ciudad..."
              />
            </div>
          </div>

          {/* Canal de contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canal de contacto</label>
            <select
              name="canalContacto"
              value={formData.canalContacto}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CANALES.map(canal => (
                <option key={canal.value} value={canal.value}>
                  {canal.label}
                </option>
              ))}
            </select>
            
            {/* Vista previa del canal seleccionado */}
            {selectedCanal && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                <span className={selectedCanal.iconColor}>{selectedCanal.icon}</span>
                <span className="text-sm text-gray-600">
                  Notificaciones se enviarán por <span className="font-medium">{selectedCanal.label}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Cliente'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};