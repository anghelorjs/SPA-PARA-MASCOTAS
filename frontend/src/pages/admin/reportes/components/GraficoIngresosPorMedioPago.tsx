// src/pages/admin/reportes/components/GraficoIngresosPorMedioPago.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import type { IngresoPorMedioPago } from '../../../../services/types/admin';

interface GraficoIngresosPorMedioPagoProps {
  data: IngresoPorMedioPago[];
  isLoading: boolean;
}

const COLORS = {
  efectivo: '#10b981',
  qr: '#3b82f6',
  transferencia: '#f59e0b',
};

const MEDIO_PAGO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  qr: 'QR',
  transferencia: 'Transferencia',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{MEDIO_PAGO_LABELS[data.medio] || data.medio}</p>
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold">Bs. {data.total.toFixed(2)}</span>
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
    <ul className="grid grid-cols-1 gap-1 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-700">{MEDIO_PAGO_LABELS[entry.value] || entry.value}</span>
          </div>
          <span className="text-gray-500">{entry.payload.porcentaje}%</span>
          <span className="text-gray-400">Bs. {entry.payload.total.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
};

export const GraficoIngresosPorMedioPago = ({ data, isLoading }: GraficoIngresosPorMedioPagoProps) => {
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
        <CreditCardIcon className="h-12 w-12 mx-auto mb-2" />
        <p>No hay datos disponibles para el período seleccionado</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);
  const labelByPayload = ({ payload }: { payload?: IngresoPorMedioPago }) => {
    if (!payload) return '';
    return `${MEDIO_PAGO_LABELS[payload.medio] || payload.medio}: ${payload.porcentaje}%`;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CreditCardIcon className="h-5 w-5 text-purple-500" />
        <h3 className="text-base font-semibold text-gray-800">Ingresos por Medio de Pago</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="total"
              nameKey="medio"
              label={labelByPayload}
              labelLine={true}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.medio}`} fill={COLORS[entry.medio as keyof typeof COLORS] || '#6b7280'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">Total ingresos: Bs. {total.toFixed(2)}</p>
      </div>
    </div>
  );
};
