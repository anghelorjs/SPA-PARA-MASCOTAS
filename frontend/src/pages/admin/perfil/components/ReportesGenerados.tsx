// src/pages/admin/perfil/components/ReportesGenerados.tsx
import { useState, useEffect } from 'react';
import { DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Reporte {
  idReporte: number;
  tipoReporte: string;
  fechaGenerado: string;
  fechaDesde: string;
  fechaHasta: string;
}

interface ReportesGeneradosProps {
  reportes: Reporte[];
  total: number;
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onTipoChange: (tipo: string) => void;
  isLoading: boolean;
}

const tipoReportes = [
  { value: 'todos', label: 'Todos' },
  { value: 'agenda', label: 'Agenda' },
  { value: 'ingresos', label: 'Ingresos' },
  { value: 'inventario', label: 'Inventario' },
  { value: 'clientes', label: 'Clientes' },
];

const tipoLabels: Record<string, string> = {
  agenda: 'Reporte de Agenda',
  ingresos: 'Reporte de Ingresos',
  inventario: 'Reporte de Inventario',
  clientes: 'Reporte de Clientes',
};

export const ReportesGenerados = ({
  reportes,
  total,
  currentPage,
  lastPage,
  onPageChange,
  onTipoChange,
  isLoading,
}: ReportesGeneradosProps) => {
  const [selectedTipo, setSelectedTipo] = useState('todos');

  const handleTipoChange = (tipo: string) => {
    setSelectedTipo(tipo);
    onTipoChange(tipo === 'todos' ? undefined : tipo);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Reportes Generados</h3>
        <div className="flex justify-center py-8">
          <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mis Reportes Generados</h3>
        <div className="flex gap-2">
          {tipoReportes.map((tipo) => (
            <button
              key={tipo.value}
              onClick={() => handleTipoChange(tipo.value)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTipo === tipo.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      </div>

      {reportes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No has generado reportes aún</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Generado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.map((reporte) => (
                  <tr key={reporte.idReporte} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tipoLabels[reporte.tipoReporte] || reporte.tipoReporte}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reporte.fechaGenerado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reporte.fechaDesde} → {reporte.fechaHasta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {lastPage > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Página {currentPage} de {lastPage}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};