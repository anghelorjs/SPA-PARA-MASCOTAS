// src/pages/cliente/historial/servicios/hooks/useServiciosHistorial.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { clienteServiciosService } from '../services/cliente.servicios.service';
import type { ServicioHistorial, MascotaFiltro } from '../../../../../services/types/cliente';

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

export const useServiciosHistorial = () => {
  const [servicios, setServicios] = useState<ServicioHistorial[]>([]);
  const [mascotas, setMascotas] = useState<MascotaFiltro[]>([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadServicios = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await clienteServiciosService.getServicios(mascotaSeleccionada, currentPage);
      setServicios(response.servicios.data);
      setMascotas(response.mascotas);
      setLastPage(response.servicios.last_page);
      setTotal(response.servicios.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar historial de servicios'), 'error');
      setServicios([]);
    } finally {
      setIsLoading(false);
    }
  }, [mascotaSeleccionada, currentPage, showToast]);

  const cambiarMascota = useCallback((mascotaId: number | undefined) => {
    setMascotaSeleccionada(mascotaId);
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  useEffect(() => {
    loadServicios();
  }, [loadServicios]);

  return {
    servicios,
    mascotas,
    mascotaSeleccionada,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarMascota,
    cambiarPagina,
    refresh: loadServicios,
  };
};