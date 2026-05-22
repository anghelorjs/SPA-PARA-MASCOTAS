// src/pages/groomer/fichas/components/PestañaInsumos.tsx
import { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { groomerFichasService } from '../services/groomer.fichas.service';
import type { InsumoFicha, InsumoSearchResult } from '../types';

interface PestañaInsumosProps {
  insumos: InsumoFicha[];
  isOpen: boolean;
  isSaving: boolean;
  onAgregar: (idInsumo: number, cantidadUsada: number) => Promise<boolean>;
  onEliminar: (detalleId: number) => void;
}

export const PestañaInsumos = ({
  insumos,
  isOpen,
  isSaving,
  onAgregar,
  onEliminar,
}: PestañaInsumosProps) => {
  const [search, setSearch] = useState('');
  const [resultados, setResultados] = useState<InsumoSearchResult[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<InsumoSearchResult | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (search.length < 2) return;
    try {
      setIsSearching(true);
      const results = await groomerFichasService.buscarInsumos(search);
      setResultados(results);
      setMostrarResultados(true);
    } catch (error) {
      console.error('Error al buscar insumos:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectInsumo = (insumo: InsumoSearchResult) => {
    setSelectedInsumo(insumo);
    setSearch(insumo.nombre);
    setMostrarResultados(false);
    setCantidad('');
  };

  const handleAgregar = async () => {
    if (!selectedInsumo || !cantidad || parseFloat(cantidad) <= 0) return;
    const success = await onAgregar(selectedInsumo.id, parseFloat(cantidad));
    if (success) {
      setSelectedInsumo(null);
      setSearch('');
      setCantidad('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario para agregar insumo (solo si ficha abierta) */}
      {isOpen && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Agregar insumo usado</h4>
          
          {/* Buscador */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar insumo (nombre o unidad)"
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {isSearching ? '...' : 'Buscar'}
              </button>
            </div>
            
            {/* Resultados dropdown */}
            {mostrarResultados && resultados.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {resultados.map((insumo) => (
                  <button
                    key={insumo.id}
                    onClick={() => handleSelectInsumo(insumo)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-800">{insumo.nombre}</div>
                    <div className="text-xs text-gray-400">
                      Stock: {insumo.stock_actual} {insumo.unidad_medida}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cantidad y botón agregar */}
          {selectedInsumo && (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Cantidad usada ({selectedInsumo.unidad_medida})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleAgregar}
                disabled={!cantidad || parseFloat(cantidad) <= 0 || isSaving}
                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" />
                Agregar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabla de insumos */}
      {insumos.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No hay insumos registrados en esta ficha</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                {isOpen && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insumos.map((insumo) => (
                <tr key={insumo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{insumo.insumo_nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{insumo.unidad_medida}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{insumo.cantidad_usada}</td>
                  {isOpen && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onEliminar(insumo.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar insumo"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};