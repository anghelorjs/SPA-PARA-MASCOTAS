// src/pages/groomer/agenda/pages/MiAgendaGroomer.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import { useAgendaGroomer } from '../hooks/useAgendaGroomer';
import { FiltroEstado } from '../components/FiltroEstado';
import { CitaCard } from '../components/CitaCard';
import { HistorialMascotaDrawer } from '../components/HistorialMascotaDrawer';
import Pagination from '../../../../components/common/Pagination';
import { toDateInputValue, formatLocalDate, parseLocalDate } from '../../../recepcionista/agenda/utils/date';

export const MiAgendaGroomer = () => {
  const navigate = useNavigate();
  const {
    citas,
    fecha,
    filtroEstado,
    isLoading,
    isLoadingAction,
    currentPage,
    lastPage,
    total,
    cambiarFecha,
    cambiarFiltroEstado,
    cambiarPagina,
    iniciarServicio,
  } = useAgendaGroomer();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState<{ id: number; nombre: string } | null>(null);

  const handleFechaAnterior = () => {
    const nuevaFecha = parseLocalDate(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    cambiarFecha(toDateInputValue(nuevaFecha));
  };

  const handleFechaSiguiente = () => {
    const nuevaFecha = parseLocalDate(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    cambiarFecha(toDateInputValue(nuevaFecha));
  };

  const handleFechaHoy = () => {
    cambiarFecha(toDateInputValue(new Date()));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      cambiarFecha(toDateInputValue(date));
    }
  };

  const handleVerHistorial = (mascotaId: number, mascotaNombre: string) => {
    setSelectedMascota({ id: mascotaId, nombre: mascotaNombre });
    setDrawerOpen(true);
  };

  const handleIniciarServicio = async (citaId: number) => {
    const fichaId = await iniciarServicio(citaId);
    if (fichaId) {
      navigate(`/groomer/fichas/${fichaId}`);
    }
  };

  const handleVerFicha = (fichaId: number) => {
    navigate(`/groomer/fichas/${fichaId}`);
  };

  const fechaFormateada = formatLocalDate(fecha, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Convertir la fecha string a Date para el DatePicker
  const selectedDate = parseLocalDate(fecha);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Agenda</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona tus citas del día y los servicios asignados
            </p>
          </div>

          {/* Navegación de fecha */}
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
        </div>

        {/* Fecha actual con DatePicker */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Seleccionar fecha:</span>
          </div>
          
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              locale={es}
              dateFormat="dd/MM/yyyy"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-blue-400 transition-colors"
              popperClassName="z-50"
              popperPlacement="bottom-start"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              yearDropdownItemNumber={10}
              scrollableYearDropdown
              placeholderText="Seleccionar fecha"
            />
          </div>
          
          <div className="hidden sm:block text-gray-400">|</div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Fecha seleccionada:</span>
            <span className="font-semibold text-gray-800">{fechaFormateada}</span>
          </div>
        </div>

        {/* Filtros */}
        <FiltroEstado currentFilter={filtroEstado} onFilterChange={cambiarFiltroEstado} />

        {/* Lista de citas */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : citas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay citas programadas para esta fecha</p>
            <p className="text-sm text-gray-400 mt-1">
              {filtroEstado !== 'todas' ? 'Intenta con otro filtro o ' : ''}
              selecciona otra fecha
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {citas.map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                onVerHistorial={handleVerHistorial}
                onIniciarServicio={handleIniciarServicio}
                onVerFicha={handleVerFicha}
                isLoadingAction={isLoadingAction}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {!isLoading && total > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={total}
            onPageChange={cambiarPagina}
            showTotal={true}
          />
        )}
      </div>

      {/* Drawer de historial */}
      <HistorialMascotaDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mascotaId={selectedMascota?.id || 0}
        mascotaNombre={selectedMascota?.nombre || ''}
      />
    </>
  );
};
