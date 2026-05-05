// src/pages/admin/configuracion/usuarios/components/ResetPasswordModal.tsx
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Usuario } from '../services/admin.usuarios.service';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: (newPassword: string) => Promise<boolean>;
  usuario: Usuario | null;
}

export const ResetPasswordModal = ({ isOpen, onClose, onReset, usuario }: ResetPasswordModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen]);

  const validate = () => {
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    const success = await onReset(newPassword);
    setIsLoading(false);

    if (success) {
      onClose();
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    setError('');
  };

  if (!isOpen || !usuario) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto', background: 'rgba(107,114,128,0.75)' }}
      onClick={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '16px' }}>
        {/* Detener propagación para que clicks dentro no cierren el modal */}
        <div
          style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Resetear Contraseña
              </h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <XMarkIcon style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Información del usuario */}
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '20px' }}>
              Usuario: <span style={{ fontWeight: 500, color: '#111827' }}>{usuario.nombre} {usuario.apellido}</span>
            </p>

            {/* Campos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Nueva Contraseña */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Nueva Contraseña
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Nueva contraseña"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => {
                      if (!error) e.target.style.borderColor = '#d1d5db';
                    }}
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      color: '#2563eb',
                      border: '1px solid #2563eb',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                  >
                    Generar
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Confirmar Contraseña
                </label>
                <input
                  type="text"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Confirmar contraseña"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => {
                    if (!error) e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '-8px 0 0 0' }}>{error}</p>
              )}

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#4b5563',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'white',
                    background: '#f97316',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = '#ea580c';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = '#f97316';
                  }}
                >
                  {isLoading ? 'Guardando...' : 'Resetear Contraseña'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};