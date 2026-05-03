// src/components/layout/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiSearch, FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

interface NavbarProps { sidebarCollapsed: boolean; }

const roleLabels: Record<string, string> = {
  administrador: "Administrador del Sistema",
  recepcionista: "Recepcionista",
  groomer: "Groomer",
  cliente: "Cliente",
};

const NOTIFS = [
  { title: "Cita confirmada", desc: "Luna — Baño completo hoy a las 10:00", time: "hace 5 min", dot: "#4ade80" },
  { title: "Stock crítico", desc: "Champú Antipulgas: 2 unidades restantes", time: "hace 1 h", dot: "#f87171" },
  { title: "Recordatorio", desc: "Rocky — Cita mañana a las 14:30", time: "hace 2 h", dot: "#60a5fa" },
];

export default function Navbar({ sidebarCollapsed }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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

  return (
    <header
      className="fixed top-0 right-0 h-16 z-50 bg-[#1e3a5f] text-white flex items-center justify-between px-5 shadow-lg border-b border-white/10 transition-all duration-300"
      style={{ left: sidebarCollapsed ? 68 : 220 }}
    >
      {/* ── Izquierda ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        {/* Buscador */}
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

        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="w-[38px] h-[38px] flex items-center justify-center rounded-lg bg-transparent text-white/70 text-lg relative transition-all duration-150 hover:bg-white/10 hover:text-white"
          >
            <FiBell />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-[#1e3a5f]" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-72 bg-[#1e3a5f] border border-white/10 rounded-xl shadow-2xl z-60 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <p className="text-white font-semibold text-sm m-0">Notificaciones</p>
                <span className="text-[11px] text-white/40 bg-white/8 px-2 py-0.5 rounded-full">3 nuevas</span>
              </div>
              {NOTIFS.map((n, i) => (
                <div
                  key={i}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-all duration-150 hover:bg-white/10 ${
                    i < NOTIFS.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: n.dot }}
                  />
                  <div>
                    <p className="text-white text-xs font-medium m-0 leading-tight">{n.title}</p>
                    <p className="text-white/50 text-[11px] mt-0.5 m-0 leading-tight">{n.desc}</p>
                    <p className="text-white/30 text-[10px] mt-0.5 m-0">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 border-t border-white/10">
                <button className="w-full bg-transparent border-none cursor-pointer text-blue-400 text-xs text-center hover:text-blue-300 transition-colors">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

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
                  navigate(`/${role}/perfil`);
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