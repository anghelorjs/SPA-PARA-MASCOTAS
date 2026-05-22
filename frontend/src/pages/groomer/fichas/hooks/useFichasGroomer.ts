// src/pages/groomer/fichas/hooks/useFichasGroomer.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { groomerFichasService } from '../services/groomer.fichas.service';
import type { FichaHoy, FichaTodas, DetalleFichaResponse } from '../types';
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

export const useFichasHoy = () => {
  const [fichas, setFichas] = useState<FichaHoy[]>([]);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'abierta' | 'cerrada'>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadFichas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await groomerFichasService.getFichasHoy(fecha, filtroEstado, currentPage);
      setFichas(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar fichas'), 'error');
      setFichas([]);
    } finally {
      setIsLoading(false);
    }
  }, [fecha, filtroEstado, currentPage, showToast]);

  const cambiarFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroEstado = useCallback((nuevoFiltro: 'todas' | 'abierta' | 'cerrada') => {
    setFiltroEstado(nuevoFiltro);
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  useEffect(() => {
    loadFichas();
  }, [loadFichas]);

  return {
    fichas,
    fecha,
    filtroEstado,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFecha,
    cambiarFiltroEstado,
    cambiarPagina,
    refresh: loadFichas,
  };
};

export const useTodasFichas = () => {
  const [fichas, setFichas] = useState<FichaTodas[]>([]);
  const [search, setSearch] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'abierta' | 'cerrada'>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const loadFichas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await groomerFichasService.getTodasFichas({
        search: search || undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        estado: filtroEstado,
        page: currentPage,
        per_page: 15,
      });
      setFichas(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar fichas'), 'error');
      setFichas([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, fechaDesde, fechaHasta, filtroEstado, currentPage, showToast]);

  const aplicarFiltros = useCallback(() => {
    setCurrentPage(1);
    loadFichas();
  }, [loadFichas]);

  const limpiarFiltros = useCallback(() => {
    setSearch('');
    setFechaDesde('');
    setFechaHasta('');
    setFiltroEstado('todas');
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  useEffect(() => {
    loadFichas();
  }, [loadFichas]);

  return {
    fichas,
    search,
    fechaDesde,
    fechaHasta,
    filtroEstado,
    isLoading,
    currentPage,
    lastPage,
    total,
    setSearch,
    setFechaDesde,
    setFechaHasta,
    setFiltroEstado,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    refresh: loadFichas,
  };
};

export const useDetalleFicha = (fichaId: number | undefined) => {
  const [ficha, setFicha] = useState<DetalleFichaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const loadDetalle = useCallback(async () => {
    if (!fichaId) return;
    try {
      setIsLoading(true);
      const data = await groomerFichasService.getDetalleFicha(fichaId);
      setFicha(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar detalle de ficha'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fichaId, showToast]);

  useEffect(() => {
    loadDetalle();
  }, [loadDetalle]);

  const updateEstadoIngreso = async (data: {
    estadoIngreso?: string;
    nudos?: boolean;
    tienePulgas?: boolean;
    tieneHeridas?: boolean;
  }) => {
    if (!fichaId) return;
    try {
      setIsSaving(true);
      await groomerFichasService.updateEstadoIngreso(fichaId, data);
      await loadDetalle();
      showToast('Estado de ingreso actualizado', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateChecklist = async (checklist: { nombre: string; completado: boolean; observacion?: string }[]) => {
    if (!fichaId) return;
    try {
      setIsSaving(true);
      await groomerFichasService.updateChecklist(fichaId, checklist);
      await loadDetalle();
      showToast('Checklist actualizado', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al actualizar checklist'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const agregarInsumo = async (idInsumo: number, cantidadUsada: number) => {
    if (!fichaId) return false;
    try {
      setIsSaving(true);
      await groomerFichasService.agregarInsumo(fichaId, idInsumo, cantidadUsada);
      await loadDetalle();
      showToast('Insumo agregado', 'success');
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al agregar insumo'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const eliminarInsumo = async (detalleId: number) => {
    if (!fichaId) return;
    try {
      setIsSaving(true);
      await groomerFichasService.eliminarInsumo(fichaId, detalleId);
      await loadDetalle();
      showToast('Insumo eliminado', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al eliminar insumo'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateObservaciones = async (observaciones: string | null, recomendaciones: string | null) => {
    if (!fichaId) return;
    try {
      setIsSaving(true);
      await groomerFichasService.updateObservaciones(fichaId, { observaciones, recomendaciones });
      await loadDetalle();
      showToast('Observaciones guardadas', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al guardar observaciones'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadFoto = async (tipo: 'antes' | 'despues', file: File) => {
    if (!fichaId) return null;
    try {
      setIsSaving(true);
      const foto = await groomerFichasService.uploadFoto(fichaId, tipo, file);
      setFicha(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          fotos: {
            ...prev.fotos,
            [tipo === 'antes' ? 'antes' : 'despues']: [...prev.fotos[tipo === 'antes' ? 'antes' : 'despues'], foto]
          }
        };
      });
      showToast('Foto subida correctamente', 'success');
      return foto;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al subir foto'), 'error');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFoto = async (fotoId: number) => {
    if (!fichaId) return;
    try {
      setIsSaving(true);
      await groomerFichasService.deleteFoto(fichaId, fotoId);
      await loadDetalle();
      showToast('Foto eliminada', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al eliminar foto'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const cerrarFicha = async () => {
    if (!fichaId) return null;
    try {
      setIsSaving(true);
      const result = await groomerFichasService.cerrarFicha(fichaId);
      await loadDetalle();
      showToast('Ficha cerrada correctamente', 'success');
      return result;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cerrar ficha'), 'error');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
    refresh: loadDetalle,
  };
};
