// src/pages/recepcionista/agenda/hooks/useAgendaRecepcion.ts
import { useState, useEffect, useCallback } from 'react';
import { recepcionistaAgendaService } from '../services/recepcionista.agenda.service';
import type {
  CitaCalendario,
  GroomerOption,
  SlotDisponible,
  ClienteSearchResult,
  MascotaData,
  ServicioConPrecio,
} from '../services/recepcionista.agenda.service';
import { useToast } from '../../../../hooks/useToast';
import { toDateInputValue } from '../utils/date';
import { crearCitaPendiente } from '../services/recepcionista.agenda.service';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
};

export const useAgendaRecepcion = () => {
  const [citas, setCitas] = useState<CitaCalendario[]>([]);
  const [groomers, setGroomers] = useState<GroomerOption[]>([]);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const [groomerFiltro, setGroomerFiltro] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Wizard state
  const [slotsDisponibles, setSlotsDisponibles] = useState<SlotDisponible[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [clientes, setClientes] = useState<ClienteSearchResult[]>([]);
  const [mascotas, setMascotas] = useState<MascotaData[]>([]);
  const [servicios, setServicios] = useState<ServicioConPrecio[]>([]);
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);
  const [isLoadingMascotas, setIsLoadingMascotas] = useState(false);

  const [selectedCliente, setSelectedCliente] = useState<ClienteSearchResult | null>(null);
  const [selectedMascota, setSelectedMascota] = useState<MascotaData | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<ServicioConPrecio | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotDisponible | null>(null);
  const [isCreatingCita, setIsCreatingCita] = useState(false);

  const { showToast } = useToast();

  // ── Cargar citas del calendario ──────────────────────────────────────────
  const loadCitas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await recepcionistaAgendaService.getCitas(fecha, groomerFiltro);
      setCitas(data.citas);
      setGroomers(data.groomers);
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al cargar citas'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fecha, groomerFiltro, showToast]);

  // ── Slots disponibles ────────────────────────────────────────────────────
  const loadSlotsDisponibles = useCallback(
    async (idServicio: number, idMascota: number, fechaSlot: string) => {
      try {
        setIsLoadingSlots(true);
        const slots = await recepcionistaAgendaService.getSlotsLibres(fechaSlot, idServicio, idMascota);
        setSlotsDisponibles(slots);
        return slots;
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Error al cargar horarios disponibles'), 'error');
        setSlotsDisponibles([]);
        return [];
      } finally {
        setIsLoadingSlots(false);
      }
    },
    [showToast],
  );

  // ── Buscar clientes ──────────────────────────────────────────────────────
  const buscarClientes = useCallback(
    async (search: string) => {
      if (search.length < 2) { setClientes([]); return; }
      try {
        const result = await recepcionistaAgendaService.buscarClientes(search);
        setClientes(result);
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Error al buscar clientes'), 'error');
        setClientes([]);
      }
    },
    [showToast],
  );

  // ── Mascotas del cliente ─────────────────────────────────────────────────
  const loadMascotas = useCallback(
    async (clienteId: number) => {
      try {
        setIsLoadingMascotas(true);
        const result = await recepcionistaAgendaService.getMascotasPorCliente(clienteId);
        setMascotas(result);
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Error al cargar mascotas'), 'error');
        setMascotas([]);
      } finally {
        setIsLoadingMascotas(false);
      }
    },
    [showToast],
  );

  // ── Servicios con precios ────────────────────────────────────────────────
  const loadServiciosConPrecios = useCallback(
    async (idMascota: number) => {
      try {
        setIsLoadingServicios(true);
        setServicios([]);
        const result = await recepcionistaAgendaService.getServiciosConPrecios(idMascota);
        setServicios(Array.isArray(result) ? result : []);
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Error al cargar servicios'), 'error');
        setServicios([]);
      } finally {
        setIsLoadingServicios(false);
      }
    },
    [showToast],
  );

  // ── Crear cita (PENDIENTE de confirmación) ───────────────────────────────
  // ✅ CORREGIDO: Ahora usa crearCitaPendiente que tiene la ruta correcta
  const limpiarWizard = useCallback(() => {
    setSelectedCliente(null);
    setSelectedMascota(null);
    setSelectedServicio(null);
    setSelectedSlot(null);
    setClientes([]);
    setMascotas([]);
    setServicios([]);
    setSlotsDisponibles([]);
    setIsLoadingServicios(false);
    setIsLoadingMascotas(false);
    setIsLoadingSlots(false);
  }, []);

  const crearCita = useCallback(
    async (data: {
      idCliente: number;
      idMascota: number;
      idServicio: number;
      idGroomer: number;
      fechaHoraInicio: string;
      observaciones?: string;
    }) => {
      try {
        setIsCreatingCita(true);
        
        // Validar que los datos sean números, no strings
        const requestData = {
          idCliente: Number(data.idCliente),
          idMascota: Number(data.idMascota),
          idServicio: Number(data.idServicio),
          idGroomer: Number(data.idGroomer),
          fechaHoraInicio: data.fechaHoraInicio,
          observaciones: data.observaciones || undefined,
        };
        
        console.log('📅 Creando cita pendiente:', requestData);
        
        // ✅ Usar la función correcta con la ruta POST /recepcionista/agenda
        const result = await crearCitaPendiente(requestData);
        
        if (result.data) {
          showToast(
            `✅ Cita creada exitosamente para ${data.idMascota}. Se ha enviado notificación al cliente.`,
            'success'
          );
          await loadCitas(); // Recargar calendario
          limpiarWizard();   // Limpiar el wizard
          return result.data;
        } else {
          throw new Error('Error al crear la cita');
        }
      } catch (error: unknown) {
        console.error('❌ Error crear cita:', error);
        
        // Manejo específico de errores del backend
        if (error && typeof error === 'object' && 'response' in error) {
          const err = error as { response?: { status?: number; data?: { message?: string } } };
          if (err.response?.status === 400) {
            showToast(err.response?.data?.message || 'El horario seleccionado ya no está disponible', 'error');
          } else if (err.response?.status === 403) {
            showToast('No tienes permisos para crear citas', 'error');
          } else if (err.response?.status === 404) {
            showToast('Error: Endpoint no encontrado. Verifica la ruta de la API', 'error');
          } else {
            showToast(getErrorMessage(error, 'Error al crear cita'), 'error');
          }
        } else {
          showToast(getErrorMessage(error, 'Error al crear cita'), 'error');
        }
        return null;
      } finally {
        setIsCreatingCita(false);
      }
    },
    [loadCitas, showToast, limpiarWizard],
  );

  // ── Confirmar cita (cambia estado a confirmada) ──────────────────────────
  const confirmarCita = useCallback(
    async (id: number) => {
      try {
        const result = await recepcionistaAgendaService.confirmarCita(id);
        showToast('Cita confirmada exitosamente', 'success');
        await loadCitas();
        return result;
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Error al confirmar cita'), 'error');
        return null;
      }
    },
    [loadCitas, showToast],
  );

  // ── Cancelar cita ────────────────────────────────────────────────────────
  const cancelarCita = useCallback(
    async (id: number) => {
      try {
        await recepcionistaAgendaService.cancelarCita(id);
        showToast('Cita cancelada exitosamente', 'success');
        await loadCitas();
        return true;
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Error al cancelar cita'), 'error');
        return false;
      }
    },
    [loadCitas, showToast],
  );

  // ── Reprogramar cita ─────────────────────────────────────────────────────
  const reprogramarCita = useCallback(
    async (id: number, fechaHoraInicio: string, idGroomer: number) => {
      try {
        const result = await recepcionistaAgendaService.reprogramarCita(id, fechaHoraInicio, idGroomer);
        showToast('Cita reprogramada exitosamente', 'success');
        await loadCitas();
        return result;
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Error al reprogramar cita'), 'error');
        return null;
      }
    },
    [loadCitas, showToast],
  );

  // ── Cambiar fecha ────────────────────────────────────────────────────────
  const cambiarFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha);
  }, []);

  // ── Limpiar wizard ───────────────────────────────────────────────────────
  useEffect(() => {
    loadCitas();
  }, [loadCitas]);

  return {
    // Estado del calendario
    citas,
    groomers,
    fecha,
    groomerFiltro,
    isLoading,

    // Estado del wizard
    slotsDisponibles,
    isLoadingSlots,
    clientes,
    mascotas,
    servicios,
    isLoadingServicios,
    isLoadingMascotas,
    selectedCliente,
    selectedMascota,
    selectedServicio,
    selectedSlot,
    isCreatingCita,

    // Acciones
    setGroomerFiltro,
    setSelectedCliente,
    setSelectedMascota,
    setSelectedServicio,
    setSelectedSlot,
    loadCitas,
    loadSlotsDisponibles,
    buscarClientes,
    loadMascotas,
    loadServiciosConPrecios,
    crearCita,
    confirmarCita,
    cancelarCita,
    reprogramarCita,
    cambiarFecha,
    limpiarWizard,
  };
};
