// src/pages/recepcionista/dashboard/components/KPICardsRecepcion.tsx
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  PlayCircleIcon, 
  ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/outline';
import type { DashboardKPIRecepcion } from '../../../../services/types/recepcionista';

interface KPICardsRecepcionProps {
  kpi: DashboardKPIRecepcion;
}

export const KPICardsRecepcion = ({ kpi }: KPICardsRecepcionProps) => {
  const cards = [
    {
      title: 'Total Citas Hoy',
      value: kpi.total_citas_hoy,
      icon: CalendarIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Confirmadas',
      value: kpi.citas_confirmadas_hoy,
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'En Curso',
      value: kpi.citas_en_curso,
      icon: PlayCircleIcon,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Completadas',
      value: kpi.citas_completadas_hoy,
      icon: ClipboardDocumentCheckIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
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
  );
};