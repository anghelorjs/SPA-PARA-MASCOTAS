import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarIcon,
  CakeIcon,
  EnvelopeIcon,
  HeartIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  ScissorsIcon,
  TagIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../../../../hooks/useToast';
import {
  recepcionistaClienteService,
  type ClienteRecepcionista,
  type MascotaRecepcionista,
  type PerfilClienteRecepcionista,
} from '../services/recepcionista.clientes.service';

interface Props {
  isOpen: boolean;
  clienteId: number | null;
  onClose: () => void;
  onEditarCliente: (cliente: ClienteRecepcionista) => void;
  onNuevaMascota: (cliente: ClienteRecepcionista) => void;
  onVerMascota: (mascota: MascotaRecepcionista) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin citas';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-ES');
};

const getRangoNombre = (mascota: MascotaRecepcionista) =>
  mascota.rangoPeso?.nombre || mascota.rango_nombre || 'No asignado';

export const PerfilClienteModal = ({ isOpen, clienteId, onClose, onEditarCliente, onNuevaMascota, onVerMascota }: Props) => {
  const [perfil, setPerfil] = useState<PerfilClienteRecepcionista | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !clienteId) return;
    const loadPerfil = async () => {
      try {
        setIsLoading(true);
        setPerfil(await recepcionistaClienteService.getCliente(clienteId));
      } catch {
        showToast('Error al cargar perfil del cliente', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadPerfil();
  }, [isOpen, clienteId, showToast]);

  if (!isOpen) return null;

  const cliente = perfil?.cliente;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg font-semibold text-white">Perfil del cliente</h2>
            <p className="text-xs text-blue-100">{cliente ? `${cliente.user.nombre} ${cliente.user.apellido}` : 'Cargando...'}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading || !cliente ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <section className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    Datos personales
                  </h3>
                  <button onClick={() => onEditarCliente(cliente)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                    <PencilIcon className="h-4 w-4" />
                    Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <InfoLine icon={<UserIcon className="h-4 w-4 text-gray-400" />} label="Nombre" value={`${cliente.user.nombre} ${cliente.user.apellido}`} />
                  <InfoLine icon={<EnvelopeIcon className="h-4 w-4 text-gray-400" />} label="Email" value={cliente.user.email} />
                  <InfoLine icon={<PhoneIcon className="h-4 w-4 text-gray-400" />} label="Teléfono" value={cliente.user.telefono || 'No registrado'} />
                  <InfoLine icon={<MapPinIcon className="h-4 w-4 text-gray-400" />} label="Dirección" value={cliente.direccion || 'No registrada'} />
                </div>
              </section>

              <div className="grid grid-cols-3 gap-4">
                <StatCard icon={<HeartIcon className="h-5 w-5 text-pink-500" />} value={perfil.estadisticas.mascotas_registradas} label="Mascotas" />
                <StatCard icon={<ScissorsIcon className="h-5 w-5 text-green-500" />} value={perfil.estadisticas.total_citas} label="Citas" />
                <StatCard icon={<CalendarIcon className="h-5 w-5 text-blue-500" />} value={formatDate(cliente.ultima_cita)} label="Última cita" />
              </div>

              <section>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-pink-500" />
                    Mascotas ({cliente.mascotas.length})
                  </h3>
                  <button onClick={() => onNuevaMascota(cliente)} className="inline-flex items-center gap-2 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                    <PlusIcon className="h-4 w-4" />
                    Nueva Mascota
                  </button>
                </div>
                {cliente.mascotas.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">Sin mascotas registradas</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cliente.mascotas.map((mascota) => (
                      <button key={mascota.idMascota} onClick={() => onVerMascota(mascota)} className="text-left border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-pink-200 transition-all">
                        <p className="font-medium text-gray-800">{mascota.nombre}</p>
                        <p className="text-xs text-gray-500">{mascota.especie} • {mascota.raza || 'Raza no especificada'}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span>Peso: {mascota.pesoKg || 0} kg</span>
                          <span className="inline-flex items-center gap-1"><TagIcon className="h-3 w-3" />{getRangoNombre(mascota)}</span>
                          <span className="inline-flex items-center gap-1"><CakeIcon className="h-3 w-3" />{formatDate(mascota.fechaNacimiento)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  Historial de citas del cliente
                </h3>
                {cliente.mascotas.flatMap((mascota) => mascota.citas || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">No hay citas registradas</div>
                ) : (
                  <div className="space-y-3">
                    {cliente.mascotas.flatMap((mascota) => (mascota.citas || []).map((cita) => ({ ...cita, mascotaNombre: mascota.nombre }))).map((cita) => (
                      <div key={cita.idCita} className="border border-gray-200 rounded-lg p-3 flex justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-800">{cita.servicio?.nombre || 'Servicio no registrado'}</p>
                          <p className="text-sm text-gray-500">{cita.mascotaNombre} • {formatDate(cita.fechaHoraInicio)}</p>
                        </div>
                        <span className="h-fit text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{cita.estado}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const InfoLine = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-lg font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);
