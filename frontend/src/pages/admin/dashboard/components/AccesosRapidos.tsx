// src/pages/admin/dashboard/components/AccesosRapidos.tsx
import { 
  CalendarIcon, 
  DocumentChartBarIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

interface AccesosRapidosProps {
  onVerAgenda: () => void;
  onGenerarReporte: () => void;
  onVerAlertasStock: () => void;
}

export const AccesosRapidos = ({ onVerAgenda, onGenerarReporte, onVerAlertasStock }: AccesosRapidosProps) => {
  const accesos = [
    {
      title: 'Ver Agenda',
      description: 'Gestionar citas y horarios',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: onVerAgenda,
    },
    {
      title: 'Generar Reporte',
      description: 'Exportar estadísticas',
      icon: DocumentChartBarIcon,
      color: 'bg-green-500',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: onGenerarReporte,
    },
    {
      title: 'Alertas de Stock',
      description: 'Revisar inventario crítico',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: onVerAlertasStock,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {accesos.map((acceso, idx) => (
        <button
          key={idx}
          onClick={acceso.onClick}
          className="group flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${acceso.bgColor}`}>
              <acceso.icon className={`w-5 h-5 ${acceso.iconColor}`} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">{acceso.title}</p>
              <p className="text-xs text-gray-400">{acceso.description}</p>
            </div>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      ))}
    </div>
  );
};