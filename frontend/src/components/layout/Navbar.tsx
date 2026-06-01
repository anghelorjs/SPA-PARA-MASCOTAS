// src/components/layout/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useNavigate } from "react-router-dom";
import { 
  FiBell, 
  FiSearch, 
  FiLogOut, 
  FiUser, 
  FiChevronDown,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiMessageSquare,
  FiPackage
} from "react-icons/fi";
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from "../../hooks/useAuth";
import { clientePerfilService } from "../../pages/cliente/perfil/services/cliente.perfil.service";
import { adminPedidosService } from "../../pages/admin/pedidos/services/admin.pedidos.service";
import { recepcionistaPedidosService } from "../../pages/recepcionista/pedidos/services/recepcionista.pedidos.service";

interface NavbarProps { sidebarCollapsed: boolean; }

const roleLabels: Record<string, string> = {
  administrador: "Administrador del Sistema",
  recepcionista: "Recepcionista",
  groomer: "Groomer",
  cliente: "Cliente",
};

// Función para obtener el path correcto del perfil según el rol
const getPerfilPath = (role: string): string => {
  switch (role) {
    case 'administrador':
      return '/admin/perfil';
    case 'recepcionista':
      return '/recepcionista/perfil';
    case 'groomer':
      return '/groomer/perfil';
    case 'cliente':
      return '/cliente/perfil';
    default:
      return '/perfil';
  }
};

// Configuración de íconos por tipo de notificación usando Heroicons
const getNotifIcon = (tipo: string): { icon: React.ReactNode; color: string } => {
  switch (tipo) {
    case 'confirmacion':
      return { icon: <CheckCircleIcon className="h-5 w-5" />, color: 'text-green-400' };
    case 'recordatorio':
      return { icon: <ClockIcon className="h-5 w-5" />, color: 'text-blue-400' };
    case 'listo_para_recoger':
      return { icon: <CalendarIcon className="h-5 w-5" />, color: 'text-purple-400' };
    case 'encuesta':
      return { icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />, color: 'text-yellow-400' };
    case 'cancelacion':
      return { icon: <XCircleIcon className="h-5 w-5" />, color: 'text-red-400' };
    case 'reprogramacion':
      return { icon: <ArrowPathIcon className="h-5 w-5" />, color: 'text-orange-400' };
    case 'pendiente_confirmacion':
      return { icon: <ExclamationCircleIcon className="h-5 w-5" />, color: 'text-amber-400' };
    default:
      return { icon: <CubeIcon className="h-5 w-5" />, color: 'text-gray-400' };
  }
};

