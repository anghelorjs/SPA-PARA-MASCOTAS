// src/pages/groomer/perfil/components/PerfilForm.tsx
import { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PerfilFormProps {
  initialData: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    especialidad: string | null;
    max_servicios_simultaneos: number;
  };
  onSave: (data: { telefono?: string }) => Promise<boolean>;
  isSaving: boolean;
}

export const PerfilForm = ({ initialData, onSave, isSaving }: PerfilFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [telefono, setTelefono] = useState(initialData.telefono || '');

  useEffect(() => {
    setTelefono(initialData.telefono || '');
  }, [initialData.telefono]);

  const handleSubmit = async () => {
    if (telefono === (initialData.telefono || '')) {
      setIsEditing(false);
      return;
    }
    
    const success = await onSave({ telefono: telefono || undefined });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTelefono(initialData.telefono || '');
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
            <p className="mt-1 text-gray-900">{initialData.nombre}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Apellido</label>
            <p className="mt-1 text-gray-900">{initialData.apellido}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Correo electrónico</label>
            <p className="mt-1 text-gray-900">{initialData.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Teléfono</label>
            <p className="mt-1 text-gray-900">{initialData.telefono || 'No especificado'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Especialidad</label>
            <p className="mt-1 text-gray-900">{initialData.especialidad || 'No asignada'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Máx. Servicios Simultáneos</label>
            <p className="mt-1 text-gray-900">{initialData.max_servicios_simultaneos}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Editar Teléfono</h3>
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
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="No especificado"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            ⚠️ Solo el teléfono puede ser editado. El resto de los datos son gestionados por el administrador.
          </p>
        </div>
      </div>
    </div>
  );
};