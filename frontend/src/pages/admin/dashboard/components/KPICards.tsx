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
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Ingresos Hoy',
      value: `Bs ${kpi.ingresos_hoy.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Groomers Activos',
      value: kpi.groomers_activos,
      icon: UserGroupIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Mascotas Atendidas',
      value: kpi.mascotas_atendidas,
      icon: HeartIcon,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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