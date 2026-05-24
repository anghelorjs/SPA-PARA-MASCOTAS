// src/pages/cliente/dashboard/components/AccesosDirectos.tsx
import { 
  CalendarIcon, 
  HeartIcon, 
  ShoppingBagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface AccesosDirectosProps {
  onAgendarCita: () => void;
  onVerMascotas: () => void;
  onVerCatalogo: () => void;
}

export const AccesosDirectos = ({ onAgendarCita, onVerMascotas, onVerCatalogo }: AccesosDirectosProps) => {
  const accesos = [
    {
      title: 'Agendar cita',
      description: 'Programa un nuevo servicio',
      icon: CalendarIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      onClick: onAgendarCita,
    },
    {
      title: 'Ver mis mascotas',
      description: 'Gestiona tus mascotas',
      icon: HeartIcon,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      onClick: onVerMascotas,
    },
    {
      title: 'Ver catálogo',
      description: 'Productos disponibles',
      icon: ShoppingBagIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      onClick: onVerCatalogo,
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