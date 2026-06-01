import { useState } from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import Pagination from '../../../../components/common/Pagination';
import { ModalClienteForm } from '../components/ModalClienteForm';
import { ModalMascotaForm } from '../components/ModalMascotaForm';
import { PerfilClienteModal } from '../components/PerfilClienteModal';
import { FichaMascotaModal } from '../components/FichaMascotaModal';
import { TablaClientesRecepcion } from '../components/TablaClientesRecepcion';
import { useClientesRecepcionista } from '../hooks/useClientesRecepcionista';
import type {
  ClienteRecepcionista,
  CreateClienteData,
  CreateMascotaData,
  MascotaRecepcionista,
} from '../services/recepcionista.clientes.service';

export const ClientesRecepcionista = () => {
  const {
    clientes,
    searchTerm,
    isLoading,
    currentPage,
    lastPage,
    total,
    cambiarSearchTerm,
    cambiarPagina,
    crearCliente,
    actualizarCliente,
    crearMascota,
    actualizarMascota,
    refresh,
  } = useClientesRecepcionista();

  const [clienteFormOpen, setClienteFormOpen] = useState(false);
  const [mascotaFormOpen, setMascotaFormOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [fichaOpen, setFichaOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRecepcionista | null>(null);
  const [clienteEditando, setClienteEditando] = useState<ClienteRecepcionista | null>(null);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<MascotaRecepcionista | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveCliente = async (data: CreateClienteData): Promise<boolean> => {
    setIsSubmitting(true);
    const success = clienteEditando
      ? await actualizarCliente(clienteEditando.idCliente, data)
      : await crearCliente(data);
    setIsSubmitting(false);
    if (success && clienteEditando) setPerfilOpen(false);
    return success;
  };

  const handleSaveMascota = async (data: CreateMascotaData): Promise<boolean> => {
    setIsSubmitting(true);
    const success = mascotaSeleccionada
      ? await actualizarMascota(mascotaSeleccionada.idMascota, data)
      : await crearMascota(data);
    setIsSubmitting(false);
    if (success) {
      setFichaOpen(false);
      setPerfilOpen(false);
    }
    return success;
  };

  const handleVerPerfil = (cliente: ClienteRecepcionista) => {
    setClienteSeleccionado(cliente);
    setPerfilOpen(true);
  };

  const handleNuevaMascota = (cliente: ClienteRecepcionista) => {
    setClienteSeleccionado(cliente);
    setMascotaSeleccionada(null);
    setMascotaFormOpen(true);
  };

  const handleVerMascota = (mascota: MascotaRecepcionista) => {
    setMascotaSeleccionada(mascota);
    setFichaOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Clientes registrados y fichas de sus mascotas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={() => {
              setClienteEditando(null);
              setClienteFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => cambiarSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <TablaClientesRecepcion clientes={clientes} isLoading={isLoading} onVerPerfil={handleVerPerfil} />

      {!isLoading && total > 0 && (
        <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={cambiarPagina} showTotal={true} />
      )}

      <ModalClienteForm
        isOpen={clienteFormOpen}
        cliente={clienteEditando}
        isLoading={isSubmitting}
        onClose={() => {
          setClienteFormOpen(false);
          setClienteEditando(null);
        }}
        onSave={handleSaveCliente}
      />

      <PerfilClienteModal
        isOpen={perfilOpen}
        clienteId={clienteSeleccionado?.idCliente || null}
        onClose={() => {
          setPerfilOpen(false);
          setClienteSeleccionado(null);
        }}
        onEditarCliente={(cliente) => {
          setClienteEditando(cliente);
          setClienteFormOpen(true);
        }}
        onNuevaMascota={handleNuevaMascota}
        onVerMascota={handleVerMascota}
      />

      <FichaMascotaModal
        isOpen={fichaOpen}
        mascotaId={mascotaSeleccionada?.idMascota || null}
        onClose={() => {
          setFichaOpen(false);
          setMascotaSeleccionada(null);
        }}
        onEditar={(mascota) => {
          setMascotaSeleccionada(mascota);
          setMascotaFormOpen(true);
        }}
      />

      <ModalMascotaForm
        isOpen={mascotaFormOpen}
        idCliente={clienteSeleccionado?.idCliente || mascotaSeleccionada?.idCliente || null}
        mascota={mascotaSeleccionada}
        isLoading={isSubmitting}
        onClose={() => {
          setMascotaFormOpen(false);
          setMascotaSeleccionada(null);
        }}
        onSave={handleSaveMascota}
      />
    </div>
  );
};
