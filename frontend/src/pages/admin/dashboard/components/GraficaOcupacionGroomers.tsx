// src/pages/admin/dashboard/components/GraficaOcupacionGroomers.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartPieIcon } from '@heroicons/react/24/outline';
import type { OcupacionGroomer } from '../../../../services/types/admin';

interface GraficaOcupacionGroomersProps {
  data: OcupacionGroomer[];
  isLoading: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec489a', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#6366f1', // indigo
  '#f97316', // orange-dark
];

// Tooltip personalizado para el gráfico de dona
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{data.nombre}</p>
        <p className="text-sm text-gray-600">
          Citas: <span className="font-semibold">{data.citas}</span>
        </p>
        <p className="text-sm text-gray-600">
          Porcentaje: <span className="font-semibold">{data.porcentaje}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Leyenda personalizada
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

export const GraficaOcupacionGroomers = ({ data, isLoading }: GraficaOcupacionGroomersProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ChartPieIcon className="h-12 w-12 mx-auto mb-2" />
        <p className="text-sm">No hay datos de ocupación disponibles</p>
      </div>
    );
  }

  const totalCitas = data.reduce((sum, g) => sum + g.citas, 0);
  if (totalCitas === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ChartPieIcon className="h-12 w-12 mx-auto mb-2" />
        <p className="text-sm">No hay citas en el período seleccionado</p>
      </div>
    );
  }

  // Preparar datos para el gráfico (solo mostrar groomers con citas)
  const chartData = data.filter(g => g.citas > 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ChartPieIcon className="h-5 w-5 text-purple-500" />
        <h3 className="text-base font-semibold text-gray-800">Ocupación por Groomer</h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="citas"
              nameKey="nombre"
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Total de citas en el centro visualmente (ya manejado por el gráfico) */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">Total de citas en el período</p>
        <p className="text-xl font-bold text-gray-800">{totalCitas}</p>
      </div>
    </div>
  );
};