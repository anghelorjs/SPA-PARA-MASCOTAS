// src/pages/cliente/catalogo/pages/CarritoCliente.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ShoppingCartIcon, 
  TrashIcon, 
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useCarritoCliente } from '../hooks/useCarritoCliente';
import { ItemCarrito } from '../components/ItemCarrito';
import { useAuth } from '../../../../hooks/useAuth';

export const CarritoCliente = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    totalItems,
    subtotal,
    canal,
    isSubmitting,
    setCanal,
    eliminarDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
    enviarPedido,
  } = useCarritoCliente();

  const [enviando, setEnviando] = useState(false);
  const canalContacto = user?.rol === 'cliente' ? (user as any)?.canal_contacto : null;
  const requiereSelectorCanal = !canalContacto || canalContacto === 'email' || canalContacto === 'sms';

  const handleEnviarPedido = async () => {
    setEnviando(true);
    const enlace = await enviarPedido();
    setEnviando(false);
    
    if (enlace) {
      window.open(enlace, '_blank');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/cliente/catalogo')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Seguir comprando
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">Agrega productos desde el catálogo para comenzar tu compra</p>
          <button
            onClick={() => navigate('/cliente/catalogo')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/cliente/catalogo')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Seguir comprando
        </button>
        <button
          onClick={limpiarCarrito}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <TrashIcon className="h-4 w-4" />
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5 text-blue-500" />
            Mi Carrito ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
          </h2>

          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <ItemCarrito
                key={item.idVariante}
                item={item}
                onActualizarCantidad={actualizarCantidad}
                onEliminar={eliminarDelCarrito}
              />
            ))}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Resumen del pedido</h3>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-800">Bs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-800 font-medium">Total</span>
                <span className="text-xl font-bold text-green-600">Bs. {subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                El pago se coordina al momento de la entrega o retiro en el local
              </p>
            </div>
          </div>

          {/* Selector de canal (si es necesario) */}
          {requiereSelectorCanal && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canal de comunicación
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCanal('whatsapp')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    canal === 'whatsapp'
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  WhatsApp
                </button>
                <button
                  onClick={() => setCanal('telegram')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    canal === 'telegram'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BuildingStorefrontIcon className="h-4 w-4" />
                  Telegram
                </button>
              </div>
            </div>
          )}

          {/* Botón enviar pedido */}
          <button
            onClick={handleEnviarPedido}
            disabled={isSubmitting || enviando}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting || enviando ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Procesando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                Enviar pedido por {canal === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
              </span>
            )}
          </button>

          {/* Nota informativa */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              Recibirás un mensaje listo para enviar. El pago se coordinará directamente con el negocio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};