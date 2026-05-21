// src/pages/recepcionista/agenda/components/NuevaMascotaModal.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { recepcionistaClienteService } from '../../clientes/services/recepcionista.clientes.service';
import type { MascotaData } from '../services/recepcionista.agenda.service';
import { useToast } from '../../../../hooks/useToast';

interface MascotaCreadaResponse {
  idMascota: number; nombre: string; especie: string;
  raza?: string | null; pesoKg: number;
  rangoPeso?: { nombre: string } | null; temperamento?: string | null;
}

interface NuevaMascotaModalProps {
  isOpen: boolean; onClose: () => void;
  clienteId: number; onMascotaCreada: (mascota: MascotaData) => void;
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
  nombre: '', especie: 'perro', raza: '', pesoKg: '',
  fechaNacimiento: '', temperamento: '', alergias: '', vacunas: '',
};

export const NuevaMascotaModal = ({ isOpen, onClose, clienteId, onMascotaCreada }: NuevaMascotaModalProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.especie) newErrors.especie = 'La especie es requerida';
    if (!formData.pesoKg) newErrors.pesoKg = 'El peso es requerido';
    else if (isNaN(parseFloat(formData.pesoKg)) || parseFloat(formData.pesoKg) <= 0)
      newErrors.pesoKg = 'Ingresa un peso válido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => { setFormData(initialForm); setErrors({}); onClose(); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await recepcionistaClienteService.createMascota({
        idCliente: clienteId,
        nombre: formData.nombre, especie: formData.especie,
        raza: formData.raza || undefined,
        pesoKg: parseFloat(formData.pesoKg),
        fechaNacimiento: formData.fechaNacimiento || undefined,
        temperamento: formData.temperamento || undefined,
        alergias: formData.alergias ? formData.alergias.split(',').map(s => s.trim()).filter(Boolean) : [],
        vacunas: formData.vacunas ? formData.vacunas.split(',').map(s => s.trim()).filter(Boolean) : [],
      }) as MascotaCreadaResponse;

      showToast('Mascota creada exitosamente', 'success');
      onMascotaCreada({
        id: response.idMascota, nombre: response.nombre, especie: response.especie,
        raza: response.raza || '', peso_kg: response.pesoKg,
        rango_nombre: response.rangoPeso?.nombre || null,
        temperamento: response.temperamento || null,
      });
      handleClose();
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al crear mascota'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <style>{mascotaStyles}</style>
      <div className="pms-overlay" onClick={handleClose} aria-hidden="true" />
      <div className="pms-positioner" role="dialog" aria-modal="true" aria-labelledby="modal-mascota-title">
        <div className="pms-card" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="pms-header">
            <div className="pms-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
                <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.344-2.5"/>
                <path d="M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17l-.75-.75z"/>
                <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/>
              </svg>
            </div>
            <div>
              <h3 id="modal-mascota-title" className="pms-title">Nueva Mascota</h3>
              <p className="pms-subtitle">Spa &amp; Tienda de Mascotas</p>
            </div>
            <button onClick={handleClose} className="pms-close" aria-label="Cerrar">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Step bar */}
          <div className="pms-step-bar">
            <span className="pms-step-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              Datos de la mascota
            </span>
          </div>

          {/* Body */}
          <div className="pms-body">
            <PmsField label="Nombre" required error={errors.nombre}>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                className={`pms-input ${errors.nombre ? 'pms-input--error' : ''}`} placeholder="Rex, Luna…" />
            </PmsField>

            <div className="pms-row-2">
              <PmsField label="Especie" required>
                <select name="especie" value={formData.especie} onChange={handleChange}
                  className="pms-input pms-select">
                  <option value="perro">🐶 Perro</option>
                  <option value="gato">🐱 Gato</option>
                  <option value="otro">🐾 Otro</option>
                </select>
              </PmsField>
              <PmsField label="Raza">
                <input type="text" name="raza" value={formData.raza} onChange={handleChange}
                  className="pms-input" placeholder="Golden Retriever…" />
              </PmsField>
            </div>

            <div className="pms-row-2">
              <PmsField label="Peso (kg)" required error={errors.pesoKg}>
                <input type="number" step="0.1" min="0.1" max="100"
                  name="pesoKg" value={formData.pesoKg} onChange={handleChange}
                  className={`pms-input ${errors.pesoKg ? 'pms-input--error' : ''}`} placeholder="5.0" />
              </PmsField>
              <PmsField label="Fecha de nacimiento">
                <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento}
                  onChange={handleChange} max={new Date().toISOString().split('T')[0]}
                  className="pms-input" />
              </PmsField>
            </div>

            <PmsField label="Temperamento">
              <input type="text" name="temperamento" value={formData.temperamento}
                onChange={handleChange} placeholder="Tranquilo, Juguetón, Activo…"
                className="pms-input" />
            </PmsField>

            <PmsField label="Alergias">
              <input type="text" name="alergias" value={formData.alergias}
                onChange={handleChange} placeholder="Separar con comas — ej: Polen, Alimentos"
                className="pms-input" />
            </PmsField>

            <PmsField label="Vacunas">
              <input type="text" name="vacunas" value={formData.vacunas}
                onChange={handleChange} placeholder="Separar con comas — ej: Rabia, Parvovirus"
                className="pms-input" />
            </PmsField>
          </div>

          {/* Footer */}
          <div className="pms-footer">
            <button type="button" onClick={handleClose} disabled={isLoading} className="pms-btn-secondary">
              ← Anterior
            </button>
            <button type="button" onClick={handleSubmit} disabled={isLoading} className="pms-btn-primary">
              {isLoading && <span className="pms-spinner" />}
              {isLoading ? 'Creando…' : 'Crear Mascota →'}
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

