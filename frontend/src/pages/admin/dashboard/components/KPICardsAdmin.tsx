// src/pages/admin/dashboard/components/KPICardsAdmin.tsx
import { 
  CalendarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  HeartIcon 
} from '@heroicons/react/24/outline';
import type { DashboardKPIAdmin } from '../../../../services/types/admin';

interface KPICardsAdminProps {
  kpi: DashboardKPIAdmin;
}

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const KPICardsAdmin = ({ kpi }: KPICardsAdminProps) => {
  const totalCitas = toNumber(kpi.total_citas_hoy);
  const ingresos = toNumber(kpi.ingresos_hoy);
  const groomersActivos = toNumber(kpi.groomers_activos);
  const mascotasAtendidas = toNumber(kpi.mascotas_atendidas);

  const cards = [
    {
      title: 'Total Citas Hoy',
      value: totalCitas,
      icon: CalendarIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Ingresos Hoy',
      value: `Bs ${ingresos.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Groomers Activos',
      value: groomersActivos,
      icon: UserGroupIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Mascotas Atendidas',
      value: mascotasAtendidas,
      icon: HeartIcon,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
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