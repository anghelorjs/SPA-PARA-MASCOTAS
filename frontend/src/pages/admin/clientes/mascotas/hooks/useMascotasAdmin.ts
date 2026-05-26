// src/pages/admin/clientes/mascotas/hooks/useMascotasAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { adminMascotasService } from '../services/admin.mascotas.service';
import type { MascotaAdmin, CreateMascotaAdminData } from '../../../../../services/types/admin';

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

export const useMascotasAdmin = () => {
  const [mascotas, setMascotas] = useState<MascotaAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadMascotas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminMascotasService.getMascotas({
        search: searchTerm || undefined,
        especie: filtroEspecie || undefined,
        page: currentPage,
      });
      setMascotas(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar mascotas'), 'error');
      setMascotas([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filtroEspecie, currentPage, showToast]);

  const cambiarSearchTerm = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroEspecie = useCallback((especie: string) => {
    setFiltroEspecie(especie);
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  const crearMascota = useCallback(async (data: CreateMascotaAdminData): Promise<boolean> => {
    try {
      await adminMascotasService.createMascota(data);
      showToast('Mascota creada exitosamente', 'success');
      await loadMascotas();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear mascota'), 'error');
      return false;
    }
  }, [loadMascotas, showToast]);

  const actualizarMascota = useCallback(async (id: number, data: Partial<CreateMascotaAdminData>): Promise<boolean> => {
    try {
      await adminMascotasService.updateMascota(id, data);
      showToast('Mascota actualizada exitosamente', 'success');
      await loadMascotas();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar mascota'), 'error');
      return false;
    }
  }, [loadMascotas, showToast]);

  const limpiarFiltros = useCallback(() => {
    setSearchTerm('');
    setFiltroEspecie('');
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    loadMascotas();
  }, [loadMascotas]);

  const tieneFiltrosActivos = searchTerm !== '' || filtroEspecie !== '';

  return {
    mascotas,
    searchTerm,
    filtroEspecie,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    cambiarSearchTerm,
    cambiarFiltroEspecie,
    cambiarPagina,
    crearMascota,
    actualizarMascota,
    limpiarFiltros,
    refresh: loadMascotas,
  };
};