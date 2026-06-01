import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CakeIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  FaceSmileIcon,
  HeartIcon,
  NoSymbolIcon,
  PencilIcon,
  ScaleIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../../../../hooks/useToast';
import {
  recepcionistaClienteService,
  type CitaMascotaRecepcionista,
  type FichaMascotaRecepcionista,
  type MascotaRecepcionista,
} from '../services/recepcionista.clientes.service';

interface Props {
  isOpen: boolean;
  mascotaId: number | null;
  onClose: () => void;
  onEditar: (mascota: MascotaRecepcionista) => void;
}

const normalizeList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const formatDate = (value?: string | null) => {
  if (!value) return 'No registrada';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-ES');
};

const getRangoNombre = (mascota: MascotaRecepcionista) =>
  mascota.rangoPeso?.nombre || mascota.rango_nombre || 'No asignado';

export const FichaMascotaModal = ({ isOpen, mascotaId, onClose, onEditar }: Props) => {
  const [ficha, setFicha] = useState<FichaMascotaRecepcionista | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !mascotaId) return;
    const loadFicha = async () => {
      try {
        setIsLoading(true);
        setFicha(await recepcionistaClienteService.getMascota(mascotaId));
      } catch {
        showToast('Error al cargar ficha de mascota', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadFicha();
  }, [isOpen, mascotaId, showToast]);

  if (!isOpen) return null;

  const mascota = ficha?.mascota;
  const historial = ficha?.historial_citas || mascota?.citas || [];
  const datosSalud = mascota
    ? [
        { label: 'Temperamento', value: mascota.temperamento, icon: FaceSmileIcon, color: 'text-amber-600' },
        { label: 'Alergias', value: normalizeList(mascota.alergias).join(', '), icon: ExclamationCircleIcon, color: 'text-red-500' },
        { label: 'Restricciones', value: normalizeList(mascota.restricciones).join(', '), icon: NoSymbolIcon, color: 'text-orange-500' },
        { label: 'Vacunas', value: normalizeList(mascota.vacunas).join(', '), icon: ShieldCheckIcon, color: 'text-green-600' },
      ].filter((item) => item.value)
    : [];

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-600 to-rose-600">
          <div>
            <h2 className="text-lg font-semibold text-white">Ficha de mascota</h2>
            <p className="text-xs text-pink-100">{mascota?.nombre || 'Cargando...'}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading || !mascota ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{mascota.nombre}</h3>
                  <p className="text-sm text-gray-500">{mascota.especie} • {mascota.raza || 'Raza no especificada'}</p>
                </div>
                <button onClick={() => onEditar(mascota)} className="inline-flex items-center gap-2 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                  <PencilIcon className="h-4 w-4" />
                  Editar mascota
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard icon={<ScaleIcon className="h-4 w-4 text-blue-500" />} label="Peso" value={`${mascota.pesoKg || 0} kg`} />
                <InfoCard icon={<TagIcon className="h-4 w-4 text-purple-500" />} label="Rango" value={getRangoNombre(mascota)} />
                <InfoCard icon={<CakeIcon className="h-4 w-4 text-pink-500" />} label="Nacimiento" value={formatDate(mascota.fechaNacimiento)} />
                <InfoCard icon={<HeartIcon className="h-4 w-4 text-rose-500" />} label="Especie" value={mascota.especie} />
              </div>

              <section className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                <h4 className="text-sm font-semibold text-amber-800 mb-3">Datos de salud</h4>
                {datosSalud.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin datos de salud registrados</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {datosSalud.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-start gap-2">
                          <Icon className={`h-4 w-4 mt-0.5 ${item.color}`} />
                          <div>
                            <p className="text-xs font-medium text-gray-700">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ScissorsIcon className="h-4 w-4 text-gray-400" />
                  Historial de citas
                </h4>
                {historial.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">No hay citas registradas</div>
                ) : (
                  <div className="space-y-3">
                    {historial.map((cita: CitaMascotaRecepcionista) => (
                      <div key={cita.idCita} className="border border-gray-200 rounded-lg p-3 flex justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-800">{cita.servicio?.nombre || 'Servicio no registrado'}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            {formatDate(cita.fechaHoraInicio)}
                          </p>
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

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs text-gray-500">{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
);
