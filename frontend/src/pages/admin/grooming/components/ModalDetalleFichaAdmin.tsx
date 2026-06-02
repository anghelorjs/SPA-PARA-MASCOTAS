// src/pages/admin/grooming/components/ModalDetalleFichaAdmin.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  HeartIcon, 
  ScissorsIcon, 
  UserIcon, 
  CalendarIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FaceSmileIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  PhotoIcon,
  BeakerIcon,
  ChatBubbleLeftIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { adminGroomingService } from '../services/admin.grooming.service';
import type { DetalleFichaAdmin } from '../../../../services/types/admin';
import { useToast } from '../../../../hooks/useToast';

interface ModalDetalleFichaAdminProps {
  isOpen: boolean;
  fichaId: number | null;
  onClose: () => void;
}

// ✅ Función helper para convertir a número
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const getImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  if (url.startsWith('/storage')) return `${baseUrl}${url}`;
  return `${baseUrl}/storage/${url.replace(/^\/?storage\/?/, '')}`;
};

const normalizeList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export const ModalDetalleFichaAdmin = ({ isOpen, fichaId, onClose }: ModalDetalleFichaAdminProps) => {
  const [ficha, setFicha] = useState<DetalleFichaAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingreso' | 'checklist' | 'insumos' | 'observaciones' | 'fotos'>('ingreso');
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && fichaId) {
      loadDetalle();
    }
  }, [isOpen, fichaId]);

  const loadDetalle = async () => {
    if (!fichaId) return;
    try {
      setIsLoading(true);
      const data = await adminGroomingService.getDetalleFicha(fichaId);
      setFicha(data);
    } catch (error) {
      showToast('Error al cargar detalle de la ficha', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isAbierta = ficha?.ficha.estado === 'abierta';
  const progreso = ficha?.ficha.progreso_checklist || 0;
  // ✅ Convertir precio a número
  const precioNum = toNumber(ficha?.servicio?.precio);

  const datosClinicos = [
    { label: 'Temperamento', value: ficha?.mascota.temperamento, icon: FaceSmileIcon, color: 'text-amber-600' },
    { label: 'Alergias', value: normalizeList(ficha?.mascota.alergias).join(', '), icon: ExclamationCircleIcon, color: 'text-red-500' },
    { label: 'Restricciones', value: normalizeList(ficha?.mascota.restricciones).join(', '), icon: NoSymbolIcon, color: 'text-orange-500' },
  ].filter(d => d.value && d.value !== '');

  return createPortal(
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
          <div>
            <h2 className="text-lg font-semibold text-white">Detalle de Ficha de Grooming</h2>
            <p className="text-xs text-purple-100">ID: #{fichaId}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ingreso')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'ingreso'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Estado de Ingreso
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Checklist ({ficha?.checklist.filter(c => c.completado).length || 0}/6)
          </button>
          <button
            onClick={() => setActiveTab('insumos')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'insumos'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Insumos
          </button>
          <button
            onClick={() => setActiveTab('observaciones')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'observaciones'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Observaciones
          </button>
          <button
            onClick={() => setActiveTab('fotos')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'fotos'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fotos
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : ficha ? (
            <div className="space-y-6">
              {/* Información general siempre visible */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <HeartIcon className="h-4 w-4" />
                    Mascota
                  </div>
                  <p className="text-sm font-medium text-gray-800">{ficha.mascota.nombre}</p>
                  <p className="text-xs text-gray-400">{ficha.mascota.especie} • {ficha.mascota.raza || 'Sin raza'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <ScissorsIcon className="h-4 w-4" />
                    Servicio
                  </div>
                  <p className="text-sm font-medium text-gray-800">{ficha.servicio.nombre}</p>
                  <p className="text-xs text-gray-400">{ficha.servicio.duracion} min</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <UserIcon className="h-4 w-4" />
                    Groomer
                  </div>
                  <p className="text-sm font-medium text-gray-800">{ficha.groomer.nombre}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Precio
                  </div>
                  {/* ✅ Usar precioNum en lugar de ficha.servicio.precio */}
                  <p className="text-sm font-semibold text-green-600">Bs. {precioNum.toFixed(2)}</p>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Apertura
                  </div>
                  <p className="text-sm text-gray-800">{ficha.ficha.fecha_apertura}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <ClockIcon className="h-4 w-4" />
                    Cita
                  </div>
                  <p className="text-sm text-gray-800">{ficha.cita.hora_inicio} - {ficha.cita.hora_fin}</p>
                </div>
              </div>

              {/* Datos clínicos */}
              {datosClinicos.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    Datos importantes de la mascota
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {datosClinicos.map((dato, idx) => {
                      const IconComponent = dato.icon;
                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <IconComponent className={`h-4 w-4 flex-shrink-0 ${dato.color}`} />
                          <div>
                            <span className="text-xs font-medium text-gray-700">{dato.label}:</span>
                            <p className="text-sm text-gray-600">{dato.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado de la ficha</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                  isAbierta ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isAbierta ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                  {isAbierta ? 'Abierta' : 'Cerrada'}
                </span>
              </div>

              {/* Progreso */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progreso del checklist</span>
                  <span className="font-medium">{progreso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 rounded-full h-2" style={{ width: `${progreso}%` }} />
                </div>
              </div>

              {/* Contenido de pestañas - el resto se mantiene igual */}
              {activeTab === 'ingreso' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Estado de ingreso</h3>
                    <p className="text-gray-600">{ficha.estado_ingreso.estadoIngreso || 'No registrado'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{ficha.estado_ingreso.nudos ? '✓' : '✗'}</p>
                      <p className="text-xs text-gray-500">Nudos</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{ficha.estado_ingreso.tienePulgas ? '✓' : '✗'}</p>
                      <p className="text-xs text-gray-500">Pulgas</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{ficha.estado_ingreso.tieneHeridas ? '✓' : '✗'}</p>
                      <p className="text-xs text-gray-500">Heridas</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'checklist' && (
                <div className="space-y-3">
                  {ficha.checklist.map((item) => (
                    <div key={item.nombre} className={`p-3 rounded-lg border ${item.completado ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        {item.completado ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-gray-400" />
                        )}
                        <span className={`font-medium ${item.completado ? 'text-green-800' : 'text-gray-700'}`}>
                          {item.nombre}
                        </span>
                      </div>
                      {item.observacion && (
                        <p className="mt-2 text-sm text-gray-600 ml-7">{item.observacion}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'insumos' && (
                <div>
                  {ficha.insumos.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <BeakerIcon className="h-10 w-10 mx-auto mb-2" />
                      <p>No hay insumos registrados en esta ficha</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Insumo</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {ficha.insumos.map((insumo) => (
                            <tr key={insumo.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-800">{insumo.nombre}</td>
                              <td className="px-4 py-2 text-sm text-right font-medium">{insumo.cantidad_usada}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{insumo.unidad_medida}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'observaciones' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChatBubbleLeftIcon className="h-4 w-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-700">Observaciones del groomer</h3>
                    </div>
                    <p className="text-gray-600">{ficha.observaciones.observaciones || 'No hay observaciones'}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <LightBulbIcon className="h-4 w-4 text-amber-600" />
                      <h3 className="text-sm font-semibold text-amber-800">Recomendaciones</h3>
                    </div>
                    <p className="text-amber-700">{ficha.observaciones.recomendaciones || 'No hay recomendaciones'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'fotos' && (
                <div className="space-y-6">
                  {ficha.fotos.antes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">📸 Antes del servicio</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {ficha.fotos.antes.map((foto) => (
                          <img
                            key={foto.id}
                            src={getImageUrl(foto.url)}
                            alt="Antes"
                            className="w-full aspect-square rounded-lg object-cover border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {ficha.fotos.despues.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">✨ Después del servicio</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {ficha.fotos.despues.map((foto) => (
                          <img
                            key={foto.id}
                            src={getImageUrl(foto.url)}
                            alt="Después"
                            className="w-full aspect-square rounded-lg object-cover border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {ficha.fotos.antes.length === 0 && ficha.fotos.despues.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <PhotoIcon className="h-10 w-10 mx-auto mb-2" />
                      <p>No hay fotos disponibles</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No se pudo cargar la ficha</div>
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