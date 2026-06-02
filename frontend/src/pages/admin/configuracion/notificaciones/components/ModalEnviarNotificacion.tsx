// src/pages/admin/configuracion/notificaciones/components/ModalEnviarNotificacion.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  UserIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { adminNotificacionesService } from '../services/admin.notificaciones.service';
import type { 
  TipoNotificacionAdmin, 
  CanalNotificacionAdmin,
  ClienteNotificacionOption,
  CitaNotificacionOption
} from '../../../../../services/types/admin';
import { useToast } from '../../../../../hooks/useToast';

interface ModalEnviarNotificacionProps {
  isOpen: boolean;
  onClose: () => void;
  onEnviar?: () => void;
}

const TIPOS_NOTIFICACION: { id: TipoNotificacionAdmin; nombre: string; descripcion: string }[] = [
  { id: 'confirmacion', nombre: 'Confirmación', descripcion: 'Confirmar una cita existente' },
  { id: 'recordatorio', nombre: 'Recordatorio', descripcion: 'Recordatorio de cita próxima' },
  { id: 'listo_para_recoger', nombre: 'Listo para recoger', descripcion: 'Mascota lista para recoger' },
  { id: 'encuesta', nombre: 'Encuesta', descripcion: 'Solicitar calificación del servicio' },
  { id: 'cancelacion', nombre: 'Cancelación', descripcion: 'Cancelar una cita' },
  { id: 'reprogramacion', nombre: 'Reprogramación', descripcion: 'Reprogramar una cita' },
];

const CANALES: { id: CanalNotificacionAdmin; nombre: string; icon: React.ReactNode }[] = [
  { id: 'whatsapp', nombre: 'WhatsApp', icon: <ChatBubbleLeftRightIcon className="h-4 w-4" /> },
  { id: 'telegram', nombre: 'Telegram', icon: <DevicePhoneMobileIcon className="h-4 w-4" /> },
  { id: 'email', nombre: 'Email', icon: <EnvelopeIcon className="h-4 w-4" /> },
  { id: 'sms', nombre: 'SMS', icon: <DevicePhoneMobileIcon className="h-4 w-4" /> },
];

export const ModalEnviarNotificacion = ({ isOpen, onClose, onEnviar }: ModalEnviarNotificacionProps) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoNotificacionAdmin>('confirmacion');
  const [canalSeleccionado, setCanalSeleccionado] = useState<CanalNotificacionAdmin>('whatsapp');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteNotificacionOption | null>(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaNotificacionOption | null>(null);
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesResultados, setClientesResultados] = useState<ClienteNotificacionOption[]>([]);
  const [citasDisponibles, setCitasDisponibles] = useState<CitaNotificacionOption[]>([]);
  const [mostrarResultadosCliente, setMostrarResultadosCliente] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Cargar vista previa cuando cambia el tipo
  useEffect(() => {
    const loadVistaPrevia = async () => {
      try {
        const preview = await adminNotificacionesService.getVistaPrevia(tipoSeleccionado);
        setVistaPrevia(preview);
      } catch (error) {
        console.error('Error al cargar vista previa:', error);
      }
    };
    if (isOpen) {
      loadVistaPrevia();
    }
  }, [tipoSeleccionado, isOpen]);

  // Buscar clientes
  useEffect(() => {
    const searchClientes = async () => {
      if (busquedaCliente.length < 2) {
        setClientesResultados([]);
        return;
      }
      try {
        const results = await adminNotificacionesService.getClientesList(busquedaCliente);
        setClientesResultados(results);
        setMostrarResultadosCliente(true);
      } catch (error) {
        console.error('Error al buscar clientes:', error);
      }
    };
    const timeoutId = setTimeout(searchClientes, 300);
    return () => clearTimeout(timeoutId);
  }, [busquedaCliente]);

  // Cargar citas cuando se selecciona un cliente
  useEffect(() => {
    const loadCitas = async () => {
      if (!clienteSeleccionado) {
        setCitasDisponibles([]);
        return;
      }
      try {
        const citas = await adminNotificacionesService.getCitasList(clienteSeleccionado.id);
        setCitasDisponibles(citas);
      } catch (error) {
        console.error('Error al cargar citas:', error);
      }
    };
    loadCitas();
  }, [clienteSeleccionado]);

  const handleSelectCliente = (cliente: ClienteNotificacionOption) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(cliente.nombre);
    setMostrarResultadosCliente(false);
    setCitaSeleccionada(null);
  };

  const handleSubmit = async () => {
    if (!clienteSeleccionado) {
      showToast('Debe seleccionar un cliente', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminNotificacionesService.enviarNotificacion({
        idCliente: clienteSeleccionado.id,
        idCita: citaSeleccionada?.id || null,
        tipo: tipoSeleccionado,
        canal: canalSeleccionado,
        mensaje_personalizado: mensajePersonalizado || undefined,
      });
      showToast('Notificación enviada correctamente', 'success');
      onEnviar?.();
      handleClose();
    } catch (error) {
      showToast('Error al enviar notificación', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setClienteSeleccionado(null);
    setCitaSeleccionada(null);
    setBusquedaCliente('');
    setMensajePersonalizado('');
    setTipoSeleccionado('confirmacion');
    setCanalSeleccionado('whatsapp');
    onClose();
  };

  if (!isOpen) return null;

  const mensajeFinal = mensajePersonalizado 
    ? `${vistaPrevia}\n\n---\n📝 Nota adicional: ${mensajePersonalizado}`
    : vistaPrevia;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg font-semibold text-white">Enviar Notificación</h2>
            <p className="text-xs text-blue-100">Envía una notificación manual a un cliente</p>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tipo de notificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de notificación <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TIPOS_NOTIFICACION.map((tipo) => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoSeleccionado(tipo.id)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    tipoSeleccionado === tipo.id
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{tipo.nombre}</div>
                  <div className="text-xs text-gray-400">{tipo.descripcion}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Canal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canal de envío <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {CANALES.map((canal) => (
                <button
                  key={canal.id}
                  type="button"
                  onClick={() => setCanalSeleccionado(canal.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    canalSeleccionado === canal.id
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {canal.icon}
                  {canal.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre o email..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {mostrarResultadosCliente && clientesResultados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {clientesResultados.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => handleSelectCliente(cliente)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                    >
                      <div className="font-medium text-gray-800">{cliente.nombre}</div>
                      <div className="text-xs text-gray-500">{cliente.email}</div>
                      <div className="text-xs text-gray-400">Canal preferido: {cliente.canal_contacto || 'No definido'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {clienteSeleccionado && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                ✓ Cliente seleccionado: {clienteSeleccionado.nombre}
              </div>
            )}
          </div>

          {/* Cita asociada (opcional) */}
          {clienteSeleccionado && citasDisponibles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cita asociada (opcional)
              </label>
              <select
                value={citaSeleccionada?.id || ''}
                onChange={(e) => {
                  const cita = citasDisponibles.find(c => c.id === parseInt(e.target.value));
                  setCitaSeleccionada(cita || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin cita asociada</option>
                {citasDisponibles.map((cita) => (
                  <option key={cita.id} value={cita.id}>
                    {cita.info}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mensaje personalizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje personalizado (opcional)
            </label>
            <textarea
              value={mensajePersonalizado}
              onChange={(e) => setMensajePersonalizado(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Agrega una nota adicional al mensaje..."
            />
          </div>

          {/* Vista previa */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Vista previa del mensaje</label>
              <EyeIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{mensajeFinal}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {isSubmitting ? 'Enviando...' : 'Enviar Notificación'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};