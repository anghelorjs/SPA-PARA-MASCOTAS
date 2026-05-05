// src/pages/admin/configuracion/usuarios/components/UsuarioFormModal.tsx
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Usuario, Role, CreateUsuarioData, UpdateUsuarioData } from '../services/admin.usuarios.service';

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUsuarioData | UpdateUsuarioData) => Promise<boolean>;
  usuario?: Usuario | null;
  roles: Role[];
  isEditing: boolean;
}

const turnos = [
  { value: 'matutino', label: 'Matutino (09:00 - 13:00)' },
  { value: 'vespertino', label: 'Vespertino (14:00 - 18:00)' },
  { value: 'completo', label: 'Completo (09:00 - 18:00)' },
];

const canalesContacto = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'email', label: 'Email' },
];

export const UsuarioFormModal = ({ isOpen, onClose, onSave, usuario, roles, isEditing }: UsuarioFormModalProps) => {
  const [formData, setFormData] = useState<CreateUsuarioData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: '',
    password: '',
    turno: 'matutino',
    especialidad: '',
    maxServiciosSimultaneos: 1,
    direccion: '',
    canalContacto: 'whatsapp',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (usuario && isEditing) {
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono || '',
        rol: usuario.rol,
        password: '',
        turno: usuario.perfil_datos?.turno || 'matutino',
        especialidad: usuario.perfil_datos?.especialidad || '',
        maxServiciosSimultaneos: usuario.perfil_datos?.maxServiciosSimultaneos || 1,
        direccion: usuario.perfil_datos?.direccion || '',
        canalContacto: usuario.perfil_datos?.canalContacto || 'whatsapp',
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: '',
        password: '',
        turno: 'matutino',
        especialidad: '',
        maxServiciosSimultaneos: 1,
        direccion: '',
        canalContacto: 'whatsapp',
      });
    }
    setErrors({});
  }, [usuario, isEditing, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido) newErrors.apellido = 'El apellido es requerido';
    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.rol) newErrors.rol = 'El rol es requerido';
    if (!isEditing && !formData.password) newErrors.password = 'La contraseña es requerida';
    else if (!isEditing && formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ← Sin <form>, manejamos el submit con onClick
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const success = await onSave(formData);
    setIsLoading(false);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto', background: 'rgba(107,114,128,0.75)' }}
      onClick={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '16px' }}>
        {/* Detener propagación para que clicks dentro no cierren el modal */}
        <div
          style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '512px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <XMarkIcon style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Campos — div en lugar de form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Nombre + Apellido */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.apellido ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.rol ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.nombre}</option>
                  ))}
                </select>
                {errors.rol && <p className="mt-1 text-xs text-red-500">{errors.rol}</p>}
              </div>

              {/* Contraseña — solo al crear */}
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
              )}

              {/* Turno — recepcionista */}
              {formData.rol === 'recepcionista' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                  <select
                    name="turno"
                    value={formData.turno}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {turnos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              )}

              {/* Especialidad + Máx servicios — groomer */}
              {formData.rol === 'groomer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                    <input
                      type="text"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleChange}
                      placeholder="Ej: Perros, Gatos, Corte fino"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Máx. Servicios Simultáneos
                      </label>
                      <div className="relative group">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          aria-label="Más información"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                          <p className="font-medium mb-1">¿Qué significa esto?</p>
                          <p className="text-gray-300">
                            Número de mascotas que el groomer puede atender al mismo tiempo.
                          </p>
                          <ul className="mt-1 text-gray-300 list-disc list-inside">
                            <li>Valor típico: 1 (una por vez)</li>
                            <li>Con asistente: 2</li>
                            <li>Máximo recomendado: 3</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <input
                      type="number"
                      name="maxServiciosSimultaneos"
                      value={formData.maxServiciosSimultaneos}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Define cuántas mascotas puede atender simultáneamente.
                      Valor por defecto: 1 (recomendado para la mayoría).
                    </p>
                  </div>
                </>
              )}

              {/* Dirección + Canal contacto — cliente */}
              {formData.rol === 'cliente' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Canal de contacto</label>
                    <select
                      name="canalContacto"
                      value={formData.canalContacto}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {canalesContacto.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};