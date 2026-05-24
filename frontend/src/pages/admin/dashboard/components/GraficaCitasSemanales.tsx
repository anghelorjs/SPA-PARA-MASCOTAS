// src/pages/admin/dashboard/components/GraficaCitasSemanales.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import type { GraficaCitasSemanales } from '../../../../services/types/admin';

interface GraficaCitasSemanalesProps {
  data: GraficaCitasSemanales;
  isLoading: boolean;
}

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span> citas
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const GraficaCitasSemanales = ({ data, isLoading }: GraficaCitasSemanalesProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Combinar datos para la gráfica
  const chartData = data.semana_actual.map((item, index) => ({
    dia: item.dia.substring(0, 3), // Lun, Mar, Mié, etc.
    'Semana Actual': item.citas,
    'Semana Anterior': data.semana_anterior[index]?.citas || 0,
  }));

  const maxCitas = Math.max(
    ...chartData.map(d => d['Semana Actual']),
    ...chartData.map(d => d['Semana Anterior']),
    1
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="h-5 w-5 text-blue-500" />
        <h3 className="text-base font-semibold text-gray-800">Citas por Día</h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dia"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              domain={[0, Math.ceil(maxCitas * 1.1)]}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
            <Bar
              dataKey="Semana Actual"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
            <Bar
              dataKey="Semana Anterior"
              fill="#9ca3af"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen de totales */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-600">Semana Actual:</span>
          <span className="font-semibold text-gray-800">
            {chartData.reduce((sum, d) => sum + d['Semana Actual'], 0)} citas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-gray-600">Semana Anterior:</span>
          <span className="font-semibold text-gray-800">
            {chartData.reduce((sum, d) => sum + d['Semana Anterior'], 0)} citas
          </span>
        </div>
      </div>
    </div>
  );
};