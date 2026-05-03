// src/pages/admin/dashboard/components/KPICards.tsx
import { CalendarIcon, CurrencyDollarIcon, UserGroupIcon, HeartIcon } from '@heroicons/react/24/outline';

interface KPICardsProps {
  kpi: {
    total_citas_hoy: number;
    ingresos_hoy: number;
    groomers_activos: number;
    mascotas_atendidas: number;
  };
}

export const KPICards = ({ kpi }: KPICardsProps) => {
  const cards = [
    {
      title: 'Citas Hoy',
      value: kpi.total_citas_hoy,
      icon: CalendarIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Ingresos Hoy',
      value: `$${kpi.ingresos_hoy.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Groomers Activos',
      value: kpi.groomers_activos,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Mascotas Atendidas',
      value: kpi.mascotas_atendidas,
      icon: HeartIcon,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};