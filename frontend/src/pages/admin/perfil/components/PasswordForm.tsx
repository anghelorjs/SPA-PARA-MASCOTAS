// src/pages/admin/perfil/components/PasswordForm.tsx
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordFormProps {
  onChangePassword: (data: {
    password_actual: string;
    password_nuevo: string;
    password_nuevo_confirmation: string;
  }) => Promise<boolean>;
  isChangingPassword: boolean;
}

export const PasswordForm = ({ onChangePassword, isChangingPassword }: PasswordFormProps) => {
  const [formData, setFormData] = useState({
    password_actual: '',
    password_nuevo: '',
    password_nuevo_confirmation: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nuevo: false,
    confirmacion: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error del campo que se está editando
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.password_actual) {
      newErrors.password_actual = 'La contraseña actual es requerida';
    }
    if (!formData.password_nuevo) {
      newErrors.password_nuevo = 'La nueva contraseña es requerida';
    } else if (formData.password_nuevo.length < 6) {
      newErrors.password_nuevo = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password_nuevo !== formData.password_nuevo_confirmation) {
      newErrors.password_nuevo_confirmation = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const success = await onChangePassword(formData);
    if (success) {
      setFormData({
        password_actual: '',
        password_nuevo: '',
        password_nuevo_confirmation: '',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
          <div className="relative">
            <input
              type={showPasswords.actual ? 'text' : 'password'}
              name="password_actual"
              value={formData.password_actual}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password_actual ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('actual')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.actual ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {errors.password_actual && (
            <p className="mt-1 text-sm text-red-500">{errors.password_actual}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
          <div className="relative">
            <input
              type={showPasswords.nuevo ? 'text' : 'password'}
              name="password_nuevo"
              value={formData.password_nuevo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password_nuevo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('nuevo')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.nuevo ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {errors.password_nuevo && (
            <p className="mt-1 text-sm text-red-500">{errors.password_nuevo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
          <div className="relative">
            <input
              type={showPasswords.confirmacion ? 'text' : 'password'}
              name="password_nuevo_confirmation"
              value={formData.password_nuevo_confirmation}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password_nuevo_confirmation ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmacion')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirmacion ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {errors.password_nuevo_confirmation && (
            <p className="mt-1 text-sm text-red-500">{errors.password_nuevo_confirmation}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  );
};