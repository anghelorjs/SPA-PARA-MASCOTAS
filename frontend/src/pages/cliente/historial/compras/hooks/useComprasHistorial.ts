// src/pages/cliente/historial/compras/hooks/useComprasHistorial.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { clienteComprasService } from '../services/cliente.compras.service';
import type { CompraHistorial } from '../../../../../services/types/cliente';

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

export const useComprasHistorial = () => {
  const [compras, setCompras] = useState<CompraHistorial[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadCompras = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clienteComprasService.getCompras(filtroEstado, fechaDesde || undefined, fechaHasta || undefined);
      setCompras(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar historial de compras'), 'error');
      setCompras([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroEstado, fechaDesde, fechaHasta, showToast]);

  const cambiarFiltroEstado = useCallback((estado: string) => {
    setFiltroEstado(estado);
  }, []);

  const cambiarFechaDesde = useCallback((fecha: string) => {
    setFechaDesde(fecha);
  }, []);

  const cambiarFechaHasta = useCallback((fecha: string) => {
    setFechaHasta(fecha);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltroEstado('todas');
    setFechaDesde('');
    setFechaHasta('');
  }, []);

  const cancelarPedido = useCallback(async (id: number): Promise<boolean> => {
    try {
      await clienteComprasService.cancelarPedido(id);
      showToast('Pedido cancelado correctamente', 'success');
      await loadCompras();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cancelar pedido'), 'error');
      return false;
    }
  }, [loadCompras, showToast]);

  useEffect(() => {
    loadCompras();
  }, [loadCompras]);

  const tieneFiltrosActivos = filtroEstado !== 'todas' || fechaDesde !== '' || fechaHasta !== '';

  return {
    compras,
    filtroEstado,
    fechaDesde,
    fechaHasta,
    isLoading,
    tieneFiltrosActivos,
    cambiarFiltroEstado,
    cambiarFechaDesde,
    cambiarFechaHasta,
    limpiarFiltros,
    cancelarPedido,
    refresh: loadCompras,
  };
};