export default function Navbar({ sidebarCollapsed }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones reales del cliente
  const loadNotificaciones = async () => {
    if (user?.rol === 'administrador' || user?.rol === 'recepcionista') {
      try {
        const resumen = user.rol === 'administrador'
          ? await adminPedidosService.resumen()
          : await recepcionistaPedidosService.resumen();
        setPedidosPendientes(resumen.pendiente);
        setNotificacionesNoLeidas(resumen.pendiente);
      } catch (error) {
        console.error('Error loading pedidos pendientes:', error);
      }
      return;
    }
    if (user?.rol !== 'cliente') return;
    try {
      const perfil = await clientePerfilService.getPerfil();
      setNotificaciones(perfil.notificaciones.slice(0, 5));
      const noLeidas = perfil.notificaciones.filter((n: any) => !n.leida).length;
      setNotificacionesNoLeidas(noLeidas);
    } catch (error) {
      console.error('Error loading notificaciones:', error);
    }
  };

  useEffect(() => {
    loadNotificaciones();
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const role = user?.rol ?? "administrador";
  const roleLabel = roleLabels[role] ?? role;
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ") || "Usuario";
  const initials = [user?.nombre, user?.apellido].filter(Boolean).map(s => s![0].toUpperCase()).join("") || "U";
  const perfilPath = getPerfilPath(role);
  const isCliente = role === 'cliente';
  const isOperador = role === 'administrador' || role === 'recepcionista';

  return (
    <header
      className="fixed top-0 right-0 h-16 z-50 bg-[#1e3a5f] text-white flex items-center justify-between px-5 shadow-lg border-b border-white/10 transition-all duration-300"
      style={{ left: sidebarCollapsed ? 68 : 220 }}
    >
      {/* ── Izquierda ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type="text"
            placeholder="Buscar citas, mascotas..."
            className="bg-white/8 border border-white/10 rounded-lg py-2 pl-9 pr-3.5 text-sm text-white w-64 outline-none transition-all duration-150 focus:bg-white/12"
          />
        </div>
      </div>

      {/* ── Derecha ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* Notificaciones - con datos reales para clientes */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="w-[38px] h-[38px] flex items-center justify-center rounded-lg bg-transparent text-white/70 text-lg relative transition-all duration-150 hover:bg-white/10 hover:text-white"
          >
            <FiBell />
            {notificacionesNoLeidas > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-[#1e3a5f] border border-white/10 rounded-xl shadow-2xl z-60 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <p className="text-white font-semibold text-sm m-0">Notificaciones</p>
                {isCliente && (
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/cliente/perfil');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Ver todas
                  </button>
                )}
                {isOperador && (
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(role === 'administrador' ? '/admin/pedidos' : '/recepcionista/pedidos');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Ver pedidos
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isOperador ? (
                  <div
                    className="px-4 py-3 border-b border-white/10 cursor-pointer transition-all duration-150 hover:bg-white/10"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(role === 'administrador' ? '/admin/pedidos' : '/recepcionista/pedidos');
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-amber-400">
                        <FiPackage className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium m-0">
                          {pedidosPendientes > 0
                            ? `${pedidosPendientes} pedido(s) pendiente(s) requieren confirmacion`
                            : 'No hay pedidos pendientes'}
                        </p>
                        <p className="text-white/40 text-[10px] mt-1">Panel de pedidos</p>
                      </div>
                      {pedidosPendientes > 0 && (
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ) : isCliente && notificaciones.length > 0 ? (
                  notificaciones.map((n) => {
                    const { icon, color } = getNotifIcon(n.tipo);
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-white/10 cursor-pointer transition-all duration-150 hover:bg-white/10 ${
                          !n.leida ? 'bg-white/5' : ''
                        }`}
                        onClick={() => {
                          setNotifOpen(false);
                          navigate('/cliente/perfil');
                        }}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 ${color}`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium m-0 line-clamp-2">
                              {n.mensaje}
                            </p>
                            <p className="text-white/40 text-[10px] mt-1">{n.fecha}</p>
                          </div>
                          {!n.leida && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <FiBell className="h-8 w-8 text-white/30 mx-auto mb-2" />
                    <p className="text-white/50 text-sm">No hay notificaciones</p>
                  </div>
                )}
              </div>
              {isCliente && notificaciones.length > 0 && (
                <div className="px-4 py-2.5 border-t border-white/10">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/cliente/perfil');
                    }}
                    className="w-full bg-transparent border-none cursor-pointer text-blue-400 text-xs text-center hover:text-blue-300 transition-colors"
                  >
                    Ver todas las notificaciones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Carrito - solo para clientes */}
        {isCliente && (
          <div className="relative">
            <button
              onClick={() => navigate('/cliente/carrito')}
              className="w-[38px] h-[38px] flex items-center justify-center rounded-lg bg-transparent text-white/70 text-lg relative transition-all duration-150 hover:bg-white/10 hover:text-white"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {(() => {
                const stored = localStorage.getItem('petspa_carrito');
                if (stored) {
                  try {
                    const items = JSON.parse(stored);
                    const totalItems = items.reduce((sum: number, item: any) => sum + item.cantidad, 0);
                    if (totalItems > 0) {
                      return (
                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                          {totalItems > 9 ? '9+' : totalItems}
                        </span>
                      );
                    }
                  } catch (e) {}
                }
                return null;
              })()}
            </button>
          </div>
        )}

        {/* Separador */}
        <div className="w-px h-8 bg-white/10" />

        {/* Usuario */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(p => !p)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg bg-transparent transition-all duration-150 hover:bg-white/10"
          >
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-blue-300 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-white text-xs font-semibold leading-tight m-0">{fullName}</p>
              <p className="text-white/50 text-[10px] leading-tight m-0">{roleLabel}</p>
            </div>
            <FiChevronDown
              className={`text-white/40 text-xs transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-[50px] w-[210px] bg-[#1e3a5f] border border-white/10 rounded-xl shadow-2xl z-60 overflow-hidden py-1.5">
              <div className="px-4 py-2.5 border-b border-white/10">
                <p className="text-white text-sm font-semibold m-0">{fullName}</p>
                <p className="text-white/45 text-[11px] mt-1 m-0">{roleLabel}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(perfilPath);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent text-white/75 text-xs transition-all duration-150 hover:bg-white/10 hover:text-white cursor-pointer border-none"
              >
                <FiUser size={15} /> <span>Mi Perfil</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent text-red-300 text-xs transition-all duration-150 hover:bg-red-500/10 cursor-pointer border-none"
              >
                <FiLogOut size={15} /> <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
