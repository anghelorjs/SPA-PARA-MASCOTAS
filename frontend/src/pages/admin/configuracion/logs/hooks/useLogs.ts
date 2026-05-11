import { useCallback, useEffect, useState } from 'react';
import { adminLogsService } from '../services/admin.logs.service';
import type {
  LogData,
  LogsFiltersParams,
  LogsStats,
  UsuarioOption,
} from '../services/admin.logs.service';
import { useToast } from '../../../../../hooks/useToast';

type LogsFiltersState = Required<Omit<LogsFiltersParams, 'page' | 'per_page'>>;

const emptyFilters: LogsFiltersState = {
  user_id: '',
  action: '',
  fecha_desde: '',
  fecha_hasta: '',
  search: '',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const buildParams = (filters: LogsFiltersState, page: number): LogsFiltersParams => {
  const params: LogsFiltersParams = { page, per_page: 15 };

  if (filters.user_id) params.user_id = filters.user_id;
  if (filters.action) params.action = filters.action;
  if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
  if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;
  if (filters.search.trim()) params.search = filters.search.trim();

  return params;
};

export const useLogs = () => {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [acciones, setAcciones] = useState<string[]>([]);
  const [stats, setStats] = useState<LogsStats | null>(null);
  const [filtros, setFiltros] = useState<LogsFiltersState>(emptyFilters);
  const { showToast } = useToast();

  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminLogsService.getLogs(buildParams(filtros, currentPage));

      setLogs(response.logs.data);
      setTotal(response.logs.total);
      setCurrentPage(response.logs.current_page);
      setLastPage(response.logs.last_page);
      setUsuarios(response.usuarios);
      setAcciones(response.acciones);
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al cargar logs'), 'error');
      setLogs([]);
      setTotal(0);
      setLastPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filtros, showToast]);

  const loadStats = useCallback(async () => {
    try {
      const data = await adminLogsService.getStats(filtros.fecha_desde, filtros.fecha_hasta);
      setStats(data);
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al cargar estadisticas'), 'error');
      setStats(null);
    }
  }, [filtros.fecha_desde, filtros.fecha_hasta, showToast]);

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  const changeFiltros = (newFiltros: Partial<LogsFiltersState>) => {
    setFiltros((prev) => ({ ...prev, ...newFiltros }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFiltros(emptyFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const hasActiveFilters = Object.values(filtros).some((value) => value !== '');

  return {
    logs,
    isLoading,
    total,
    currentPage,
    lastPage,
    usuarios,
    acciones,
    stats,
    filtros,
    hasActiveFilters,
    changePage,
    changeFiltros,
    clearFilters,
    loadLogs,
  };
};
