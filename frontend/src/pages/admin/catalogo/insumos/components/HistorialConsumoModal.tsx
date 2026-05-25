// src/pages/admin/catalogo/insumos/components/HistorialConsumoModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, BeakerIcon, CalendarIcon, ScissorsIcon, HeartIcon } from '@heroicons/react/24/outline';
import type { Insumo, ConsumoHistorico } from '../../../../../services/types/admin';
import { adminInsumosService } from '../services/admin.insumos.service';
import Pagination from '../../../../../components/common/Pagination';

interface HistorialConsumoModalProps {
  isOpen: boolean;
  insumo: Insumo | null;
  onClose: () => void;
}

export const HistorialConsumoModal = ({ isOpen, insumo, onClose }: HistorialConsumoModalProps) => {
  const [consumos, setConsumos] = useState<ConsumoHistorico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isOpen && insumo) {
      loadHistorial();
    }
  }, [isOpen, insumo, currentPage]);

  const loadHistorial = async () => {
    if (!insumo) return;
    try {
      setIsLoading(true);
      const response = await adminInsumosService.getInsumo(insumo.idInsumo);
      setConsumos(response.consumo_historico.data);
      setLastPage(response.consumo_historico.last_page);
      setTotal(response.consumo_historico.total);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cambiarPagina = (pagina: number) => {
    setCurrentPage(pagina);
  };

  if (!isOpen || !insumo) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-teal-600">
          <div>
            <h2 className="text-lg font-semibold text-white">Historial de Consumo</h2>
            <p className="text-xs text-green-100">{insumo.nombre}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : consumos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BeakerIcon className="h-12 w-12 mx-auto mb-3" />
              <p className="text-sm">No hay registros de consumo</p>
              <p className="text-xs mt-1">Este insumo aún no ha sido utilizado en fichas de grooming</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consumos.map((consumo) => (
                <div key={consumo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(consumo.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BeakerIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-600">
                        {consumo.cantidadUsada} {insumo.unidadMedida}
                      </span>
                    </div>
                  </div>

                  {consumo.fichaGrooming && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <HeartIcon className="h-3.5 w-3.5" />
                          <span>{consumo.fichaGrooming.cita.mascota.nombre}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <ScissorsIcon className="h-3.5 w-3.5" />
                          <span>{consumo.fichaGrooming.cita.servicio.nombre}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {!isLoading && total > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              onPageChange={cambiarPagina}
              showTotal={true}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};