// Comparte exactamente los mismos estilos que NuevoClienteModal
const mascotaStyles = `
  .pms-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: 9998;
  }
  .pms-positioner {
    position: fixed; inset: 0;
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    pointer-events: none;
  }
  .pms-card {
    pointer-events: all;
    background: #ffffff;
    border-radius: 16px;
    width: 100%; max-width: 480px;
    box-shadow: 0 20px 60px rgba(15,23,42,0.2), 0 4px 16px rgba(15,23,42,0.1);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: pmsIn 0.2s cubic-bezier(0.34, 1.4, 0.64, 1);
  }
  @keyframes pmsIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .pms-header {
    display: flex; align-items: center; gap: 12px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  }
  .pms-header-icon {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px;
    border-radius: 10px;
    background: rgba(255,255,255,0.15);
    color: white; flex-shrink: 0;
  }
  .pms-title { font-size: 18px; font-weight: 700; color: white; margin: 0; line-height: 1.2; }
  .pms-subtitle { font-size: 12px; color: rgba(255,255,255,0.7); margin: 2px 0 0; }
  .pms-close {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.85);
    cursor: pointer; margin-left: auto;
    transition: background 0.15s; flex-shrink: 0;
  }
  .pms-close:hover { background: rgba(255,255,255,0.2); }
  .pms-step-bar {
    display: flex; align-items: center;
    padding: 10px 24px;
    background: #f8fafd;
    border-bottom: 1px solid #e2e8f0;
  }
  .pms-step-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600;
    color: #3b82f6;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .pms-body {
    padding: 20px 24px;
    display: flex; flex-direction: column; gap: 14px;
    max-height: 55vh; overflow-y: auto;
  }
  .pms-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pms-field { display: flex; flex-direction: column; gap: 5px; }
  .pms-label { font-size: 12px; font-weight: 600; color: #475569; letter-spacing: 0.02em; }
  .pms-required { color: #ef4444; }
  .pms-error { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .pms-input {
    height: 38px; padding: 0 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafd;
    color: #1e293b;
    font-size: 13px; font-family: inherit;
    outline: none; width: 100%; box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .pms-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  .pms-input--error { border-color: #ef4444; }
  .pms-input--error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
  .pms-select { cursor: pointer; appearance: auto; }
  .pms-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 24px;
    background: #f8fafd;
    border-top: 1px solid #e2e8f0;
  }
  .pms-btn-secondary {
    height: 38px; padding: 0 16px;
    border: 1.5px solid #d1dae8;
    border-radius: 8px;
    background: white; color: #475569;
    font-size: 13px; font-weight: 500; font-family: inherit;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
  }
  .pms-btn-secondary:hover { background: #f1f5f9; border-color: #94a3b8; }
  .pms-btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; }
  .pms-btn-primary {
    height: 38px; padding: 0 20px;
    border: none; border-radius: 8px;
    background: #2563eb; color: white;
    font-size: 13px; font-weight: 600; font-family: inherit;
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
    border-top-color: white; border-radius: 50%;
    animation: pms-spin 0.7s linear infinite;
  }
  @keyframes pms-spin { to { transform: rotate(360deg); } }
`;