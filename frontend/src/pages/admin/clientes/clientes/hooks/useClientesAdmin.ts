// src/pages/admin/clientes/clientes/hooks/useClientesAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { adminClientesService } from '../services/admin.clientes.service';
import type { ClienteAdmin, CreateClienteAdminData, UpdateClienteAdminData } from '../../../../../services/types/admin';

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

export const useClientesAdmin = () => {
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<boolean | undefined>(undefined);
  const [filtroPeriodo, setFiltroPeriodo] = useState<number | string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminClientesService.getClientes({
        search: searchTerm || undefined,
        activo: filtroActivo,
        periodo: filtroPeriodo,
        page: currentPage,
      });
      setClientes(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar clientes'), 'error');
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filtroActivo, filtroPeriodo, currentPage, showToast]);

  const cambiarSearchTerm = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroActivo = useCallback((activo: boolean | undefined) => {
    setFiltroActivo(activo);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroPeriodo = useCallback((periodo: number | string | undefined) => {
    setFiltroPeriodo(periodo);
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  const crearCliente = useCallback(async (data: CreateClienteAdminData): Promise<boolean> => {
    try {
      await adminClientesService.createCliente(data);
      showToast('Cliente creado exitosamente', 'success');
      await loadClientes();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear cliente'), 'error');
      return false;
    }
  }, [loadClientes, showToast]);

  const actualizarCliente = useCallback(async (id: number, data: UpdateClienteAdminData): Promise<boolean> => {
    try {
      await adminClientesService.updateCliente(id, data);
      showToast('Cliente actualizado exitosamente', 'success');
      await loadClientes();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar cliente'), 'error');
      return false;
    }
  }, [loadClientes, showToast]);

  const limpiarFiltros = useCallback(() => {
    setSearchTerm('');
    setFiltroActivo(undefined);
    setFiltroPeriodo(undefined);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const tieneFiltrosActivos = searchTerm !== '' || filtroActivo !== undefined || filtroPeriodo !== undefined;

  return {
    clientes,
    searchTerm,
    filtroActivo,
    filtroPeriodo,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    cambiarSearchTerm,
    cambiarFiltroActivo,
    cambiarFiltroPeriodo,
    cambiarPagina,
    crearCliente,
    actualizarCliente,
    limpiarFiltros,
    refresh: loadClientes,
  };
};