// src/pages/admin/clientes/clientes/pages/ClientesAdmin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← Agregar este import
import { PlusIcon, ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useClientesAdmin } from '../hooks/useClientesAdmin';
import { TablaClientes } from '../components/TablaClientes';
import { ModalClienteForm } from '../components/ModalClienteForm';
import { PerfilClienteModal } from '../components/PerfilClienteModal';
import Pagination from '../../../../../components/common/Pagination';
import type { ClienteAdmin, CreateClienteAdminData, UpdateClienteAdminData } from '../../../../../services/types/admin';

export const ClientesAdmin = () => {
  const navigate = useNavigate(); // ← Agregar hook de navegación
  
  const {
    clientes,
    searchTerm,
    filtroActivo,
    filtroPeriodo,
    isLoading,
    currentPage,
    lastPage,
    total,
    tieneFiltrosActivos,
    cambiarSearchTerm,
    cambiarFiltroActivo,
    cambiarFiltroPeriodo,
    cambiarPagina,
    crearCliente,
    actualizarCliente,
    limpiarFiltros,
    refresh,
  } = useClientesAdmin();

  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalPerfilOpen, setModalPerfilOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<ClienteAdmin | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteAdmin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleNuevo = () => {
    setClienteEditando(null);
    setModalFormOpen(true);
  };

  const handleEditar = (cliente: ClienteAdmin) => {
    setClienteEditando(cliente);
    setModalFormOpen(true);
  };

  const handleVerPerfil = (cliente: ClienteAdmin) => {
    setClienteSeleccionado(cliente);
    setModalPerfilOpen(true);
  };

  // ✅ Nueva función para navegar a la ficha de la mascota
  const handleVerMascota = (mascotaId: number) => {
    navigate(`/admin/mascotas/${mascotaId}`);
    setModalPerfilOpen(false); // Cerrar el modal del perfil
  };

  const handleSaveCliente = async (data: CreateClienteAdminData | UpdateClienteAdminData): Promise<boolean> => {
    setIsSubmitting(true);
    let success = false;
    
    if (clienteEditando) {
      success = await actualizarCliente(clienteEditando.idCliente, data);
    } else {
      success = await crearCliente(data as CreateClienteAdminData);
    }
    
    setIsSubmitting(false);
    return success;
  };

  const periodos = [
    { value: 30, label: 'Últimos 30 días' },
    { value: 60, label: 'Últimos 60 días' },
    { value: 90, label: 'Últimos 90 días' },
    { value: 'sin_cita', label: 'Sin citas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de clientes registrados en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={handleNuevo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => cambiarSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4" />
            Filtros
            {tieneFiltrosActivos && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                <select
                  value={filtroActivo === undefined ? '' : filtroActivo ? 'activo' : 'inactivo'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'activo') cambiarFiltroActivo(true);
                    else if (val === 'inactivo') cambiarFiltroActivo(false);
                    else cambiarFiltroActivo(undefined);
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
              <div className="w-48">
                <label className="block text-xs font-medium text-gray-500 mb-1">Última cita</label>
                <select
                  value={filtroPeriodo || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') cambiarFiltroPeriodo(undefined);
                    else if (val === 'sin_cita') cambiarFiltroPeriodo('sin_cita');
                    else cambiarFiltroPeriodo(parseInt(val));
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {periodos.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              {tieneFiltrosActivos && (
                <div className="flex items-end">
                  <button
                    onClick={limpiarFiltros}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabla de clientes */}
      <TablaClientes
        clientes={clientes}
        isLoading={isLoading}
        onVerDetalle={handleVerPerfil}
        onEditar={handleEditar}
      />

      {/* Paginación */}
      {!isLoading && total > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          onPageChange={cambiarPagina}
          showTotal={true}
        />
      )}

      {/* Modal de formulario */}
      <ModalClienteForm
        isOpen={modalFormOpen}
        cliente={clienteEditando}
        isLoading={isSubmitting}
        onClose={() => {
          setModalFormOpen(false);
          setClienteEditando(null);
        }}
        onSave={handleSaveCliente}
      />

      {/* Modal de perfil del cliente */}
      <PerfilClienteModal
        isOpen={modalPerfilOpen}
        clienteId={clienteSeleccionado?.idCliente || null}
        clienteNombre={clienteSeleccionado ? `${clienteSeleccionado.user.nombre} ${clienteSeleccionado.user.apellido}` : ''}
        onClose={() => {
          setModalPerfilOpen(false);
          setClienteSeleccionado(null);
        }}
        onVerMascota={handleVerMascota} // ← Pasar la función actualizada
      />
    </div>
  );
};