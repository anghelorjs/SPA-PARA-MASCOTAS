// src/pages/groomer/fichas/pages/FichasGroomer.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, FolderIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useFichasHoy, useTodasFichas } from '../hooks/useFichasGroomer';
import { FiltroFecha } from '../components/FiltroFecha';
import Pagination from '../../../../components/common/Pagination';
import { toDateInputValue, formatLocalDate, parseLocalDate } from '../../../recepcionista/agenda/utils/date';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';

type TabType = 'hoy' | 'todas';

export const FichasGroomer = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('hoy');

  // Hook para fichas de hoy
  const hoyHook = useFichasHoy();
  // Hook para todas las fichas
  const todasHook = useTodasFichas();

  const handleVerDetalle = (fichaId: number) => {
    navigate(`/groomer/fichas/${fichaId}`);
  };

  const handleFechaAnterior = () => {
    const nuevaFecha = parseLocalDate(hoyHook.fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    hoyHook.cambiarFecha(toDateInputValue(nuevaFecha));
  };

  const handleFechaSiguiente = () => {
    const nuevaFecha = parseLocalDate(hoyHook.fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    hoyHook.cambiarFecha(toDateInputValue(nuevaFecha));
  };

  const handleFechaHoy = () => {
    hoyHook.cambiarFecha(toDateInputValue(new Date()));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      hoyHook.cambiarFecha(toDateInputValue(date));
    }
  };

  const fechaFormateada = formatLocalDate(hoyHook.fecha, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const selectedDate = parseLocalDate(hoyHook.fecha);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fichas de Grooming</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las fichas de grooming de tus servicios
          </p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('hoy')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'hoy'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Hoy
            </span>
          </button>
          <button
            onClick={() => setActiveTab('todas')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'todas'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <FolderIcon className="h-4 w-4" />
              Todas mis fichas
            </span>
          </button>
        </nav>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'hoy' ? (
        // ==================== PESTAÑA HOY ====================
        <div className="space-y-5">
          {/* Selector de fecha */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <button
                onClick={handleFechaAnterior}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Día anterior"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleFechaHoy}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={handleFechaSiguiente}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Día siguiente"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  locale={es}
                  dateFormat="dd/MM/yyyy"
                  className="pl-9 pr-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  popperClassName="z-50"
                  popperPlacement="bottom-start"
                />
              </div>
              <span className="text-sm text-gray-500 hidden sm:inline">|</span>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{fechaFormateada}</span>
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="flex gap-2">
            {(['todas', 'abierta', 'cerrada'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => hoyHook.cambiarFiltroEstado(estado)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  hoyHook.filtroEstado === estado
                    ? estado === 'abierta'
                      ? 'bg-green-600 text-white shadow-md'
                      : estado === 'cerrada'
                      ? 'bg-gray-600 text-white shadow-md'
                      : 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {estado === 'todas' ? 'Todas' : estado === 'abierta' ? 'Abiertas' : 'Cerradas'}
              </button>
            ))}
          </div>

          {/* Tabla de fichas del día */}
          {hoyHook.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : hoyHook.fichas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay fichas para esta fecha</p>
              <p className="text-sm text-gray-400 mt-1">
                {hoyHook.filtroEstado !== 'todas' ? 'Intenta con otro filtro o ' : ''}
                selecciona otra fecha
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mascota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hora apertura
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hoyHook.fichas.map((ficha) => (
                      <tr key={ficha.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ficha.mascota}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{ficha.hora_apertura}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{ficha.servicio}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              ficha.estado === 'abierta'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {ficha.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleVerDetalle(ficha.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver detalle →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginación */}
          {!hoyHook.isLoading && hoyHook.total > 0 && (
            <Pagination
              currentPage={hoyHook.currentPage}
              lastPage={hoyHook.lastPage}
              total={hoyHook.total}
              onPageChange={hoyHook.cambiarPagina}
              showTotal={true}
            />
          )}
        </div>
      ) : (
        // ==================== PESTAÑA TODAS MIS FICHAS ====================
        <div className="space-y-5">
          {/* Filtros */}
          <FiltroFecha
            search={todasHook.search}
            fechaDesde={todasHook.fechaDesde}
            fechaHasta={todasHook.fechaHasta}
            onSearchChange={todasHook.setSearch}
            onFechaDesdeChange={todasHook.setFechaDesde}
            onFechaHastaChange={todasHook.setFechaHasta}
            onLimpiar={todasHook.limpiarFiltros}
            onAplicar={todasHook.aplicarFiltros}
          />

          {/* Filtro por estado */}
          <div className="flex gap-2">
            {(['todas', 'abierta', 'cerrada'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => todasHook.setFiltroEstado(estado)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  todasHook.filtroEstado === estado
                    ? estado === 'abierta'
                      ? 'bg-green-600 text-white shadow-md'
                      : estado === 'cerrada'
                      ? 'bg-gray-600 text-white shadow-md'
                      : 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {estado === 'todas' ? 'Todas' : estado === 'abierta' ? 'Abiertas' : 'Cerradas'}
              </button>
            ))}
          </div>

          {/* Tabla de todas las fichas */}
          {todasHook.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : todasHook.fichas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay fichas registradas</p>
              <p className="text-sm text-gray-400 mt-1">Las fichas se crean automáticamente al iniciar un servicio</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha apertura
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mascota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todasHook.fichas.map((ficha) => (
                      <tr key={ficha.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{ficha.fecha_apertura}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ficha.mascota}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{ficha.servicio}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              ficha.estado === 'abierta'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {ficha.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleVerDetalle(ficha.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver detalle →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginación */}
          {!todasHook.isLoading && todasHook.total > 0 && (
            <Pagination
              currentPage={todasHook.currentPage}
              lastPage={todasHook.lastPage}
              total={todasHook.total}
              onPageChange={todasHook.cambiarPagina}
              showTotal={true}
            />
          )}
        </div>
      )}
    </div>
  );
};