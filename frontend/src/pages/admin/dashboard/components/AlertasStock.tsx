import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface AlertasStockProps {
  data: Array<{
    idProducto?: number;
    idInsumo?: number;
    nombre: string;
    stock_total?: number;
    stock_actual?: number;
    tipo: string;
  }>;
}

export const AlertasStock = ({ data }: AlertasStockProps) => {
  if (data.length === 0) {
    return null;
  }

  // Calcular el nivel de alerta
  const getAlertLevel = (stock: number) => {
    if (stock <= 0) return { text: 'Sin stock', color: 'bg-red-100 text-red-800 border-red-200' };
    if (stock <= 5) return { text: 'Stock crítico', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { text: 'Stock bajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Alertas de Stock Bajo</h3>
          <span className="ml-auto text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
            {data.length} alerta{data.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {data.map((item, index) => {
          const stock = item.tipo === 'producto' ? item.stock_total : item.stock_actual;
          const alertLevel = getAlertLevel(stock || 0);
          
          return (
            <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${alertLevel.color}`}>
                      {alertLevel.text}
                    </span>
                    <span className="text-xs text-gray-400 uppercase">
                      {item.tipo === 'producto' ? 'Producto' : 'Insumo'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.nombre}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-lg font-bold text-red-600">
                    {stock || 0}
                  </p>
                  <p className="text-xs text-gray-400">unidades</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};