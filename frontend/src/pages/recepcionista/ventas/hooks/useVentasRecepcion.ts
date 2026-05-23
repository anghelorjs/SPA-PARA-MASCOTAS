// src/pages/recepcionista/ventas/hooks/useVentasRecepcion.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { recepcionistaVentasService } from '../services/recepcionista.ventas.service';
import type { Venta, CreateVentaData, ProductoVenta, ItemCarrito, ClienteVenta } from '../../../../services/types/recepcionista';
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

export const useVentasRecepcion = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [totalDia, setTotalDia] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { showToast } = useToast();

  const loadVentas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await recepcionistaVentasService.getVentas(fecha, filtroEstado, currentPage);
      setVentas(response.ventas.data);
      setTotalDia(response.total_dia);
      setLastPage(response.ventas.last_page);
      setTotal(response.ventas.total);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar ventas'), 'error');
      setVentas([]);
    } finally {
      setIsLoading(false);
    }
  }, [fecha, filtroEstado, currentPage, showToast]);

  const cambiarFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha);
    setCurrentPage(1);
  }, []);

  const cambiarFiltroEstado = useCallback((nuevoFiltro: string) => {
    setFiltroEstado(nuevoFiltro);
    setCurrentPage(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setCurrentPage(pagina);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncVentas = async () => {
      await loadVentas();
      if (!isMounted) {
        return;
      }
    };

    void syncVentas();

    return () => {
      isMounted = false;
    };
  }, [loadVentas]);

  return {
    ventas,
    fecha,
    filtroEstado,
    totalDia,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarFecha,
    cambiarFiltroEstado,
    cambiarPagina,
    refresh: loadVentas,
  };
};

export const useNuevaVenta = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteVenta | null>(null);
  const [medioPago, setMedioPago] = useState<'efectivo' | 'qr' | 'transferencia'>('efectivo');
  const { showToast } = useToast();

  const totalCarrito = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  const agregarAlCarrito = (producto: ProductoVenta, varianteId: number, cantidad: number) => {
    const variante = producto.variantes.find(v => v.idVariante === varianteId);
    if (!variante) return false;

    if (variante.stock < cantidad) {
      showToast(`Stock insuficiente. Solo hay ${variante.stock} unidades disponibles.`, 'error');
      return false;
    }

    setCarrito(prev => {
      const existe = prev.find(item => item.idVariante === varianteId);
      if (existe) {
        const nuevaCantidad = existe.cantidad + cantidad;
        if (variante.stock < nuevaCantidad) {
          showToast(`Stock insuficiente. Solo hay ${variante.stock} unidades disponibles.`, 'error');
          return prev;
        }
        return prev.map(item =>
          item.idVariante === varianteId
            ? {
                ...item,
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * item.precioUnitario,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          idVariante: varianteId,
          nombreProducto: producto.nombre,
          nombreVariante: variante.nombreVariante,
          cantidad,
          precioUnitario: variante.precio,
          subtotal: cantidad * variante.precio,
          stock: variante.stock,
        },
      ];
    });
    return true;
  };

  const eliminarDelCarrito = (idVariante: number) => {
    setCarrito(prev => prev.filter(item => item.idVariante !== idVariante));
  };

  const actualizarCantidad = (idVariante: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(idVariante);
      return;
    }

    setCarrito(prev =>
      prev.map(item => {
        if (item.idVariante === idVariante) {
          if (item.stock < nuevaCantidad) {
            showToast(`Stock insuficiente. Solo hay ${item.stock} unidades disponibles.`, 'error');
            return item;
          }
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * item.precioUnitario,
          };
        }
        return item;
      })
    );
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setSelectedCliente(null);
    setMedioPago('efectivo');
  };

  const crearVenta = async (): Promise<Venta | null> => {
    if (carrito.length === 0) {
      showToast('Agrega al menos un producto a la venta', 'error');
      return null;
    }

    const items = carrito.map(item => ({
      idVariante: item.idVariante,
      cantidad: item.cantidad,
    }));

    const data: CreateVentaData = {
      idCliente: selectedCliente?.id || null,
      items,
      medioPago,
    };

    try {
      setIsLoading(true);
      const venta = await recepcionistaVentasService.crearVenta(data);
      showToast('Venta realizada exitosamente', 'success');
      limpiarCarrito();
      setIsOpen(false);
      return venta;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al crear venta'), 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    isLoading,
    carrito,
    totalCarrito,
    selectedCliente,
    medioPago,
    setSelectedCliente,
    setMedioPago,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
    crearVenta,
  };
};

export const useDetalleVenta = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [venta, setVenta] = useState<Venta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const loadDetalle = async (ventaId: number) => {
    try {
      setIsLoading(true);
      const data = await recepcionistaVentasService.getVenta(ventaId);
      setVenta(data);
      setIsOpen(true);
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al cargar detalle de venta'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const cerrar = () => {
    setIsOpen(false);
    setVenta(null);
  };

  return {
    isOpen,
    venta,
    isLoading,
    loadDetalle,
    cerrar,
  };
};