import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../hooks/useToast';
import {
  recepcionistaClienteService,
  type ClienteRecepcionista,
  type CreateClienteData,
  type CreateMascotaData,
} from '../services/recepcionista.clientes.service';

const getErrorMessage = (error: unknown, fallback: string): string => {
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

export const useClientesRecepcionista = () => {
  const [clientes, setClientes] = useState<ClienteRecepcionista[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await recepcionistaClienteService.getClientes(currentPage, searchTerm.trim() || undefined);
      setClientes(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar clientes'), 'error');
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, showToast]);

  useEffect(() => {
    const timer = window.setTimeout(loadClientes, 250);
    return () => window.clearTimeout(timer);
  }, [loadClientes]);

  const cambiarSearchTerm = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  }, []);

  const crearCliente = useCallback(async (data: CreateClienteData): Promise<boolean> => {
    try {
      await recepcionistaClienteService.createCliente(data);
      showToast('Cliente creado exitosamente', 'success');
      await loadClientes();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear cliente'), 'error');
      return false;
    }
  }, [loadClientes, showToast]);

  const actualizarCliente = useCallback(async (id: number, data: Partial<CreateClienteData>): Promise<boolean> => {
    try {
      await recepcionistaClienteService.updateCliente(id, data);
      showToast('Cliente actualizado correctamente', 'success');
      await loadClientes();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar cliente'), 'error');
      return false;
    }
  }, [loadClientes, showToast]);

  const crearMascota = useCallback(async (data: CreateMascotaData): Promise<boolean> => {
    try {
      await recepcionistaClienteService.createMascota(data);
      showToast('Mascota registrada correctamente', 'success');
      await loadClientes();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al registrar mascota'), 'error');
      return false;
    }
  }, [loadClientes, showToast]);

  const actualizarMascota = useCallback(async (id: number, data: Partial<CreateMascotaData>): Promise<boolean> => {
    try {
      await recepcionistaClienteService.updateMascota(id, data);
      showToast('Mascota actualizada correctamente', 'success');
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar mascota'), 'error');
      return false;
    }
  }, [showToast]);

  return {
    clientes,
    searchTerm,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarSearchTerm,
    cambiarPagina: setCurrentPage,
    crearCliente,
    actualizarCliente,
    crearMascota,
    actualizarMascota,
    refresh: loadClientes,
  };
};
