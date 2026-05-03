import { ShoppingBagIcon } from '@heroicons/react/24/outline';

interface TopProductosProps {
  data: Array<{ nombre: string; total_vendidos: number }>;
}

export const TopProductos = ({ data }: TopProductosProps) => {
  const maxVendidos = Math.max(...data.map(item => item.total_vendidos));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShoppingBagIcon className="w-5 h-5 text-emerald-600" />
        <h3 className="text-base font-semibold text-gray-900">Top Productos Más Vendidos</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.total_vendidos / maxVendidos) * 100;
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {item.nombre}
                  </span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  {item.total_vendidos} uds.
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
};