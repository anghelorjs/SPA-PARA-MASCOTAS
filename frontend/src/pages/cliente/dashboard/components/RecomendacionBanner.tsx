// src/pages/cliente/dashboard/components/RecomendacionBanner.tsx
import { ChatBubbleLeftRightIcon, HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { RecomendacionCliente } from '../../../../services/types/cliente';

interface RecomendacionBannerProps {
  recomendacion: RecomendacionCliente;
  onVerHistorial: () => void;
}

export const RecomendacionBanner = ({ recomendacion, onVerHistorial }: RecomendacionBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-green-100 rounded-full">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Recomendación del groomer</h3>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{recomendacion.fecha}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{recomendacion.recomendacion}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <HeartIcon className="h-3 w-3 text-green-500" />
              <span>{recomendacion.mascota}</span>
              <span className="text-gray-300">|</span>
              <span>{recomendacion.servicio}</span>
              <span className="text-gray-300">|</span>
              <span>{recomendacion.groomer}</span>
            </div>
            <button
              onClick={onVerHistorial}
              className="mt-3 flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
            >
              Ver historial
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};