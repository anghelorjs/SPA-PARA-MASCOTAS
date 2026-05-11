// src/pages/admin/configuracion/logs/components/LogsTable.tsx
import { useState } from 'react';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { LogData } from '../services/admin.logs.service';
import Pagination from '../../../../../components/common/Pagination';

interface LogsTableProps {
  logs: LogData[];
  isLoading: boolean;
  total: number;
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

// ── Configuración de badges de acción ────────────────────────────────────────

const ACTION_CONFIG: Record<string, { label: string; cls: string }> = {
  login:                 { label: 'Login',              cls: 'bg-green-100 text-green-700' },
  login_failed:          { label: 'Login fallido',      cls: 'bg-red-100 text-red-700' },
  logout:                { label: 'Logout',             cls: 'bg-gray-100 text-gray-600' },
  register:              { label: 'Registro',           cls: 'bg-emerald-100 text-emerald-700' },
  activate_account:      { label: 'Activar cuenta',     cls: 'bg-teal-100 text-teal-700' },
  force_change_password: { label: 'Cambio obligatorio', cls: 'bg-orange-100 text-orange-700' },
  change_password:       { label: 'Cambio contraseña',  cls: 'bg-amber-100 text-amber-700' },
  forgot_password:       { label: 'Recuperar clave',    cls: 'bg-yellow-100 text-yellow-700' },
  create_user:           { label: 'Crear usuario',      cls: 'bg-blue-100 text-blue-700' },
  update_user:           { label: 'Editar usuario',     cls: 'bg-blue-100 text-blue-700' },
  delete_user:           { label: 'Desact. usuario',    cls: 'bg-red-100 text-red-700' },
  reset_password:        { label: 'Reset contraseña',   cls: 'bg-orange-100 text-orange-700' },
  resend_credentials:    { label: 'Reenviar creds.',    cls: 'bg-cyan-100 text-cyan-700' },
  create_cliente:        { label: 'Crear cliente',      cls: 'bg-violet-100 text-violet-700' },
  update_cliente:        { label: 'Editar cliente',     cls: 'bg-violet-100 text-violet-700' },
  delete_cliente:        { label: 'Desact. cliente',    cls: 'bg-red-100 text-red-700' },
  create_mascota:        { label: 'Crear mascota',      cls: 'bg-pink-100 text-pink-700' },
  update_mascota:        { label: 'Editar mascota',     cls: 'bg-pink-100 text-pink-700' },
  delete_mascota:        { label: 'Elim. mascota',      cls: 'bg-red-100 text-red-700' },
  create_servicio:       { label: 'Crear servicio',     cls: 'bg-indigo-100 text-indigo-700' },
  update_servicio:       { label: 'Editar servicio',    cls: 'bg-indigo-100 text-indigo-700' },
  delete_servicio:       { label: 'Elim. servicio',     cls: 'bg-red-100 text-red-700' },
  create_rango:          { label: 'Crear rango',        cls: 'bg-sky-100 text-sky-700' },
  update_rango:          { label: 'Editar rango',       cls: 'bg-sky-100 text-sky-700' },
  delete_rango:          { label: 'Elim. rango',        cls: 'bg-red-100 text-red-700' },
  create_producto:       { label: 'Crear producto',     cls: 'bg-emerald-100 text-emerald-700' },
  update_producto:       { label: 'Editar producto',    cls: 'bg-emerald-100 text-emerald-700' },
  toggle_producto:       { label: 'Estado producto',    cls: 'bg-emerald-100 text-emerald-700' },
  delete_producto:       { label: 'Desact. producto',   cls: 'bg-red-100 text-red-700' },
  create_insumo:         { label: 'Crear insumo',       cls: 'bg-lime-100 text-lime-700' },
  update_insumo:         { label: 'Editar insumo',      cls: 'bg-lime-100 text-lime-700' },
  delete_insumo:         { label: 'Elim. insumo',       cls: 'bg-red-100 text-red-700' },
  adjust_stock:          { label: 'Ajustar stock',      cls: 'bg-yellow-100 text-yellow-700' },
  create_categoria:      { label: 'Crear categoría',    cls: 'bg-teal-100 text-teal-700' },
  update_categoria:      { label: 'Editar categoría',   cls: 'bg-teal-100 text-teal-700' },
  delete_categoria:      { label: 'Elim. categoría',    cls: 'bg-red-100 text-red-700' },
  create_movimiento:     { label: 'Movimiento inv.',    cls: 'bg-slate-100 text-slate-700' },
  create_cita:           { label: 'Crear cita',         cls: 'bg-sky-100 text-sky-700' },
  update_cita:           { label: 'Editar cita',        cls: 'bg-sky-100 text-sky-700' },
  confirm_cita:          { label: 'Confirmar cita',     cls: 'bg-green-100 text-green-700' },
  cancel_cita:           { label: 'Cancelar cita',      cls: 'bg-red-100 text-red-700' },
  reschedule_cita:       { label: 'Reprogramar cita',   cls: 'bg-amber-100 text-amber-700' },
  open_ficha:            { label: 'Abrir ficha',        cls: 'bg-purple-100 text-purple-700' },
  close_ficha:           { label: 'Cerrar ficha',       cls: 'bg-purple-100 text-purple-700' },
  upload_foto:           { label: 'Subir foto',         cls: 'bg-rose-100 text-rose-700' },
  delete_foto:           { label: 'Elim. foto',         cls: 'bg-red-100 text-red-700' },
  create_venta:          { label: 'Crear venta',        cls: 'bg-green-100 text-green-700' },
  create_pedido:         { label: 'Crear pedido',       cls: 'bg-orange-100 text-orange-700' },
};

const getActionCfg = (action: string) =>
  ACTION_CONFIG[action] ?? {
    label: action.replace(/_/g, ' '),
    cls: 'bg-gray-100 text-gray-600',
  };

const formatDate = (date: string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('es-BO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatUserName = (log: LogData) => {
  if (!log.user) return 'Sistema';
  return [log.user.nombre, log.user.apellido].filter(Boolean).join(' ');
};

// ── Componente principal ──────────────────────────────────────────────────────

export const LogsTable = ({
  logs,
  isLoading,
  total,
  currentPage,
  lastPage,
  onPageChange,
}: LogsTableProps) => {
  const [selectedLog, setSelectedLog] = useState<LogData | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
        <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-blue-600" />
        <p className="mt-2 text-sm text-gray-400">Cargando registros...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
        <p className="text-sm text-gray-400">Sin registros para los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Fecha / Hora', 'Usuario', 'Acción', 'Descripción', 'IP', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => {
                const cfg = getActionCfg(log.action);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    {/* Fecha */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(log.created_at)}
                    </td>

                    {/* Usuario */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {formatUserName(log)}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight">{log.user?.email ?? '—'}</p>
                    </td>

                    {/* Acción */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Descripción */}
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-gray-700 truncate">{log.description ?? '—'}</p>
                    </td>

                    {/* IP */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500">
                      {log.ip_address ?? '—'}
                    </td>

                    {/* Ver detalle */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      {/* Modal detalle — compacto */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Detalle del registro</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionCfg(selectedLog.action).cls}`}>
                  {getActionCfg(selectedLog.action).label}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Cuerpo del modal — grid de campos */}
            <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">

              {/* Fila 1: ID + Fecha */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="ID" value={String(selectedLog.id)} />
                <Field label="Fecha / Hora" value={formatDate(selectedLog.created_at)} />
              </div>

              {/* Fila 2: Usuario + Email */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Usuario" value={formatUserName(selectedLog)} />
                <Field label="Email" value={selectedLog.user?.email ?? '—'} />
              </div>

              {/* Descripción */}
              <Field label="Descripción" value={selectedLog.description ?? '—'} />

              {/* Fila 3: IP + Rol */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="IP" value={selectedLog.ip_address ?? '—'} mono />
                <Field label="Rol" value={selectedLog.user?.rol ?? '—'} />
              </div>

              {/* Navegador */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Navegador / Equipo</p>
                <p className="text-xs text-gray-700 bg-gray-50 rounded-lg p-2.5 break-words leading-relaxed border border-gray-100">
                  {selectedLog.user_agent ?? '—'}
                </p>
              </div>

              {/* Datos anteriores / nuevos */}
              {selectedLog.old_data && (
                <JsonField label="Datos anteriores" data={selectedLog.old_data} />
              )}
              {selectedLog.new_data && (
                <JsonField label="Datos nuevos" data={selectedLog.new_data} />
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Sub-componentes del modal ─────────────────────────────────────────────────

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function JsonField({ label, data }: { label: string; data: unknown }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <pre className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-2.5 overflow-auto max-h-36 text-gray-700 leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}