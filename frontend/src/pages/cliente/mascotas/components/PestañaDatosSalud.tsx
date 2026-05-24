// src/pages/cliente/mascotas/components/PestañaDatosSalud.tsx
import { 
  ScaleIcon, 
  TagIcon, 
  CakeIcon, 
  FaceSmileIcon, 
  ExclamationCircleIcon, 
  NoSymbolIcon, 
  ShieldCheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import type { Mascota } from '../../../../services/types/cliente';

const normalizeList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }

    return value ? [value] : [];
  }

  return [];
};

interface PestañaDatosSaludProps {
  mascota: Mascota;
  onEditar: () => void;
}

export const PestañaDatosSalud = ({ mascota, onEditar }: PestañaDatosSaludProps) => {
  const datos = [
    { 
      label: 'Peso actual', 
      value: `${mascota.peso_kg} kg`, 
      icon: ScaleIcon,
      color: 'text-blue-500'
    },
    { 
      label: 'Rango asignado', 
      value: mascota.rango_nombre || 'No asignado', 
      icon: TagIcon,
      color: 'text-purple-500'
    },
    { 
      label: 'Fecha de nacimiento', 
      value: mascota.fecha_nacimiento ? new Date(mascota.fecha_nacimiento).toLocaleDateString('es-ES') : 'No registrada', 
      icon: CakeIcon,
      color: 'text-pink-500'
    },
    { 
      label: 'Temperamento', 
      value: mascota.temperamento || 'No registrado', 
      icon: FaceSmileIcon,
      color: 'text-yellow-500'
    },
  ];

  const listas = [
    { 
      label: 'Alergias', 
      items: normalizeList(mascota.alergias), 
      icon: ExclamationCircleIcon,
      color: 'text-red-500',
      emptyMessage: 'No hay alergias registradas'
    },
    { 
      label: 'Restricciones', 
      items: normalizeList(mascota.restricciones), 
      icon: NoSymbolIcon,
      color: 'text-orange-500',
      emptyMessage: 'No hay restricciones registradas'
    },
    { 
      label: 'Vacunas', 
      items: normalizeList(mascota.vacunas), 
      icon: ShieldCheckIcon,
      color: 'text-green-500',
      emptyMessage: 'No hay vacunas registradas'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Botón editar */}
      <div className="flex justify-end">
        <button
          onClick={onEditar}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
          Editar datos
        </button>
      </div>

      {/* Datos principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {datos.map((dato, idx) => {
          const IconComponent = dato.icon;
          return (
            <div key={idx} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IconComponent className={`h-4 w-4 ${dato.color}`} />
                <span className="text-xs text-gray-500">{dato.label}</span>
              </div>
              <p className="text-sm font-medium text-gray-800">{dato.value}</p>
            </div>
          );
        })}
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listas.map((lista, idx) => {
          const IconComponent = lista.icon;
          const hasItems = lista.items.length > 0;
          
          return (
            <div key={idx} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <IconComponent className={`h-4 w-4 ${lista.color}`} />
                <h4 className="text-sm font-medium text-gray-700">{lista.label}</h4>
              </div>
              {hasItems ? (
                <ul className="space-y-1">
                  {lista.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-gray-600 flex items-start gap-1">
                      <span className="text-gray-300">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">{lista.emptyMessage}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
