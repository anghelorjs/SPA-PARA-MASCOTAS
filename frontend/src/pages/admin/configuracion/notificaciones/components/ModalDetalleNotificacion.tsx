// src/pages/admin/configuracion/notificaciones/components/ModalDetalleNotificacion.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon,
  ScissorsIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { adminNotificacionesService } from '../services/admin.notificaciones.service';
import type { DetalleNotificacionResponse } from '../../../../../services/types/admin';
import { useToast } from '../../../../../hooks/useToast';

interface ModalDetalleNotificacionProps {
  isOpen: boolean;
  notificacionId: number | null;
  onClose: () => void;
}

const getTipoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    confirmacion: 'Confirmación',
    recordatorio: 'Recordatorio',
    listo_para_recoger: 'Listo para recoger',
    encuesta: 'Encuesta',
    cancelacion: 'Cancelación',
    reprogramacion: 'Reprogramación',
  };
  return labels[tipo] || tipo;
};

const getCanalIcon = (canal: string) => {
  switch (canal) {
    case 'whatsapp':
      return <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />;
    case 'telegram':
      return <DevicePhoneMobileIcon className="h-5 w-5 text-blue-500" />;
    case 'email':
      return <EnvelopeIcon className="h-5 w-5 text-purple-500" />;
    default:
      return <DevicePhoneMobileIcon className="h-5 w-5 text-gray-500" />;
  }
};

export const ModalDetalleNotificacion = ({ isOpen, notificacionId, onClose }: ModalDetalleNotificacionProps) => {
  const [notificacion, setNotificacion] = useState<DetalleNotificacionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && notificacionId) {
      loadDetalle();
    }
  }, [isOpen, notificacionId]);

  const loadDetalle = async () => {
    if (!notificacionId) return;
    try {
      setIsLoading(true);
      const data = await adminNotificacionesService.getNotificacion(notificacionId);
      setNotificacion(data);
    } catch (error) {
      showToast('Error al cargar detalle de la notificación', 'error');
    } finally {
      setIsLoading(false);
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
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg font-semibold text-white">Detalle de Notificación</h2>
            <p className="text-xs text-blue-100">ID: #{notificacionId}</p>
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
          ) : notificacion ? (
            <div className="space-y-5">
              {/* Cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">Cliente</h3>
                </div>
                <p className="text-gray-800">
                  {notificacion.cliente.user.nombre} {notificacion.cliente.user.apellido}
                </p>
                <p className="text-sm text-gray-500">{notificacion.cliente.user.email}</p>
              </div>

              {/* Tipo y Canal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Tipo</p>
                  <p className="text-sm font-medium text-gray-800">{getTipoLabel(notificacion.tipo)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Canal</p>
                  <div className="flex items-center gap-2">
                    {getCanalIcon(notificacion.canal)}
                    <p className="text-sm font-medium text-gray-800">
                      {notificacion.canal === 'whatsapp' ? 'WhatsApp' :
                       notificacion.canal === 'telegram' ? 'Telegram' :
                       notificacion.canal === 'email' ? 'Email' : 'SMS'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Fecha de envío</p>
                  </div>
                  <p className="text-sm text-gray-800">{notificacion.fechaEnvio || 'No enviada'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Fecha de creación</p>
                  </div>
                  <p className="text-sm text-gray-800">{notificacion.created_at}</p>
                </div>
              </div>

              {/* Estado de entrega */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Estado de entrega</p>
                {notificacion.entregada ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="font-medium">Entregada correctamente</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircleIcon className="h-5 w-5" />
                    <span className="font-medium">Fallida - No se pudo entregar</span>
                  </div>
                )}
              </div>

              {/* Cita asociada */}
              {notificacion.cita && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700">Cita asociada</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <HeartIcon className="h-4 w-4 text-pink-400" />
                      <span>{notificacion.cita.mascota.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ScissorsIcon className="h-4 w-4 text-gray-400" />
                      <span>{notificacion.cita.servicio.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{notificacion.cita.fechaHoraInicio}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">Mensaje</h3>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{notificacion.mensaje}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No se pudo cargar el detalle de la notificación</div>
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