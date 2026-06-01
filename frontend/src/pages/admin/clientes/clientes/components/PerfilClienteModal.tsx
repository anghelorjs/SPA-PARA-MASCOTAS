// src/pages/admin/clientes/clientes/components/PerfilClienteModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  HeartIcon, 
  CalendarIcon,
  CurrencyDollarIcon,
  ScissorsIcon,
  TagIcon,
  CakeIcon
} from '@heroicons/react/24/outline';
import { adminClientesService } from '../services/admin.clientes.service';
import { FichaMascotaModal } from '../../mascotas/components/FichaMascotaModal';
import type { PerfilClienteAdmin, MascotaAdmin } from '../../../../../services/types/admin';
import { useToast } from '../../../../../hooks/useToast';

interface PerfilClienteModalProps {
  isOpen: boolean;
  clienteId: number | null;
  clienteNombre: string;
  onClose: () => void;
  onVerMascota?: (mascotaId: number) => void;
}

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const getRangoNombre = (mascota: MascotaAdmin) => mascota.rangoPeso?.nombre || mascota.rango_nombre || 'No asignado';
const getFechaNacimiento = (mascota: MascotaAdmin) => mascota.fechaNacimiento || mascota.fecha_nacimiento;
const formatDate = (value?: string | null) => {
  if (!value) return 'No registrada';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-ES');
};

export const PerfilClienteModal = ({ isOpen, clienteId, clienteNombre, onClose, onVerMascota }: PerfilClienteModalProps) => {
  const [perfil, setPerfil] = useState<PerfilClienteAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fichaMascotaOpen, setFichaMascotaOpen] = useState(false);
  const [selectedMascotaId, setSelectedMascotaId] = useState<number | null>(null);
  const [selectedMascotaNombre, setSelectedMascotaNombre] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && clienteId) {
      loadPerfil();
    }
  }, [isOpen, clienteId]);

  const loadPerfil = async () => {
    if (!clienteId) return;
    try {
      setIsLoading(true);
      const data = await adminClientesService.getCliente(clienteId);
      setPerfil(data);
    } catch (error) {
      showToast('Error al cargar perfil del cliente', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerMascota = (mascota: MascotaAdmin) => {
    setSelectedMascotaId(mascota.idMascota);
    setSelectedMascotaNombre(mascota.nombre);
    setFichaMascotaOpen(true);
  };

  if (!isOpen) return null;

  const totalGastado = toNumber(perfil?.estadisticas.total_gastado || 0);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div>
              <h2 className="text-lg font-semibold text-white">Perfil del Cliente</h2>
              <p className="text-xs text-blue-100">{clienteNombre}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : perfil ? (
              <div className="space-y-6">
                {/* Datos personales */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    Datos Personales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium text-gray-800">
                        {perfil.cliente.user.nombre} {perfil.cliente.user.apellido}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-800">{perfil.cliente.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="font-medium text-gray-800">{perfil.cliente.user.telefono || 'No registrado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Dirección:</span>
                      <span className="font-medium text-gray-800">{perfil.cliente.direccion || 'No registrada'}</span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <HeartIcon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-800">{perfil.estadisticas.mascotas_registradas}</p>
                    <p className="text-xs text-gray-500">Mascotas</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <ScissorsIcon className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-800">{perfil.estadisticas.total_citas}</p>
                    <p className="text-xs text-gray-500">Citas</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-800">Bs. {totalGastado.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Gastado</p>
                  </div>
                </div>

                {/* Lista de mascotas */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-pink-500" />
                    Mascotas ({perfil.cliente.mascotas.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perfil.cliente.mascotas.map((mascota: MascotaAdmin) => (
                      <div key={mascota.idMascota} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{mascota.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {mascota.especie} • {mascota.raza || 'Raza no especificada'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Peso: {mascota.pesoKg} kg</p>
                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <TagIcon className="h-3 w-3" />
                                {getRangoNombre(mascota)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <CakeIcon className="h-3 w-3" />
                                {formatDate(getFechaNacimiento(mascota))}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleVerMascota(mascota)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Ver ficha →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No se pudo cargar el perfil del cliente
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de ficha de mascota */}
      <FichaMascotaModal
        isOpen={fichaMascotaOpen}
        mascotaId={selectedMascotaId}
        mascotaNombre={selectedMascotaNombre}
        onClose={() => {
          setFichaMascotaOpen(false);
          setSelectedMascotaId(null);
          setSelectedMascotaNombre('');
        }}
      />
    </>,
    document.body
  );
};
