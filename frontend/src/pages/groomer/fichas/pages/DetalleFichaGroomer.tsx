// src/pages/groomer/fichas/pages/DetalleFichaGroomer.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  ScissorsIcon,
  UserIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useDetalleFicha } from '../hooks/useFichasGroomer';
import { PestañaEstadoIngreso } from '../components/PestañaEstadoIngreso';
import { PestañaChecklist } from '../components/PestañaChecklist';
import { PestañaInsumos } from '../components/PestañaInsumos';
import { PestañaObservaciones } from '../components/PestañaObservaciones';
import { PestañaFotos } from '../components/PestañaFotos';

type TabType = 'ingreso' | 'checklist' | 'insumos' | 'observaciones' | 'fotos';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'ingreso', label: 'Estado de Ingreso', icon: '📋' },
  { id: 'checklist', label: 'Checklist', icon: '✓' },
  { id: 'insumos', label: 'Insumos', icon: '🧴' },
  { id: 'observaciones', label: 'Observaciones', icon: '💬' },
  { id: 'fotos', label: 'Fotos', icon: '📸' },
];

export const DetalleFichaGroomer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('ingreso');
  const [showCerrarConfirm, setShowCerrarConfirm] = useState(false);

  const {
    ficha,
    isLoading,
    isSaving,
    updateEstadoIngreso,
    updateChecklist,
    agregarInsumo,
    eliminarInsumo,
    updateObservaciones,
    uploadFoto,
    deleteFoto,
    cerrarFicha,
    refresh,
  } = useDetalleFicha(id ? parseInt(id) : undefined);

  const handleCerrarFicha = async () => {
    const result = await cerrarFicha();
    if (result) {
      setShowCerrarConfirm(false);
      refresh();
    }
  };

  const handleVolver = () => {
    navigate('/groomer/fichas/hoy');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudo cargar la ficha</p>
        <button onClick={handleVolver} className="mt-4 text-blue-600 hover:text-blue-800">
          Volver a fichas
        </button>
      </div>
    );
  }

  const isOpen = ficha.ficha.estado === 'abierta';
  const puedeCerrar = ficha.ficha.puede_cerrar && isOpen;

  return (
    <div className="space-y-6">
      {/* Header con botón volver */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleVolver}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Volver a fichas</span>
        </button>

        {/* Botón cerrar ficha */}
        {isOpen && (
          <button
            onClick={() => setShowCerrarConfirm(true)}
            disabled={!puedeCerrar}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              puedeCerrar
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Cerrar Ficha
          </button>
        )}
      </div>

      {/* Tarjeta de información general */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <HeartIcon className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{ficha.mascota.nombre}</h1>
                <p className="text-sm text-gray-500">
                  {ficha.mascota.especie} • {ficha.mascota.raza || 'Raza no especificada'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <ScissorsIcon className="h-4 w-4" />
                <span>{ficha.servicio.nombre}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <UserIcon className="h-4 w-4" />
                <span>{ficha.groomer.nombre}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50">
          <div>
            <p className="text-xs text-gray-500">Fecha apertura</p>
            <p className="text-sm font-medium text-gray-800">{ficha.ficha.fecha_apertura}</p>
          </div>
          {ficha.ficha.fecha_cierre && (
            <div>
              <p className="text-xs text-gray-500">Fecha cierre</p>
              <p className="text-sm font-medium text-gray-800">{ficha.ficha.fecha_cierre}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Hora cita</p>
            <p className="text-sm font-medium text-gray-800">{ficha.cita.hora_inicio} - {ficha.cita.hora_fin}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Estado</p>
            <span
              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isOpen ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
        </div>

        {/* Datos clínicos de la mascota */}
        {(ficha.mascota.temperamento || ficha.mascota.alergias || ficha.mascota.restricciones || ficha.mascota.vacunas) && (
          <div className="p-4 bg-amber-50 border-t border-amber-100">
            <p className="text-xs font-medium text-amber-700 mb-2">📋 Datos importantes de la mascota</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {ficha.mascota.temperamento && (
                <p><span className="text-gray-600">Temperamento:</span> {ficha.mascota.temperamento}</p>
              )}
              {ficha.mascota.alergias && (
                <p><span className="text-gray-600">Alergias:</span> {ficha.mascota.alergias}</p>
              )}
              {ficha.mascota.restricciones && (
                <p><span className="text-gray-600">Restricciones:</span> {ficha.mascota.restricciones}</p>
              )}
              {ficha.mascota.vacunas && (
                <p><span className="text-gray-600">Vacunas:</span> {ficha.mascota.vacunas}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'ingreso' && (
          <PestañaEstadoIngreso
            estadoIngreso={ficha.estado_ingreso.estadoIngreso}
            nudos={ficha.estado_ingreso.nudos}
            tienePulgas={ficha.estado_ingreso.tienePulgas}
            tieneHeridas={ficha.estado_ingreso.tieneHeridas}
            isOpen={isOpen}
            isSaving={isSaving}
            onSave={updateEstadoIngreso}
          />
        )}

        {activeTab === 'checklist' && (
          <PestañaChecklist
            checklist={ficha.checklist}
            isOpen={isOpen}
            isSaving={isSaving}
            onSave={updateChecklist}
          />
        )}

        {activeTab === 'insumos' && (
          <PestañaInsumos
            insumos={ficha.insumos}
            isOpen={isOpen}
            isSaving={isSaving}
            onAgregar={agregarInsumo}
            onEliminar={eliminarInsumo}
          />
        )}

        {activeTab === 'observaciones' && (
          <PestañaObservaciones
            observaciones={ficha.observaciones.observaciones}
            recomendaciones={ficha.observaciones.recomendaciones}
            isOpen={isOpen}
            isSaving={isSaving}
            onSave={updateObservaciones}
          />
        )}

        {activeTab === 'fotos' && (
          <PestañaFotos
            fotosAntes={ficha.fotos.antes}
            fotosDespues={ficha.fotos.despues}
            galeriaHistorica={ficha.galeria_historica}
            isOpen={isOpen}
            isSaving={isSaving}
            onUploadFoto={uploadFoto}
            onDeleteFoto={deleteFoto}
          />
        )}
      </div>

      {/* Modal de confirmación para cerrar ficha */}
      {showCerrarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cerrar ficha</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro que deseas cerrar esta ficha? Se descontará el stock de los insumos usados y se notificará al cliente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCerrarConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCerrarFicha}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Cerrando...' : 'Sí, cerrar ficha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};