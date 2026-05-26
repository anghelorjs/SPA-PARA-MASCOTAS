// src/pages/cliente/catalogo/hooks/useCarritoCliente.ts
import { useState } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { clienteCatalogoService } from '../services/cliente.catalogo.service';
import type { ItemCarrito, CrearPedidoData } from '../../../../services/types/cliente';
import { useCart } from '../context/CartContext';

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

export const useCarritoCliente = () => {
  const { items, totalItems, subtotal, eliminarDelCarrito, actualizarCantidad, limpiarCarrito } = useCart();
  const [canal, setCanal] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const enviarPedido = async (): Promise<string | null> => {
    if (items.length === 0) {
      showToast('El carrito está vacío', 'error');
      return null;
    }

    const pedidoData: CrearPedidoData = {
      items: items.map(item => ({
        idVariante: item.idVariante,
        cantidad: item.cantidad,
      })),
      canal,
    };

    try {
      setIsSubmitting(true);
      const response = await clienteCatalogoService.crearPedido(pedidoData);
      showToast('Pedido preparado correctamente', 'success');
      limpiarCarrito();
      return response.enlace;
    } catch (error) {
      showToast(getErrorMessage(error, 'Error al procesar el pedido'), 'error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    items,
    totalItems,
    subtotal,
    canal,
    isSubmitting,
    setCanal,
    eliminarDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
    enviarPedido,
  };
};