// src/pages/admin/perfil/components/PerfilForm.tsx
import { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PerfilFormProps {
  initialData: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
  };
  onSave: (data: { nombre?: string; apellido?: string; telefono?: string; email?: string }) => Promise<boolean>;
  isSaving: boolean;
}

export const PerfilForm = ({ initialData, onSave, isSaving }: PerfilFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    setFormData({
      nombre: initialData.nombre,
      apellido: initialData.apellido,
      telefono: initialData.telefono || '',
      email: initialData.email,
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const changedData: { nombre?: string; apellido?: string; telefono?: string; email?: string } = {};
    
    if (formData.nombre !== initialData.nombre) changedData.nombre = formData.nombre;
    if (formData.apellido !== initialData.apellido) changedData.apellido = formData.apellido;
    if (formData.telefono !== (initialData.telefono || '')) changedData.telefono = formData.telefono;
    if (formData.email !== initialData.email) changedData.email = formData.email;
    
    if (Object.keys(changedData).length === 0) {
      setIsEditing(false);
      return;
    }
    
    const success = await onSave(changedData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: initialData.nombre,
      apellido: initialData.apellido,
      telefono: initialData.telefono || '',
      email: initialData.email,
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Nombre</label>
            <p className="mt-1 text-gray-900">{formData.nombre}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Apellido</label>
            <p className="mt-1 text-gray-900">{formData.apellido}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Correo electrónico</label>
            <p className="mt-1 text-gray-900">{formData.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Teléfono</label>
            <p className="mt-1 text-gray-900">{formData.telefono || 'No especificado'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Editar Datos Personales</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="p-1.5 text-green-600 hover:text-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="No especificado"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};