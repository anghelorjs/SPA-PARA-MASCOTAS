// src/pages/cliente/dashboard/pages/DashboardCliente.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, HeartIcon, CheckCircleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useDashboardCliente } from '../hooks/useDashboardCliente';
import { ProximaCitaCard } from '../components/ProximaCitaCard';
import { NotificacionesRecientes } from '../components/NotificacionesRecientes';
import { RecomendacionBanner } from '../components/RecomendacionBanner';
import { AccesosDirectos } from '../components/AccesosDirectos';
import { formatLocalDate } from '../../../recepcionista/agenda/utils/date';

export const DashboardCliente = () => {
  const navigate = useNavigate();
  const {
    proximaCita,
    notificaciones,
    totalNotificacionesNoLeidas,
    recomendacion,
    estadisticas,
    isLoading,
    refresh,
  } = useDashboardCliente();

  const fechaFormateada = formatLocalDate(new Date().toISOString().split('T')[0], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleVerDetalleCita = () => {
    navigate('/cliente/mis-citas');
  };

  const handleVerTodasNotificaciones = () => {
    navigate('/cliente/perfil'); // Las notificaciones están en el perfil
  };

  const handleVerHistorial = () => {
    navigate('/cliente/historial/servicios');
  };

  const handleAgendarCita = () => {
    navigate('/cliente/mis-citas');
  };

  const handleVerMascotas = () => {
    navigate('/cliente/mis-mascotas');
  };

  const handleVerCatalogo = () => {
    navigate('/cliente/catalogo');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Panel de control - {fechaFormateada}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Estadísticas rápidas - opcional, para dar contexto */}
      {estadisticas && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
            <HeartIcon className="h-5 w-5 text-pink-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{estadisticas.total_mascotas}</p>
            <p className="text-xs text-gray-500">Mascotas</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{estadisticas.total_citas_completadas}</p>
            <p className="text-xs text-gray-500">Servicios</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
            <ShoppingBagIcon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{estadisticas.total_compras}</p>
            <p className="text-xs text-gray-500">Compras</p>
          </div>
        </div>
      )}

      {/* Próxima Cita */}
      {proximaCita && (
        <ProximaCitaCard cita={proximaCita} onVerDetalle={handleVerDetalleCita} />
      )}

      {/* Grid de 2 columnas: Notificaciones y Recomendación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notificaciones Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <NotificacionesRecientes
            notificaciones={notificaciones}
            totalNoLeidas={totalNotificacionesNoLeidas}
            isLoading={isLoading}
            onVerTodas={handleVerTodasNotificaciones}
          />
        </div>

        {/* Recomendación del Groomer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {recomendacion ? (
            <RecomendacionBanner recomendacion={recomendacion} onVerHistorial={handleVerHistorial} />
          ) : (
            <div className="p-5 text-center text-gray-400">
              <ChatBubbleLeftRightIcon className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">No hay recomendaciones recientes</p>
              <p className="text-xs mt-1">Las recomendaciones aparecerán después de tus servicios</p>
            </div>
          )}
        </div>
      </div>

      {/* Accesos Directos */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Accesos Rápidos</h3>
        <AccesosDirectos
          onAgendarCita={handleAgendarCita}
          onVerMascotas={handleVerMascotas}
          onVerCatalogo={handleVerCatalogo}
        />
      </div>
    </div>
  );
};

// Ícono faltante
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';