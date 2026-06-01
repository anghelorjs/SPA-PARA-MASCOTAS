// src/pages/admin/reportes/components/GraficoIngresosPorTipo.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { IngresoPorTipo } from '../../../../services/types/admin';

interface GraficoIngresosPorTipoProps {
  data: IngresoPorTipo[];
  isLoading: boolean;
}

const COLORS = ['#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{data.tipo}</p>
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold">Bs. {data.total.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const GraficoIngresosPorTipo = ({ data, isLoading }: GraficoIngresosPorTipoProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-2" />
        <p>No hay datos disponibles para el período seleccionado</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);
  const labelByTotal = ({ value }: { value?: number }) => {
    const porcentaje = total > 0 && typeof value === 'number' ? (value / total) * 100 : 0;
    return `${porcentaje.toFixed(0)}%`;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
        <h3 className="text-base font-semibold text-gray-800">Ingresos por Tipo</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="total"
              nameKey="tipo"
              label={labelByTotal}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">Total ingresos: Bs. {total.toFixed(2)}</p>
      </div>
    </div>
  );
};
