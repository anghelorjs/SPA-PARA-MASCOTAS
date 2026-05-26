// src/pages/cliente/catalogo/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ItemCarrito } from '../../../../services/types/cliente';
import { useToast } from '../../../../hooks/useToast';

interface CartContextType {
  items: ItemCarrito[];
  totalItems: number;
  subtotal: number;
  agregarAlCarrito: (item: Omit<ItemCarrito, 'subtotal'> & { cantidad?: number }) => void;
  eliminarDelCarrito: (idVariante: number) => void;
  actualizarCantidad: (idVariante: number, cantidad: number) => void;
  limpiarCarrito: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'petspa_carrito';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const { showToast } = useToast();

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Error al cargar carrito:', e);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  const agregarAlCarrito = (item: Omit<ItemCarrito, 'subtotal'> & { cantidad?: number }) => {
    const cantidad = item.cantidad || 1;
    
    setItems(prev => {
      const existe = prev.find(i => i.idVariante === item.idVariante);
      
      if (existe) {
        const nuevaCantidad = existe.cantidad + cantidad;
        if (nuevaCantidad > item.stock) {
          showToast(`Stock insuficiente. Solo hay ${item.stock} unidades disponibles`, 'error');
          return prev;
        }
        return prev.map(i =>
          i.idVariante === item.idVariante
            ? {
                ...i,
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * i.precioUnitario,
              }
            : i
        );
      }
      
      return [
        ...prev,
        {
          ...item,
          cantidad,
          subtotal: cantidad * item.precioUnitario,
        },
      ];
    });
    
    showToast(`${item.nombreProducto} agregado al carrito`, 'success');
  };

  const eliminarDelCarrito = (idVariante: number) => {
    setItems(prev => prev.filter(i => i.idVariante !== idVariante));
    showToast('Producto eliminado del carrito', 'info');
  };

  const actualizarCantidad = (idVariante: number, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(idVariante);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.idVariante === idVariante
          ? {
              ...item,
              cantidad,
              subtotal: cantidad * item.precioUnitario,
            }
          : item
      )
    );
  };

  const limpiarCarrito = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        limpiarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};