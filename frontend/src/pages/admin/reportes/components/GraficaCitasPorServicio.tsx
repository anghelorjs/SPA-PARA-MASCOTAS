// src/pages/admin/reportes/components/GraficaCitasPorServicio.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ScissorsIcon } from '@heroicons/react/24/outline';
import type { CitaPorServicio } from '../../../../services/types/admin';

interface GraficaCitasPorServicioProps {
  data: CitaPorServicio[];
  isLoading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{data.servicio}</p>
        <p className="text-sm text-gray-600">
          Citas: <span className="font-semibold">{data.total_citas}</span>
        </p>
        <p className="text-sm text-gray-600">
          Porcentaje: <span className="font-semibold">{data.porcentaje}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-700 truncate">{entry.value}</span>
          <span className="text-gray-400">{entry.payload.porcentaje}%</span>
        </li>
      ))}
    </ul>
  );
};

export const GraficaCitasPorServicio = ({ data, isLoading }: GraficaCitasPorServicioProps) => {
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
        <ScissorsIcon className="h-12 w-12 mx-auto mb-2" />
        <p>No hay datos disponibles para el período seleccionado</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ScissorsIcon className="h-5 w-5 text-purple-500" />
        <h3 className="text-base font-semibold text-gray-800">Citas por Servicio</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="total_citas"
              nameKey="servicio"
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">Total de citas: {data.reduce((sum, d) => sum + d.total_citas, 0)}</p>
      </div>
    </div>
  );
};
