// src/pages/admin/configuracion/logs/components/LogsFilters.tsx
import type { ChangeEvent } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface UsuarioOption {
  id: number;
  nombre: string;
}

interface LogsFiltersState {
  user_id: string;
  action: string;
  fecha_desde: string;
  fecha_hasta: string;
  search: string;
}

interface LogsFiltersProps {
  usuarios: UsuarioOption[];
  acciones: string[];
  filtros: LogsFiltersState;
  onFiltroChange: (filtros: Partial<LogsFiltersState>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

// Etiquetas legibles para las acciones
const actionLabels: Record<string, string> = {
  login:                 'Inicio de sesión',
  login_failed:          'Intento fallido',
  logout:                'Cierre de sesión',
  register:              'Registro',
  activate_account:      'Activar cuenta',
  force_change_password: 'Cambio obligatorio',
  change_password:       'Cambio de contraseña',
  forgot_password:       'Recuperar contraseña',
  create_user:           'Crear usuario',
  update_user:           'Actualizar usuario',
  delete_user:           'Desactivar usuario',
  reset_password:        'Restablecer contraseña',
  resend_credentials:    'Reenviar credenciales',
  create_cliente:        'Crear cliente',
  update_cliente:        'Actualizar cliente',
  delete_cliente:        'Desactivar cliente',
  create_mascota:        'Crear mascota',
  update_mascota:        'Actualizar mascota',
  delete_mascota:        'Eliminar mascota',
  create_servicio:       'Crear servicio',
  update_servicio:       'Actualizar servicio',
  delete_servicio:       'Eliminar servicio',
  create_rango:          'Crear rango de peso',
  update_rango:          'Actualizar rango',
  delete_rango:          'Eliminar rango',
  create_producto:       'Crear producto',
  update_producto:       'Actualizar producto',
  toggle_producto:       'Cambiar estado producto',
  delete_producto:       'Desactivar producto',
  create_insumo:         'Crear insumo',
  update_insumo:         'Actualizar insumo',
  delete_insumo:         'Eliminar insumo',
  adjust_stock:          'Ajustar stock',
  create_categoria:      'Crear categoría',
  update_categoria:      'Actualizar categoría',
  delete_categoria:      'Eliminar categoría',
  create_movimiento:     'Registrar movimiento',
  create_cita:           'Crear cita',
  update_cita:           'Actualizar cita',
  confirm_cita:          'Confirmar cita',
  cancel_cita:           'Cancelar cita',
  reschedule_cita:       'Reprogramar cita',
  open_ficha:            'Abrir ficha',
  close_ficha:           'Cerrar ficha',
  upload_foto:           'Subir foto',
  delete_foto:           'Eliminar foto',
  create_venta:          'Crear venta',
  create_pedido:         'Crear pedido',
};

const getActionLabel = (action: string) =>
  actionLabels[action] ?? action.replace(/_/g, ' ');

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
  'placeholder-gray-400 transition-colors';

export const LogsFilters = ({
  usuarios,
  acciones,
  filtros,
  onFiltroChange,
  onClearFilters,
  hasActiveFilters,
}: LogsFiltersProps) => {
  const handle =
    (key: keyof LogsFiltersState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onFiltroChange({ [key]: e.target.value });
    };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header de la sección */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full">
              Activos
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Primera fila: buscador (ancho completo) + usuario + acción */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Buscador */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar descripción, IP..."
            value={filtros.search}
            onChange={handle('search')}
            className={`${inputClass} pl-8`}
          />
        </div>

        {/* Usuario */}
        <select
          value={filtros.user_id}
          onChange={handle('user_id')}
          className={inputClass}
        >
          <option value="">Todos los usuarios</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>

        {/* Acción */}
        <select
          value={filtros.action}
          onChange={handle('action')}
          className={inputClass}
        >
          <option value="">Todas las acciones</option>
          {acciones.map((a) => (
            <option key={a} value={a}>
              {getActionLabel(a)}
            </option>
          ))}
        </select>
      </div>

      {/* Segunda fila: fechas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={filtros.fecha_desde}
            onChange={handle('fecha_desde')}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={filtros.fecha_hasta}
            onChange={handle('fecha_hasta')}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
};