// src/pages/groomer/dashboard/components/RecomendacionesList.tsx
import { ChatBubbleLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { RecomendacionDashboard } from '../../../../services/types/groomer';

interface RecomendacionesListProps {
  recomendaciones: RecomendacionDashboard[];
  isLoading: boolean;
  onVerFicha: (fichaId: number) => void;
}

export const RecomendacionesList = ({ recomendaciones, isLoading, onVerFicha }: RecomendacionesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (recomendaciones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ChatBubbleLeftIcon className="h-10 w-10 mx-auto mb-2" />
        <p className="text-sm">No hay recomendaciones recientes</p>
        <p className="text-xs mt-1">Las recomendaciones aparecerán aquí cuando cierres fichas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recomendaciones.map((rec) => (
        <button
          key={rec.id}
          onClick={() => onVerFicha(rec.id)}
          className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-800">{rec.mascota}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{rec.servicio}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{rec.recomendacion}</p>
              <p className="text-xs text-gray-400 mt-2">{rec.fecha}</p>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          </div>
        </button>
      ))}
    </div>
  );
};