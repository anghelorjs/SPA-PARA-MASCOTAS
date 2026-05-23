/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/admin/agenda/components/ModalDisponibilidad.tsx
import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PlusIcon, TrashIcon, CalendarIcon, ClockIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { adminAgendaService } from '../services/admin.agenda.service';
import { DIAS_SEMANA } from '../types';
import { useToast } from '../../../../hooks/useToast';

interface ModalDisponibilidadProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface GroomerData {
  id: number;
  nombre: string;
  especialidad: string | null;
  maxServiciosSimultaneos: number;
  disponibilidades: {
    id: number;
    diaSemana: number;
    diaNombre: string;
    horaInicio: string;
    horaFin: string;
  }[];
}

interface BloqueoData {
  id: number;
  groomer_id: number;
  groomer_nombre: string;
  fecha: string | null;
  motivo: string;
  created_at: string;
}

export const ModalDisponibilidad = ({ isOpen, onClose, onRefresh }: ModalDisponibilidadProps) => {
  const [groomers, setGroomers] = useState<GroomerData[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBloqueoForm, setShowBloqueoForm] = useState(false);
  const [bloqueoForm, setBloqueoForm] = useState({
    groomer_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    motivo: '',
  });
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminAgendaService.getDisponibilidad();
      setGroomers(data.groomers);
      setBloqueos(data.bloqueos);
    } catch {
      showToast('Error al cargar disponibilidad', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const handleRegistrarBloqueo = async () => {
    if (!bloqueoForm.groomer_id || !bloqueoForm.fecha_desde || !bloqueoForm.motivo) {
      showToast('Complete todos los campos requeridos', 'error');
      return;
    }

    try {
      await adminAgendaService.registrarBloqueo(
        parseInt(bloqueoForm.groomer_id),
        bloqueoForm.fecha_desde,
        bloqueoForm.fecha_hasta || null,
        bloqueoForm.motivo
      );
      showToast('Bloqueo registrado correctamente', 'success');
      setShowBloqueoForm(false);
      setBloqueoForm({ groomer_id: '', fecha_desde: '', fecha_hasta: '', motivo: '' });
      loadData();
      onRefresh?.();
    } catch {
      showToast('Error al registrar bloqueo', 'error');
    }
  };

  const handleEliminarBloqueo = async (bloqueoId: number) => {
    if (confirm('¿Estás seguro de eliminar este bloqueo?')) {
      try {
        await adminAgendaService.eliminarBloqueo(bloqueoId);
        showToast('Bloqueo eliminado correctamente', 'success');
        loadData();
        onRefresh?.();
      } catch {
        showToast('Error al eliminar bloqueo', 'error');
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ClockIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Gestión de Disponibilidad</h2>
              <p className="text-xs text-purple-100">Configuración de horarios y bloqueos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Horarios por groomer */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  Horarios Semanales
                </h3>
                <div className="space-y-6">
                  {groomers.map((groomer) => (
                    <div key={groomer.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{groomer.nombre}</h4>
                          {groomer.especialidad && (
                            <p className="text-xs text-gray-500">{groomer.especialidad}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          Max. servicios simultáneos: {groomer.maxServiciosSimultaneos}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {DIAS_SEMANA.map((dia) => {
                          const disponibilidad = groomer.disponibilidades.find(d => d.diaSemana === dia.id);
                          return (
                            <div key={dia.id} className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-600 w-16">{dia.nombre.substring(0, 3)}</span>
                              {disponibilidad ? (
                                <div className="flex items-center gap-1 text-xs text-gray-700">
                                  <span>{disponibilidad.horaInicio.substring(0, 5)}</span>
                                  <span>-</span>
                                  <span>{disponibilidad.horaFin.substring(0, 5)}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">No disponible</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloqueos */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                    Bloqueos Programados
                  </h3>
                  <button
                    onClick={() => setShowBloqueoForm(!showBloqueoForm)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Registrar Bloqueo
                  </button>
                </div>

                {/* Formulario de bloqueo */}
                {showBloqueoForm && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-gray-800 mb-3">Nuevo Bloqueo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={bloqueoForm.groomer_id}
                        onChange={(e) => setBloqueoForm({ ...bloqueoForm, groomer_id: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Seleccionar groomer</option>
                        {groomers.map((g) => (
                          <option key={g.id} value={g.id}>{g.nombre}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={bloqueoForm.fecha_desde}
                        onChange={(e) => setBloqueoForm({ ...bloqueoForm, fecha_desde: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Fecha desde"
                      />
                      <input
                        type="date"
                        value={bloqueoForm.fecha_hasta}
                        onChange={(e) => setBloqueoForm({ ...bloqueoForm, fecha_hasta: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Fecha hasta (opcional)"
                      />
                      <input
                        type="text"
                        value={bloqueoForm.motivo}
                        onChange={(e) => setBloqueoForm({ ...bloqueoForm, motivo: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Motivo (feriado/ausencia/mantenimiento)"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setShowBloqueoForm(false)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRegistrarBloqueo}
                        className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Registrar
                      </button>
                    </div>
                  </div>
                )}

                {bloqueos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                    <CalendarIcon className="h-10 w-10 mx-auto mb-2" />
                    <p>No hay bloqueos registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Groomer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Motivo</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bloqueos.map((bloqueo) => (
                          <tr key={bloqueo.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-800">{bloqueo.groomer_nombre}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {bloqueo.fecha || bloqueo.created_at.split(' ')[0]}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{bloqueo.motivo}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleEliminarBloqueo(bloqueo.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
    </div>,
    document.body
  );
};
