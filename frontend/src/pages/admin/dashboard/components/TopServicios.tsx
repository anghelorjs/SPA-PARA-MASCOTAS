import { SparklesIcon } from '@heroicons/react/24/outline';
import { TrophyIcon } from '@heroicons/react/24/solid';

interface TopServiciosProps {
  data: Array<{ nombre: string; total: number }>;
}

export const TopServicios = ({ data }: TopServiciosProps) => {
  const maxTotal = Math.max(...data.map(item => item.total));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-semibold text-gray-900">Top Servicios Más Solicitados</h3>
        </div>
        <TrophyIcon className="w-5 h-5 text-yellow-500" />
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.total / maxTotal) * 100;
          return (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {item.nombre}
                  </span>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  {item.total} citas
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
};