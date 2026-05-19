import { useEffect, useState } from 'react';

interface InactivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  timeRemaining?: number; 
}

export const InactivityModal = ({ 
  isOpen, 
  onClose, 
  onLogout, 
  timeRemaining = 30 
}: InactivityModalProps) => {
  const [secondsLeft, setSecondsLeft] = useState(timeRemaining);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(timeRemaining);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onLogout, timeRemaining]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sesión por expirar</h3>
          <p className="text-sm text-gray-500 mb-4">
            Has estado inactivo por un tiempo. ¿Deseas continuar en la sesión?
          </p>
          <p className="text-xs text-gray-400 mb-4">
            La sesión se cerrará automáticamente en {secondsLeft} segundos.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuar sesión
            </button>
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};