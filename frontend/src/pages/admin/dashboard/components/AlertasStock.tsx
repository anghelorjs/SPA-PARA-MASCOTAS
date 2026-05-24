// src/pages/admin/dashboard/components/AlertasStock.tsx
import { 
  ExclamationTriangleIcon, 
  CubeIcon, 
  BeakerIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import type { AlertaStock } from '../../../../services/types/admin';

interface AlertasStockProps {
  alertas: AlertaStock[];
  isLoading: boolean;
  onVerProducto?: (idProducto: number) => void;
  onVerInsumo?: (idInsumo: number) => void;
}

export const AlertasStock = ({ 
  alertas, 
  isLoading, 
  onVerProducto, 
  onVerInsumo 
}: AlertasStockProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500" />
      </div>
    );
  }

  if (alertas.length === 0) {
    return null;
  }

  const handleVer = (alerta: AlertaStock) => {
    if (alerta.tipo === 'producto' && alerta.idProducto && onVerProducto) {
      onVerProducto(alerta.idProducto);
    } else if (alerta.tipo === 'insumo' && alerta.idInsumo && onVerInsumo) {
      onVerInsumo(alerta.idInsumo);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-red-100 border-b border-red-200">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
        <h3 className="text-sm font-semibold text-red-800">Alertas de Stock Bajo</h3>
      </div>
      <div className="divide-y divide-red-100">
        {alertas.map((alerta, index) => (
          <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-red-100/50 transition-colors">
            <div className="flex items-center gap-3">
              {alerta.tipo === 'producto' ? (
                <CubeIcon className="h-4 w-4 text-red-500" />
              ) : (
                <BeakerIcon className="h-4 w-4 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-800">{alerta.nombre}</p>
                <p className="text-xs text-red-600">
                  Stock: {alerta.tipo === 'producto' ? alerta.stock_total : alerta.stock_actual} / 
                  Mínimo: {alerta.stock_minimo}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleVer(alerta)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Ver
              <ArrowRightIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};