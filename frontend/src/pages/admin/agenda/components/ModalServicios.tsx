/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/admin/agenda/components/ModalServicios.tsx
import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ScissorsIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { adminAgendaService } from '../services/admin.agenda.service';
import type { Servicio, RangoPeso, CreateServicioData, CreateRangoPesoData } from '../types';
import { useToast } from '../../../../hooks/useToast';

interface ModalServiciosProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'servicios' | 'rangos';

interface ServicioExpandido extends Servicio {
  expanded: boolean;
}

export const ModalServicios = ({ isOpen, onClose }: ModalServiciosProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('servicios');
  const [servicios, setServicios] = useState<ServicioExpandido[]>([]);
  const [rangos, setRangos] = useState<RangoPeso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [showRangoModal, setShowRangoModal] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [rangoEditando, setRangoEditando] = useState<RangoPeso | null>(null);
  const { showToast } = useToast();

  // Formulario de Servicio
  const [servicioForm, setServicioForm] = useState({
    nombre: '',
    duracionMinutos: 60,
    precioBase: 0,
    admiteDobleBooking: false,
    preciosPorRango: [] as { idRango: number; duracionAjustadaMin: number; precioAjustado: number }[],
  });

  // Formulario de Rango
  const [rangoForm, setRangoForm] = useState({
    nombre: '',
    pesoMinKg: 0,
    pesoMaxKg: 0,
    factorTiempo: 1,
    factorPrecio: 1,
  });

  const loadData = useCallback(async () => {
    try {
        setIsLoading(true);
        const [serviciosData, rangosData] = await Promise.all([
        adminAgendaService.getServicios(),
        adminAgendaService.getRangosPeso(),
        ]);

        // AGREGA ESTO TEMPORALMENTE para diagnosticar:
        console.log('serviciosData:', serviciosData);
        console.log('rangosData:', rangosData);
        console.log('serviciosData.servicios:', serviciosData?.servicios);

        setServicios(
        (serviciosData.servicios ?? []).map((s) => ({
            ...s,
            precioBase: Number(s.precioBase),
            duracionMinutos: Number(s.duracionMinutos),
            rangosPeso: (s.rangosPeso ?? []).map((r) => ({
            ...r,
            duracionAjustadaMin: Number(r.duracionAjustadaMin),
            precioAjustado: Number(r.precioAjustado),
            })),
            expanded: false,
        }))
        );
        setRangos(
        (Array.isArray(rangosData) ? rangosData : []).map((r) => ({
            ...r,
            pesoMinKg: Number(r.pesoMinKg),
            pesoMaxKg: Number(r.pesoMaxKg),
            factorTiempo: Number(r.factorTiempo),
            factorPrecio: Number(r.factorPrecio),
        }))
        );
    } catch (e) {
        console.error('Error en loadData:', e);
        showToast('Error al cargar datos', 'error');
    } finally {
        setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // ==================== SERVICIOS ====================
  const toggleExpand = (id: number) => {
    setServicios((prev) =>
      prev.map((s) => (s.idServicio === id ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const handleServicioSubmit = async () => {
    if (!servicioForm.nombre || servicioForm.duracionMinutos <= 0 || servicioForm.precioBase <= 0) {
      showToast('Complete todos los campos requeridos', 'error');
      return;
    }

    if (servicioForm.preciosPorRango.length === 0) {
      showToast('Debe configurar los precios por rango de peso', 'error');
      return;
    }

    try {
      const data: CreateServicioData = {
        nombre: servicioForm.nombre,
        duracionMinutos: servicioForm.duracionMinutos,
        precioBase: servicioForm.precioBase,
        admiteDobleBooking: servicioForm.admiteDobleBooking,
        preciosPorRango: servicioForm.preciosPorRango,
      };

      if (servicioEditando) {
        await adminAgendaService.updateServicio(servicioEditando.idServicio, data);
        showToast('Servicio actualizado correctamente', 'success');
      } else {
        await adminAgendaService.createServicio(data);
        showToast('Servicio creado correctamente', 'success');
      }

      setShowServicioModal(false);
      setServicioEditando(null);
      setServicioForm({
        nombre: '',
        duracionMinutos: 60,
        precioBase: 0,
        admiteDobleBooking: false,
        preciosPorRango: [],
      });
      loadData();
    } catch {
      showToast('Error al guardar servicio', 'error');
    }
  };

  const handleEliminarServicio = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar el servicio "${nombre}"?`)) {
      try {
        await adminAgendaService.deleteServicio(id);
        showToast('Servicio eliminado correctamente', 'success');
        loadData();
      } catch {
        showToast('Error al eliminar servicio', 'error');
      }
    }
  };

  const abrirModalServicio = (servicio?: Servicio) => {
    if (servicio) {
      setServicioEditando(servicio);
      setServicioForm({
        nombre: servicio.nombre,
        duracionMinutos: servicio.duracionMinutos,
        precioBase: servicio.precioBase,
        admiteDobleBooking: servicio.admiteDobleBooking,
        preciosPorRango: servicio.rangosPeso.map((r) => ({
          idRango: r.idRango,
          duracionAjustadaMin: r.duracionAjustadaMin,
          precioAjustado: r.precioAjustado,
        })),
      });
    } else {
      setServicioEditando(null);
      // Inicializar con todos los rangos
      setServicioForm({
        nombre: '',
        duracionMinutos: 60,
        precioBase: 0,
        admiteDobleBooking: false,
        preciosPorRango: rangos.map((r) => ({
          idRango: r.idRango,
          duracionAjustadaMin: 60,
          precioAjustado: 0,
        })),
      });
    }
    setShowServicioModal(true);
  };

  const updatePrecioPorRango = (idRango: number, field: 'duracionAjustadaMin' | 'precioAjustado', value: number) => {
    setServicioForm((prev) => ({
      ...prev,
      preciosPorRango: prev.preciosPorRango.map((p) =>
        p.idRango === idRango ? { ...p, [field]: value } : p
      ),
    }));
  };

  // ==================== RANGOS DE PESO ====================
  const handleRangoSubmit = async () => {
    if (!rangoForm.nombre || rangoForm.pesoMinKg >= rangoForm.pesoMaxKg) {
      showToast('Complete los campos correctamente (pesoMin < pesoMax)', 'error');
      return;
    }

    try {
      const data: CreateRangoPesoData = {
        nombre: rangoForm.nombre,
        pesoMinKg: rangoForm.pesoMinKg,
        pesoMaxKg: rangoForm.pesoMaxKg,
        factorTiempo: rangoForm.factorTiempo,
        factorPrecio: rangoForm.factorPrecio,
      };

      if (rangoEditando) {
        await adminAgendaService.updateRangoPeso(rangoEditando.idRango, data);
        showToast('Rango actualizado correctamente', 'success');
      } else {
        await adminAgendaService.createRangoPeso(data);
        showToast('Rango creado correctamente', 'success');
      }

      setShowRangoModal(false);
      setRangoEditando(null);
      setRangoForm({
        nombre: '',
        pesoMinKg: 0,
        pesoMaxKg: 0,
        factorTiempo: 1,
        factorPrecio: 1,
      });
      loadData();
    } catch {
      showToast('Error al guardar rango', 'error');
    }
  };

  const handleEliminarRango = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar el rango "${nombre}"?`)) {
      try {
        await adminAgendaService.deleteRangoPeso(id);
        showToast('Rango eliminado correctamente', 'success');
        loadData();
      } catch (error: unknown) {
        const message =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
            ? (error as { response: { data: { message: string } } }).response.data.message
            : 'Error al eliminar rango';
        showToast(message, 'error');
      }
    }
  };

  const abrirModalRango = (rango?: RangoPeso) => {
    if (rango) {
      setRangoEditando(rango);
      setRangoForm({
        nombre: rango.nombre,
        pesoMinKg: rango.pesoMinKg,
        pesoMaxKg: rango.pesoMaxKg,
        factorTiempo: rango.factorTiempo,
        factorPrecio: rango.factorPrecio,
      });
    } else {
      setRangoEditando(null);
      setRangoForm({
        nombre: '',
        pesoMinKg: 0,
        pesoMaxKg: 0,
        factorTiempo: 1,
        factorPrecio: 1,
      });
    }
    setShowRangoModal(true);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ScissorsIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Configuración de Servicios</h2>
                <p className="text-xs text-indigo-100">Gestión de servicios y rangos de peso</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab('servicios')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'servicios'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <ScissorsIcon className="h-4 w-4" />
                Servicios
              </span>
            </button>
            <button
              onClick={() => setActiveTab('rangos')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'rangos'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <ScaleIcon className="h-4 w-4" />
                Rangos de Peso
              </span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : activeTab === 'servicios' ? (
              // PESTAÑA SERVICIOS
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => abrirModalServicio()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Nuevo Servicio
                  </button>
                </div>

                {servicios.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">
                    <ScissorsIcon className="h-12 w-12 mx-auto mb-3" />
                    <p>No hay servicios registrados</p>
                    <p className="text-sm mt-1">Haz clic en "Nuevo Servicio" para agregar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {servicios.map((servicio) => (
                      <div key={servicio.idServicio} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header del servicio */}
                        <div
                          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => toggleExpand(servicio.idServicio)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-gray-900">{servicio.nombre}</h3>
                              {servicio.admiteDobleBooking && (
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                  Doble booking
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                Duración base: {servicio.duracionMinutos} min
                              </span>
                              <span className="flex items-center gap-1">
                                <CurrencyDollarIcon className="h-3 w-3" />
                                Precio base: Bs. {Number(servicio.precioBase).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalServicio(servicio);
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminarServicio(servicio.idServicio, servicio.nombre);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                            {servicio.expanded ? (
                              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Subtabla de rangos (expandida) */}
                        {servicio.expanded && (
                          <div className="p-4 bg-white border-t border-gray-100">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Precios por rango de peso</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rango</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Peso (kg)</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Duración ajustada</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio ajustado</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {servicio.rangosPeso.map((rango) => {
                                    const rangoInfo = rangos.find((r) => r.idRango === rango.idRango);
                                    return (
                                      <tr key={rango.idRango} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-800">{rangoInfo?.nombre || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                          {rangoInfo?.pesoMinKg} - {rangoInfo?.pesoMaxKg} kg
                                        </td>
                                        <td className="px-4 py-2 text-sm text-center text-gray-600">
                                          {rango.duracionAjustadaMin} min
                                        </td>
                                        <td className="px-4 py-2 text-sm text-right font-medium text-green-600">
                                          Bs. {Number(rango.precioAjustado).toFixed(2)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // PESTAÑA RANGOS DE PESO
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => abrirModalRango()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Nuevo Rango
                  </button>
                </div>

                {rangos.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">
                    <ScaleIcon className="h-12 w-12 mx-auto mb-3" />
                    <p>No hay rangos de peso registrados</p>
                    <p className="text-sm mt-1">Haz clic en "Nuevo Rango" para agregar</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nombre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Peso (kg)</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Factor Tiempo</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Factor Precio</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rangos.map((rango) => (
                          <tr key={rango.idRango} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{rango.nombre}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {rango.pesoMinKg} - {rango.pesoMaxKg} kg
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">×{rango.factorTiempo}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">×{rango.factorPrecio}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => abrirModalRango(rango)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEliminarRango(rango.idRango, rango.nombre)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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

      {/* Modal para crear/editar Servicio */}
      {showServicioModal && (
        <ModalServicioForm
          isOpen={showServicioModal}
          onClose={() => {
            setShowServicioModal(false);
            setServicioEditando(null);
          }}
          formData={servicioForm}
          rangos={rangos}
          isEditing={!!servicioEditando}
          onChangeNombre={(value) => setServicioForm((prev) => ({ ...prev, nombre: value }))}
          onChangeDuracion={(value) => setServicioForm((prev) => ({ ...prev, duracionMinutos: value }))}
          onChangePrecioBase={(value) => setServicioForm((prev) => ({ ...prev, precioBase: value }))}
          onChangeDobleBooking={(value) => setServicioForm((prev) => ({ ...prev, admiteDobleBooking: value }))}
          onUpdatePrecioPorRango={updatePrecioPorRango}
          onSubmit={handleServicioSubmit}
        />
      )}

      {/* Modal para crear/editar Rango */}
      {showRangoModal && (
        <ModalRangoForm
          isOpen={showRangoModal}
          onClose={() => {
            setShowRangoModal(false);
            setRangoEditando(null);
          }}
          formData={rangoForm}
          isEditing={!!rangoEditando}
          onChange={(data) => setRangoForm((prev) => ({ ...prev, ...data }))}
          onSubmit={handleRangoSubmit}
        />
      )}
    </>,
    document.body
  );
};

// ==================== SUBCOMPONENTE: ModalServicioForm ====================
interface ModalServicioFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    nombre: string;
    duracionMinutos: number;
    precioBase: number;
    admiteDobleBooking: boolean;
    preciosPorRango: { idRango: number; duracionAjustadaMin: number; precioAjustado: number }[];
  };
  rangos: RangoPeso[];
  isEditing: boolean;
  onChangeNombre: (value: string) => void;
  onChangeDuracion: (value: number) => void;
  onChangePrecioBase: (value: number) => void;
  onChangeDobleBooking: (value: boolean) => void;
  onUpdatePrecioPorRango: (idRango: number, field: 'duracionAjustadaMin' | 'precioAjustado', value: number) => void;
  onSubmit: () => void;
}

const ModalServicioForm = ({
  isOpen,
  onClose,
  formData,
  rangos,
  isEditing,
  onChangeNombre,
  onChangeDuracion,
  onChangePrecioBase,
  onChangeDobleBooking,
  onUpdatePrecioPorRango,
  onSubmit,
}: ModalServicioFormProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-indigo-600 text-white">
          <h3 className="text-lg font-semibold">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Datos básicos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => onChangeNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Baño completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración base (minutos) *</label>
              <input
                type="number"
                min="5"
                max="480"
                value={formData.duracionMinutos}
                onChange={(e) => onChangeDuracion(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio base (Bs.) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precioBase}
                onChange={(e) => onChangePrecioBase(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="admiteDobleBooking"
              checked={formData.admiteDobleBooking}
              onChange={(e) => onChangeDobleBooking(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="admiteDobleBooking" className="text-sm text-gray-700">
              Admite doble booking (múltiples mascotas simultáneas)
            </label>
          </div>

          {/* Precios por rango */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Precios por rango de peso *</label>
            <div className="space-y-3">
              {rangos.map((rango) => {
                const config = formData.preciosPorRango.find((p) => p.idRango === rango.idRango);
                return (
                  <div key={rango.idRango} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      {rango.nombre} ({rango.pesoMinKg} - {rango.pesoMaxKg} kg)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Duración ajustada (min)</label>
                        <input
                          type="number"
                          min="5"
                          value={config?.duracionAjustadaMin || formData.duracionMinutos}
                          onChange={(e) =>
                            onUpdatePrecioPorRango(rango.idRango, 'duracionAjustadaMin', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Precio ajustado (Bs.)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={config?.precioAjustado || formData.precioBase}
                          onChange={(e) =>
                            onUpdatePrecioPorRango(rango.idRango, 'precioAjustado', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ==================== SUBCOMPONENTE: ModalRangoForm ====================
interface ModalRangoFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    nombre: string;
    pesoMinKg: number;
    pesoMaxKg: number;
    factorTiempo: number;
    factorPrecio: number;
  };
  isEditing: boolean;
  onChange: (data: Partial<ModalRangoFormProps['formData']>) => void;
  onSubmit: () => void;
}

const ModalRangoForm = ({ isOpen, onClose, formData, isEditing, onChange, onSubmit }: ModalRangoFormProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-indigo-600 text-white">
          <h3 className="text-lg font-semibold">{isEditing ? 'Editar Rango' : 'Nuevo Rango de Peso'}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => onChange({ nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Pequeño, Mediano, Grande"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso mínimo (kg) *</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.pesoMinKg}
                onChange={(e) => onChange({ pesoMinKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso máximo (kg) *</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.pesoMaxKg}
                onChange={(e) => onChange({ pesoMaxKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factor Tiempo</label>
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.1"
                value={formData.factorTiempo}
                onChange={(e) => onChange({ factorTiempo: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Multiplica la duración base del servicio</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factor Precio</label>
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.1"
                value={formData.factorPrecio}
                onChange={(e) => onChange({ factorPrecio: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Multiplica el precio base del servicio</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
