// src/pages/cliente/citas/hooks/useAgendadoCliente.ts
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { clienteCitasService } from '../services/cliente.citas.service';
import type {
  MascotaAgendado,
  ServicioAgendado,
  SlotAgendado,
} from '../../../../services/types/cliente';
import { toDateInputValue } from '../../../recepcionista/agenda/utils/date';

const getTomorrowInputValue = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateInputValue(tomorrow);
};

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

export const useAgendadoCliente = () => {
  const [mascotas, setMascotas] = useState<MascotaAgendado[]>([]);
  const [servicios, setServicios] = useState<ServicioAgendado[]>([]);
  const [slots, setSlots] = useState<SlotAgendado[]>([]);
  const [selectedMascota, setSelectedMascota] = useState<MascotaAgendado | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<ServicioAgendado | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotAgendado | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(getTomorrowInputValue());

  const [isLoadingMascotas, setIsLoadingMascotas] = useState(true);
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { showToast } = useToast();

  const loadMascotas = useCallback(async () => {
    try {
      setIsLoadingMascotas(true);
      const data = await clienteCitasService.getMascotasAgendado();
      setMascotas(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar mascotas'), 'error');
      setMascotas([]);
    } finally {
      setIsLoadingMascotas(false);
    }
  }, [showToast]);

  const loadServicios = useCallback(async (idMascota: number) => {
    try {
      setIsLoadingServicios(true);
      const data = await clienteCitasService.getServiciosAgendado(idMascota);
      setServicios(data.map(servicio => ({
        ...servicio,
        precio: typeof servicio.precio === 'number' ? servicio.precio : parseFloat(String(servicio.precio)) || 0,
      })));
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar servicios'), 'error');
      setServicios([]);
    } finally {
      setIsLoadingServicios(false);
    }
  }, [showToast]);

  const loadSlots = useCallback(async (idServicio: number, idMascota: number, fecha: string) => {
    try {
      setIsLoadingSlots(true);
      const data = await clienteCitasService.getSlotsAgendado(fecha, idServicio, idMascota);
      setSlots(data);
      return data;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar horarios'), 'error');
      setSlots([]);
      return [];
    } finally {
      setIsLoadingSlots(false);
    }
  }, [showToast]);

  const crearCita = useCallback(async (data: {
    idMascota: number;
    idServicio: number;
    idGroomer: number;
    fecha: string;
    hora_inicio: string;
    observaciones?: string;
  }): Promise<boolean> => {
    try {
      setIsCreating(true);
      await clienteCitasService.crearCita(data);
      showToast('Cita agendada exitosamente', 'success');
      limpiarWizard();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al agendar cita'), 'error');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [showToast]);

  const limpiarWizard = useCallback(() => {
    setSelectedMascota(null);
    setSelectedServicio(null);
    setSelectedSlot(null);
    setServicios([]);
    setSlots([]);
    setFechaSeleccionada(getTomorrowInputValue());
  }, []);

  useEffect(() => {
    loadMascotas();
  }, [loadMascotas]);

  return {
    mascotas,
    servicios,
    slots,
    selectedMascota,
    selectedServicio,
    selectedSlot,
    fechaSeleccionada,
    isLoadingMascotas,
    isLoadingServicios,
    isLoadingSlots,
    isCreating,
    setSelectedMascota,
    setSelectedServicio,
    setSelectedSlot,
    setFechaSeleccionada,
    loadServicios,
    loadSlots,
    crearCita,
    limpiarWizard,
  };
};
