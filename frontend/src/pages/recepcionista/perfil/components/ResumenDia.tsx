// src/pages/recepcionista/perfil/components/ResumenDia.tsx
import { CalendarIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface ResumenDiaProps {
  data: {
    fecha: string;
    citas_creadas: number;
    citas_confirmadas: number;
    citas_canceladas: number;
    total_gestionadas: number;
  };
  isLoading: boolean;
}

export const ResumenDia = ({ data, isLoading }: ResumenDiaProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Día</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Citas Creadas',
      value: data.citas_creadas,
      icon: PlusCircleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Citas Confirmadas',
      value: data.citas_confirmadas,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Citas Canceladas',
      value: data.citas_canceladas,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Total Gestionadas',
      value: data.total_gestionadas,
      icon: CalendarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Resumen del Día
        <span className="text-sm font-normal text-gray-500 ml-2">({data.fecha})</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`${stat.bgColor} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};