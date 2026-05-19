import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

interface UseIdleTimerOptions {
  timeout?: number; 
  onIdle?: () => void;
  events?: string[]; 
}

export const useIdleTimer = ({ 
  timeout = 30 * 60 * 1000, // 30 minutos
  onIdle,
  events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'click', 'touchstart']
}: UseIdleTimerOptions = {}) => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { logout } = useAuth();

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsIdle(false);
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle?.();
    }, timeout);
  }, [timeout, onIdle]);

  useEffect(() => {
    const handleActivity = () => {
      resetTimer();
    };

    // Agregar event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Iniciar timer
    resetTimer();

    // Limpiar
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [events, resetTimer]);

  // Función para cerrar sesión automáticamente
  const logoutOnIdle = useCallback(async () => {
    if (isIdle) {
      await logout();
      window.location.href = '/login';
    }
  }, [isIdle, logout]);

  return { isIdle, resetTimer, logoutOnIdle };
};