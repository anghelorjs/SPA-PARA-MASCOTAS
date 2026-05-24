// src/pages/groomer/dashboard/components/CountdownTimer.tsx
import { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface CountdownTimerProps {
  minutes: number;
  onComplete?: () => void;
}

export const CountdownTimer = ({ minutes, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(minutes);

  useEffect(() => {
    if (minutes <= 0) return;

    const timeout = setTimeout(() => {
      setTimeLeft(minutes);
    }, 0);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Actualizar cada minuto

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [minutes, onComplete]);

  if (minutes <= 0) return null;

  const horas = Math.floor(timeLeft / 60);
  const mins = timeLeft % 60;

  let colorClass = 'text-green-600 bg-green-50';
  if (timeLeft < 60) colorClass = 'text-orange-600 bg-orange-50';
  if (timeLeft < 30) colorClass = 'text-red-600 bg-red-50';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colorClass}`}>
      <ClockIcon className="h-4 w-4" />
      <span className="text-sm font-semibold">
        {horas > 0 ? `${horas}h ${mins}min` : `${mins} min`}
      </span>
    </div>
  );
};