// src/pages/cliente/historial/compras/components/FiltroEstadoCompras.tsx
interface FiltroEstadoComprasProps {
  estadoSeleccionado: string;
  onEstadoChange: (estado: string) => void;
}

const ESTADOS = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'pagado', label: 'Pagadas' },
  { value: 'cancelado', label: 'Canceladas' },
];

export const FiltroEstadoCompras = ({ estadoSeleccionado, onEstadoChange }: FiltroEstadoComprasProps) => {
  return (
    <div className="flex gap-2">
      {ESTADOS.map((estado) => (
        <button
          key={estado.value}
          onClick={() => onEstadoChange(estado.value)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
            estadoSeleccionado === estado.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {estado.label}
        </button>
      ))}
    </div>
  );
};