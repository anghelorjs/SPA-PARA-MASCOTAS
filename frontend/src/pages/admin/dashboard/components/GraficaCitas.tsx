// src/pages/admin/dashboard/components/GraficaCitas.tsx
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

interface GraficaCitasProps {
  semanaActual: Array<{ fecha: string; dia: string; citas: number }>;
  semanaAnterior: Array<{ fecha: string; dia: string; citas: number }>;
}

export const GraficaCitas = ({ semanaActual, semanaAnterior }: GraficaCitasProps) => {
  // Combinar datos para la gráfica
  const data = semanaActual.map((item, index) => ({
    dia: item.dia,
    'Semana Actual': item.citas,
    'Semana Anterior': semanaAnterior[index]?.citas || 0,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Citas por Día</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Semana Actual" fill="#3b82f6" />
            <Bar dataKey="Semana Anterior" fill="#9ca3af" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};