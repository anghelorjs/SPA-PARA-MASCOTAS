// src/pages/cliente/perfil/components/MascotasResumen.tsx
import { HeartIcon } from '@heroicons/react/24/outline';
import type { MascotaResumenData } from '../services/cliente.perfil.service';

interface MascotasResumenProps {
  mascotas: MascotaResumenData[];
}

export const MascotasResumen = ({ mascotas }: MascotasResumenProps) => {
  if (mascotas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Mascotas</h3>
        <div className="text-center py-8 text-gray-500">
          <HeartIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No tienes mascotas registradas</p>
          <p className="text-sm mt-1">Ve a "Mis Mascotas" para agregar una</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Mascotas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mascotas.map((mascota) => (
          <div
            key={mascota.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {mascota.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{mascota.nombre}</p>
              <p className="text-xs text-gray-500">
                {mascota.especie} • {mascota.raza || 'Sin raza'}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right">
        <a href="/cliente/mis-mascotas" className="text-sm text-blue-600 hover:text-blue-700">
          Ver todas →
        </a>
      </div>
    </div>
  );
};