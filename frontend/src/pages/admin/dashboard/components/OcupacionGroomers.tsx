// src/pages/admin/dashboard/components/OcupacionGroomers.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

interface OcupacionGroomersProps {
  data: Array<{ idGroomer: number; nombre: string; citas: number; porcentaje: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// Tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontSize: '13px',
      }}>
        <p style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{d.name}</p>
        <p style={{ color: '#6b7280', margin: 0 }}>
          <span style={{ color: payload[0].fill, fontWeight: 600 }}>{d.value}%</span>
          {' '}— {d.citas} {d.citas === 1 ? 'cita' : 'citas'}
        </p>
      </div>
    );
  }
  return null;
};

export const OcupacionGroomers = ({ data }: OcupacionGroomersProps) => {
  // Ordenar de mayor a menor citas
  const sorted = [...data].sort((a, b) => b.citas - a.citas);

  const barData = sorted.map((item) => ({
    name: item.nombre.split(' ').slice(0, 2).join(' '), // Nombre + 1er apellido
    fullName: item.nombre,
    value: item.porcentaje,
    citas: item.citas,
  }));

  const totalCitas = data.reduce((sum, d) => sum + d.citas, 0);
  const sinActividad = totalCitas === 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
            Ocupación por Groomer
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
            {sinActividad ? 'Sin citas en el período' : `${totalCitas} citas en total`}
          </p>
        </div>

        {/* Leyenda de colores compacta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '200px', justifyContent: 'flex-end' }}>
          {sorted.map((item, idx) => (
            <div key={item.idGroomer} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: COLORS[idx % COLORS.length], flexShrink: 0,
              }} />
              <span style={{ fontSize: '11px', color: '#374151' }}>
                {item.nombre.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {sinActividad ? (
        // Estado vacío elegante
        <div style={{
          height: '240px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: '#f9fafb', borderRadius: '8px',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            No hay citas registradas en este período
          </p>
        </div>
      ) : (
        <div style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
              barCategoryGap="25%"
            >
              <CartesianGrid horizontal={false} stroke="#f3f4f6" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 12, fill: '#374151' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {barData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => v > 0 ? `${v}%` : '—'}
                  style={{ fontSize: '12px', fontWeight: 600, fill: '#374151' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Fila de totales por groomer */}
      {!sinActividad && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(sorted.length, 3)}, 1fr)`,
          gap: '8px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f3f4f6',
        }}>
          {sorted.map((item, idx) => (
            <div key={item.idGroomer} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 10px', borderRadius: '8px', background: '#f9fafb',
            }}>
              <div style={{
                width: '8px', height: '32px', borderRadius: '4px',
                background: COLORS[idx % COLORS.length], flexShrink: 0,
              }} />
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, lineHeight: 1.2 }}>
                  {item.nombre.split(' ').slice(0, 2).join(' ')}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {item.citas} <span style={{ fontSize: '11px', fontWeight: 400, color: '#6b7280' }}>citas</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};