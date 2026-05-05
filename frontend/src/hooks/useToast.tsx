// src/hooks/useToast.tsx (versión mejorada con componente visual)
import { useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
            toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
            toast.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
            toast.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
            'bg-blue-50 border-l-4 border-blue-500'
          }`}
        >
          {toast.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
          {toast.type === 'error' && <XCircleIcon className="h-5 w-5 text-red-500" />}
          {toast.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />}
          {toast.type === 'info' && <InformationCircleIcon className="h-5 w-5 text-blue-500" />}
          <span className={`text-sm ${
            toast.type === 'success' ? 'text-green-800' :
            toast.type === 'error' ? 'text-red-800' :
            toast.type === 'warning' ? 'text-yellow-800' :
            'text-blue-800'
          }`}>
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );

  return { showToast, ToastContainer };
};