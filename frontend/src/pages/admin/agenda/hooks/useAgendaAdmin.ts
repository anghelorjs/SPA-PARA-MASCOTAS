// src/pages/admin/agenda/hooks/useAgendaAdmin.ts
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { adminAgendaService } from '../services/admin.agenda.service';
import type {
  CitaCalendario,
  GroomerOption,
  SlotDisponible,
  ClienteSearchResult,
  MascotaData,
  ServicioConPrecio,
  CitaDetalle,
} from '../types';
import { toDateInputValue } from '../../../recepcionista/agenda/utils/date';

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

export const useAgendaAdmin = () => {
  const [citas, setCitas] = useState<CitaCalendario[]>([]);
  const [groomers, setGroomers] = useState<GroomerOption[]>([]);
  const [fechaInicio, setFechaInicio] = useState(toDateInputValue(new Date()));
  const [fechaFin, setFechaFin] = useState(toDateInputValue(new Date()));
  const [groomerFiltro, setGroomerFiltro] = useState<number | undefined>(undefined);
  const [vista, setVista] = useState<'day' | 'week'>('day');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadCitas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminAgendaService.getCitas(fechaInicio, fechaFin, groomerFiltro);
      setCitas(data.citas);
      setGroomers(data.groomers);
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al cargar citas'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fechaInicio, fechaFin, groomerFiltro, showToast]);

  const cambiarFecha = useCallback((inicio: string, fin: string) => {
    setFechaInicio(inicio);
    setFechaFin(fin);
  }, []);

  const cambiarVista = useCallback((nuevaVista: 'day' | 'week') => {
    setVista(nuevaVista);
  }, []);

  useEffect(() => {
    loadCitas();
  }, [loadCitas]);

  return {
    citas,
    groomers,
    fechaInicio,
    fechaFin,
    groomerFiltro,
    vista,
    isLoading,
    setGroomerFiltro,
    cambiarFecha,
    cambiarVista,
    refresh: loadCitas,
  };
};

// ==================== WIZARD PARA NUEVA CITA ====================
export const useNuevaCitaAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slotsDisponibles, setSlotsDisponibles] = useState<SlotDisponible[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [clientes, setClientes] = useState<ClienteSearchResult[]>([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [mascotas, setMascotas] = useState<MascotaData[]>([]);
  const [servicios, setServicios] = useState<ServicioConPrecio[]>([]);
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);
  const [isLoadingMascotas, setIsLoadingMascotas] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteSearchResult | null>(null);
  const [selectedMascota, setSelectedMascota] = useState<MascotaData | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<ServicioConPrecio | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotDisponible | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(toDateInputValue(new Date()));
  const { showToast } = useToast();

  const buscarClientes = useCallback(
    async (search: string) => {
      if (search.length < 2) {
        setClientes([]);
        return;
      }
      try {
        setIsLoadingClientes(true);
        const result = await adminAgendaService.buscarClientes(search);
        setClientes(result);
      } catch (error) {
        showToast(getErrorMessage(error, 'Error al buscar clientes'), 'error');
        setClientes([]);
      } finally {
        setIsLoadingClientes(false);
      }
    },
    [showToast]
  );

  const loadMascotas = useCallback(
    async (clienteId: number) => {
      try {
        setIsLoadingMascotas(true);
        const result = await adminAgendaService.getMascotasPorCliente(clienteId);
        setMascotas(result);
      } catch (error) {
        showToast(getErrorMessage(error, 'Error al cargar mascotas'), 'error');
        setMascotas([]);
      } finally {
        setIsLoadingMascotas(false);
      }
    },
    [showToast]
  );

  const loadServiciosConPrecios = useCallback(
    async (idMascota: number) => {
      try {
        setIsLoadingServicios(true);
        setServicios([]);
        const result = await adminAgendaService.getServiciosConPrecios(idMascota);
        setServicios(Array.isArray(result) ? result : []);
      } catch (error) {
        showToast(getErrorMessage(error, 'Error al cargar servicios'), 'error');
        setServicios([]);
      } finally {
        setIsLoadingServicios(false);
      }
    },
    [showToast]
  );

  const loadSlotsDisponibles = useCallback(
    async (idServicio: number, idMascota: number, fecha: string, idGroomer?: number) => {
      try {
        setIsLoadingSlots(true);
        const slots = await adminAgendaService.getSlotsDisponibles(fecha, idServicio, idMascota, idGroomer);
        setSlotsDisponibles(slots);
        return slots;
      } catch (error) {
        showToast(getErrorMessage(error, 'Error al cargar horarios disponibles'), 'error');
        setSlotsDisponibles([]);
        return [];
      } finally {
        setIsLoadingSlots(false);
      }
    },
    [showToast]
  );

  const limpiarWizard = useCallback(() => {
    setSelectedCliente(null);
    setSelectedMascota(null);
    setSelectedServicio(null);
    setSelectedSlot(null);
    setClientes([]);
    setIsLoadingClientes(false);
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
        setIsLoading(true);
        await adminAgendaService.crearCita(data);
        showToast('Cita creada exitosamente', 'success');
        limpiarWizard();
        setIsOpen(false);
        return true;
      } catch (error) {
        showToast(getErrorMessage(error, 'Error al crear cita'), 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, limpiarWizard]
  );

  return {
    isOpen,
    setIsOpen,
    isLoading,
    slotsDisponibles,
    isLoadingSlots,
    clientes,
    isLoadingClientes,
    mascotas,
    servicios,
    isLoadingServicios,
    isLoadingMascotas,
    selectedCliente,
    selectedMascota,
    selectedServicio,
    selectedSlot,
    fechaSeleccionada,
    setFechaSeleccionada,
    setSelectedCliente,
    setSelectedMascota,
    setSelectedServicio,
    setSelectedSlot,
    buscarClientes,
    loadMascotas,
    loadServiciosConPrecios,
    loadSlotsDisponibles,
    crearCita,
    limpiarWizard,
  };
};

// ==================== DETALLE DE CITA ====================
export const useDetalleCitaAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { showToast } = useToast();

  const loadDetalle = async (citaId: number) => {
    try {
      setIsLoading(true);
      const data = await adminAgendaService.getDetalleCita(citaId);
      setCita(data);
      setIsOpen(true);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar detalle'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarCita = async (citaId: number, onSuccess?: () => void) => {
    try {
      setIsConfirming(true);
      await adminAgendaService.confirmarCita(citaId);
      showToast('Cita confirmada exitosamente', 'success');
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al confirmar'), 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  const cancelarCita = async (citaId: number, onSuccess?: () => void) => {
    try {
      setIsCancelling(true);
      await adminAgendaService.cancelarCita(citaId);
      showToast('Cita cancelada exitosamente', 'success');
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cancelar'), 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const cerrar = () => {
    setIsOpen(false);
    setCita(null);
  };

  return {
    isOpen,
    cita,
    isLoading,
    isConfirming,
    isCancelling,
    loadDetalle,
    confirmarCita,
    cancelarCita,
    cerrar,
  };
};
