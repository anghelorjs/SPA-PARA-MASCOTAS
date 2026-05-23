// src/pages/recepcionista/agenda/components/NuevoClienteModal.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { recepcionistaClienteService } from '../../clientes/services/recepcionista.clientes.service';
import type { ClienteSearchResult } from '../services/recepcionista.agenda.service';
import { useToast } from '../../../../hooks/useToast';

type CanalContacto = 'whatsapp' | 'telegram' | 'email' | 'sms';

interface ClienteCreadoResponse {
  idCliente: number;
  user: { nombre: string; apellido: string; telefono?: string | null; email: string };
  direccion?: string | null;
  canalContacto?: CanalContacto | null;
}

interface NuevoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClienteCreado: (cliente: ClienteSearchResult) => void;
  createCliente?: (data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    direccion?: string;
    canalContacto?: CanalContacto;
  }) => Promise<ClienteCreadoResponse>;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
};

const initialForm = {
  nombre: '', apellido: '', email: '', telefono: '',
  direccion: '', canalContacto: 'whatsapp' as CanalContacto,
};

export const NuevoClienteModal = ({ isOpen, onClose, onClienteCreado, createCliente }: NuevoClienteModalProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleClose = () => { setFormData(initialForm); setErrors({}); onClose(); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await (createCliente ?? recepcionistaClienteService.createCliente)({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        canalContacto: formData.canalContacto,
      }) as ClienteCreadoResponse;

      showToast('Cliente creado exitosamente', 'success');
      onClienteCreado({
        id: response.idCliente,
        nombre: `${response.user.nombre} ${response.user.apellido}`,
        telefono: response.user.telefono || '',
        email: response.user.email,
        direccion: response.direccion || '',
        canal_contacto: response.canalContacto || 'whatsapp',
      });
      handleClose();
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al crear cliente'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <style>{modalStyles}</style>
      {/* Overlay separado del posicionador para evitar el fondo completamente negro */}
      <div className="pms-overlay" onClick={handleClose} aria-hidden="true" />
      <div className="pms-positioner" role="dialog" aria-modal="true" aria-labelledby="modal-cliente-title">
        <div className="pms-card" onClick={e => e.stopPropagation()}>

          {/* Header — gradiente igual al wizard */}
          <div className="pms-header">
            <div className="pms-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h3 id="modal-cliente-title" className="pms-title">Nuevo Cliente</h3>
              <p className="pms-subtitle">Spa &amp; Tienda de Mascotas</p>
            </div>
            <button onClick={handleClose} className="pms-close" aria-label="Cerrar">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Step indicator decorativo */}
          <div className="pms-step-bar">
            <span className="pms-step-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Datos del cliente
            </span>
          </div>

          {/* Body */}
          <div className="pms-body">
            <div className="pms-row-2">
              <PmsField label="Nombre" required error={errors.nombre}>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                  className={`pms-input ${errors.nombre ? 'pms-input--error' : ''}`} placeholder="Juan" />
              </PmsField>
              <PmsField label="Apellido" required error={errors.apellido}>
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange}
                  className={`pms-input ${errors.apellido ? 'pms-input--error' : ''}`} placeholder="Pérez" />
              </PmsField>
            </div>

            <PmsField label="Email" required error={errors.email}>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className={`pms-input ${errors.email ? 'pms-input--error' : ''}`} placeholder="juan@ejemplo.com" />
            </PmsField>

            <PmsField label="Teléfono">
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
                className="pms-input" placeholder="+591 7X XXX XXX" />
            </PmsField>

            <PmsField label="Dirección">
              <input type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                className="pms-input" placeholder="Calle, ciudad…" />
            </PmsField>

            <PmsField label="Canal de contacto preferido">
              <select name="canalContacto" value={formData.canalContacto} onChange={handleChange}
                className="pms-input pms-select">
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </PmsField>
          </div>

          {/* Footer */}
          <div className="pms-footer">
            <button type="button" onClick={handleClose} disabled={isLoading} className="pms-btn-secondary">
              ← Anterior
            </button>
            <button type="button" onClick={handleSubmit} disabled={isLoading} className="pms-btn-primary">
              {isLoading && <span className="pms-spinner" />}
              {isLoading ? 'Creando…' : 'Crear Cliente →'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

const PmsField = ({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) => (
  <div className="pms-field">
    <label className="pms-label">{label}{required && <span className="pms-required"> *</span>}</label>
    {children}
    {error && <p className="pms-error">{error}</p>}
  </div>
);

const modalStyles = `
  .pms-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: 9998;
  }

  .pms-positioner {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    pointer-events: none;
  }

  .pms-card {
    pointer-events: all;
    background: #ffffff;
    border-radius: 16px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(15,23,42,0.2), 0 4px 16px rgba(15,23,42,0.1);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: pmsIn 0.2s cubic-bezier(0.34, 1.4, 0.64, 1);
  }

  @keyframes pmsIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* Header — mismo gradiente azul que el wizard */
  .pms-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
    position: relative;
  }

  .pms-header-icon {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px;
    border-radius: 10px;
    background: rgba(255,255,255,0.15);
    color: white;
    flex-shrink: 0;
  }

  .pms-title {
    font-size: 18px;
    font-weight: 700;
    color: white;
    margin: 0;
    line-height: 1.2;
  }
  .pms-subtitle {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    margin: 2px 0 0;
  }

  .pms-close {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.85);
    cursor: pointer;
    margin-left: auto;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .pms-close:hover { background: rgba(255,255,255,0.2); }

  /* Step bar */
  .pms-step-bar {
    display: flex;
    align-items: center;
    padding: 10px 24px;
    background: #f8fafd;
    border-bottom: 1px solid #e2e8f0;
  }
  .pms-step-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #3b82f6;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Body */
  .pms-body {
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 55vh;
    overflow-y: auto;
  }

  .pms-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pms-field { display: flex; flex-direction: column; gap: 5px; }

  .pms-label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    letter-spacing: 0.02em;
  }
  .pms-required { color: #ef4444; }
  .pms-error { font-size: 11px; color: #ef4444; margin-top: 2px; }

  .pms-input {
    height: 38px;
    padding: 0 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafd;
    color: #1e293b;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .pms-input:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
  }
  .pms-input--error { border-color: #ef4444; }
  .pms-input--error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
  .pms-select { cursor: pointer; appearance: auto; }

  /* Footer — igual al wizard */
  .pms-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    background: #f8fafd;
    border-top: 1px solid #e2e8f0;
  }

  .pms-btn-secondary {
    height: 38px; padding: 0 16px;
    border: 1.5px solid #d1dae8;
    border-radius: 8px;
    background: white;
    color: #475569;
    font-size: 13px; font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .pms-btn-secondary:hover { background: #f1f5f9; border-color: #94a3b8; }
  .pms-btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; }

  .pms-btn-primary {
    height: 38px; padding: 0 20px;
    border: none;
    border-radius: 8px;
    background: #2563eb;
    color: white;
    font-size: 13px; font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: background 0.15s, transform 0.1s;
  }
  .pms-btn-primary:hover { background: #1d4ed8; }
  .pms-btn-primary:active { transform: scale(0.98); }
  .pms-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

  .pms-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: pms-spin 0.7s linear infinite;
  }
  @keyframes pms-spin { to { transform: rotate(360deg); } }
`;
