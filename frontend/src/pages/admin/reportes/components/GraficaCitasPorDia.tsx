// src/pages/admin/reportes/components/GraficaCitasPorDia.tsx
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
import type { CitaPorDia } from '../../../../services/types/admin';

interface GraficaCitasPorDiaProps {
  data: CitaPorDia[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const GraficaCitasPorDia = ({ data, isLoading }: GraficaCitasPorDiaProps) => {
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
        <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
        <p>No hay datos disponibles para el período seleccionado</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    fecha: item.fecha,
    'Total': item.total,
    'Completadas': item.completadas,
    'Canceladas': item.canceladas,
  }));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="h-5 w-5 text-blue-500" />
        <h3 className="text-base font-semibold text-gray-800">Citas por Día</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="fecha" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Completadas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Canceladas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};