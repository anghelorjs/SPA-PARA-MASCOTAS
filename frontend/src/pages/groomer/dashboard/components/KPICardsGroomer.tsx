// src/pages/groomer/dashboard/components/KPICardsGroomer.tsx
import { CalendarIcon, CheckCircleIcon, PlayCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { DashboardKPI } from '../../../../services/types/groomer';
import { CountdownTimer } from './CountdownTimer';

interface KPICardsGroomerProps {
  kpi: DashboardKPI;
  onRefresh?: () => void;
}

export const KPICardsGroomer = ({ kpi, onRefresh }: KPICardsGroomerProps) => {
  const cards = [
    {
      title: 'Total Citas Hoy',
      value: kpi.total_citas_hoy,
      icon: CalendarIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Completadas',
      value: kpi.citas_completadas,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'En Curso',
      value: kpi.citas_en_curso,
      icon: PlayCircleIcon,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Pendientes',
      value: kpi.citas_pendientes,
      icon: ClockIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.bgColor} p-2.5 rounded-xl`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Próxima cita */}
      {kpi.proxima_cita && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <ExclamationCircleIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-indigo-600 font-medium">PRÓXIMA CITA</p>
                <p className="text-sm font-semibold text-gray-800">
                  {kpi.proxima_cita.mascota} - {kpi.proxima_cita.hora}
                </p>
              </div>
            </div>
            <CountdownTimer 
              minutes={kpi.proxima_cita.minutos_restantes} 
              onComplete={onRefresh}
            />
          </div>
        </div>
      )}
    </div>
  );
};