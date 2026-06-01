// src/pages/admin/reportes/components/GraficoIngresosDiarios.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartPieIcon } from '@heroicons/react/24/outline';
import type { IngresoPorDia } from '../../../../services/types/admin';

interface GraficoIngresosDiariosProps {
  data: IngresoPorDia[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">Bs. {entry.value.toFixed(2)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const GraficoIngresosDiarios = ({ data, isLoading }: GraficoIngresosDiariosProps) => {
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
        <ChartPieIcon className="h-12 w-12 mx-auto mb-2" />
        <p>No hay datos disponibles para el período seleccionado</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    fecha: item.fecha,
    'Productos': item.productos,
    'Servicios': item.servicios,
    'Total': item.total,
  }));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ChartPieIcon className="h-5 w-5 text-green-500" />
        <h3 className="text-base font-semibold text-gray-800">Ingresos Diarios</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="fecha" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `Bs. ${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Productos" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Servicios" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
