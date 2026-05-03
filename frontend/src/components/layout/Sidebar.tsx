// src/components/layout/Sidebar.tsx
import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiChevronDown, FiChevronUp, FiHome, FiUsers, FiBox,
  FiFileText, FiSettings, FiLogOut, FiUser, FiBriefcase,
  FiPackage, FiBarChart2, FiShoppingBag, FiCalendar,
  FiScissors, FiBell, FiGrid, FiClock, FiHeart,
  FiDollarSign, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../services/types/auth";

interface SidebarProps { collapsed: boolean; onToggle: () => void; }
interface MenuItem {
  id: string; label: string; icon: React.ReactNode; to?: string;
  children?: Array<{ label: string; to: string; icon?: React.ReactNode }>;
}

// Ícono de patita
function PawIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="6" cy="5" rx="1.8" ry="2.5" />
      <ellipse cx="10.5" cy="3.5" rx="1.8" ry="2.5" />
      <ellipse cx="15" cy="3.5" rx="1.8" ry="2.5" />
      <ellipse cx="19" cy="5" rx="1.8" ry="2.5" />
      <path d="M12 8c-4 0-7.5 2.5-7.5 6.5 0 2.5 2 4.5 4.5 4.5h6c2.5 0 4.5-2 4.5-4.5C19.5 10.5 16 8 12 8z" />
    </svg>
  );
}

// ─── SidebarItem ──────────────────────────────────────────────────────────────
function SidebarItem({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-2.5 px-3.5 py-2 rounded-lg mx-2 my-0.5
        text-sm font-medium no-underline transition-all duration-150
        ${isActive 
          ? 'bg-blue-600 text-white opacity-100' 
          : 'text-white/80 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <span className={`text-[17px] flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>
            {icon}
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

// ─── SidebarDropdown ──────────────────────────────────────────────────────────
function SidebarDropdown({ 
  icon, label, open, onClick, items 
}: { 
  icon: React.ReactNode; label: string; open: boolean;
  onClick: () => void;
  items: Array<{ label: string; to: string; icon?: React.ReactNode }>;
}) {
  return (
    <div className="mx-2 my-0.5">
      <button
        onClick={onClick}
        className={`
          flex items-center justify-between w-full px-3.5 py-2 rounded-lg
          text-sm font-medium transition-all duration-150
          ${open ? 'bg-white/10 text-white opacity-100' : 'text-white/80 hover:bg-white/10 hover:text-white'}
        `}
      >
        <span className="flex items-center gap-2.5">
          <span className="text-[17px] opacity-70 flex-shrink-0">{icon}</span>
          <span>{label}</span>
        </span>
        <span className="opacity-40 text-xs">
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </span>
      </button>
      
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="ml-4 pl-3 py-1 border-l-2 border-white/10">
          {items.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-2 px-2.5 py-1.5 rounded-md mb-0.5
                text-xs font-medium no-underline transition-all duration-150
                ${isActive 
                  ? 'bg-blue-600 text-white opacity-100' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {item.icon && (
                    <span className={`flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CollapsedSimpleItem ──────────────────────────────────────────────────────
function CollapsedSimpleItem({ item }: { item: MenuItem }) {
  return (
    <NavLink
      to={item.to!}
      title={item.label}
      className={({ isActive }) => `
        w-10 h-10 flex items-center justify-center rounded-xl
        text-lg no-underline transition-all duration-150
        ${isActive 
          ? 'bg-blue-600 text-white opacity-100' 
          : 'text-white/70 hover:bg-white/10 hover:text-white hover:opacity-100'
        }
      `}
    >
      {item.icon}
    </NavLink>
  );
}

// ─── CollapsedParentItem ──────────────────────────────────────────────────────
function CollapsedParentItem({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      setTop(Math.max(8, btnRef.current.getBoundingClientRect().top));
    }
    setOpen(p => !p);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        title={item.label}
        className="
          w-10 h-10 flex items-center justify-center rounded-xl
          text-lg opacity-70 hover:opacity-100 hover:bg-white/10
          transition-all duration-150 cursor-pointer border-none
        "
      >
        {item.icon}
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed left-[76px] z-50 min-w-[200px] bg-[#1e3a5f] border border-white/10 rounded-xl shadow-2xl py-1.5"
            style={{ top }}
          >
            <p className="px-4 py-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-wide">
              {item.label}
            </p>
            {item.children?.map((child, idx) => (
              <NavLink
                key={idx}
                to={child.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-2.5 px-4 py-2 text-sm
                  no-underline transition-all duration-150
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-white hover:bg-white/10'
                  }
                `}
              >
                {child.icon && <span className="opacity-70">{child.icon}</span>}
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ─── Menús por rol ────────────────────────────────────────────────────────────
const administradorMenu: MenuItem[] = [
  { id: "admin-dashboard", label: "Dashboard", icon: <FiHome />, to: "/admin/dashboard" },
  { id: "admin-agenda", label: "Agenda", icon: <FiCalendar />, to: "/admin/agenda" },
  { id: "admin-grooming", label: "Grooming", icon: <FiScissors />, to: "/admin/grooming" },
  {
    id: "admin-clientes", label: "Clientes", icon: <FiUsers />,
    children: [
      { label: "Clientes", to: "/admin/clientes", icon: <FiUsers size={13} /> },
      { label: "Mascotas", to: "/admin/mascotas", icon: <FiHeart size={13} /> },
    ]
  },
  {
    id: "admin-catalogo", label: "Catálogo", icon: <FiPackage />,
    children: [
      { label: "Productos", to: "/admin/catalogo/productos", icon: <FiBox size={13} /> },
      { label: "Insumos", to: "/admin/catalogo/insumos", icon: <FiPackage size={13} /> },
      { label: "Categorías", to: "/admin/catalogo/categorias", icon: <FiGrid size={13} /> },
      { label: "Movimientos", to: "/admin/catalogo/movimientos", icon: <FiClock size={13} /> },
    ]
  },
  { id: "admin-reportes", label: "Reportes", icon: <FiBarChart2 />, to: "/admin/reportes" },
  {
    id: "admin-configuracion", label: "Configuración", icon: <FiSettings />,
    children: [
      { label: "Datos del Negocio", to: "/admin/configuracion/negocio", icon: <FiBriefcase size={13} /> },
      { label: "Usuarios", to: "/admin/configuracion/usuarios", icon: <FiUsers size={13} /> },
      { label: "Notificaciones", to: "/admin/configuracion/notificaciones", icon: <FiBell size={13} /> },
    ]
  },
];

const recepcionistaMenu: MenuItem[] = [
  { id: "rec-dashboard", label: "Dashboard", icon: <FiHome />, to: "/recepcionista/dashboard" },
  { id: "rec-agenda", label: "Agenda", icon: <FiCalendar />, to: "/recepcionista/agenda" },
  {
    id: "rec-clientes", label: "Clientes", icon: <FiUsers />,
    children: [
      { label: "Clientes", to: "/recepcionista/clientes", icon: <FiUsers size={13} /> },
      { label: "Mascotas", to: "/recepcionista/mascotas", icon: <FiHeart size={13} /> },
    ]
  },
  { id: "rec-ventas", label: "Ventas", icon: <FiDollarSign />, to: "/recepcionista/ventas" },
  { id: "rec-notificaciones", label: "Notificaciones", icon: <FiBell />, to: "/recepcionista/notificaciones" },
];

const groomerMenu: MenuItem[] = [
  { id: "grm-dashboard", label: "Dashboard", icon: <FiHome />, to: "/groomer/dashboard" },
  { id: "grm-agenda", label: "Mi Agenda", icon: <FiCalendar />, to: "/groomer/agenda" },
  {
    id: "grm-fichas", label: "Fichas", icon: <FiFileText />,
    children: [
      { label: "Fichas de Hoy", to: "/groomer/fichas/hoy", icon: <FiClock size={13} /> },
      { label: "Todas las Fichas", to: "/groomer/fichas/todas", icon: <FiFileText size={13} /> },
    ]
  },
];

const clienteMenu: MenuItem[] = [
  { id: "cli-dashboard", label: "Inicio", icon: <FiHome />, to: "/cliente/dashboard" },
  { id: "cli-mascotas", label: "Mis Mascotas", icon: <FiHeart />, to: "/cliente/mis-mascotas" },
  { id: "cli-citas", label: "Mis Citas", icon: <FiCalendar />, to: "/cliente/mis-citas" },
  { id: "cli-catalogo", label: "Catálogo", icon: <FiShoppingBag />, to: "/cliente/catalogo" },
  {
    id: "cli-historial", label: "Mi Historial", icon: <FiFileText />,
    children: [
      { label: "Servicios", to: "/cliente/historial/servicios", icon: <FiScissors size={13} /> },
      { label: "Compras", to: "/cliente/historial/compras", icon: <FiShoppingBag size={13} /> },
    ]
  },
];

const roleLabels: Record<string, string> = {
  administrador: "Administrador del Sistema",
  recepcionista: "Recepcionista",
  groomer: "Groomer",
  cliente: "Cliente",
};

// ─── Sidebar principal ────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const role = (user?.rol as UserRole) ?? "administrador";
  const currentMenu = {
    administrador: administradorMenu,
    recepcionista: recepcionistaMenu,
    groomer: groomerMenu,
    cliente: clienteMenu
  }[role] ?? administradorMenu;
  
  const initials = [user?.nombre, user?.apellido].filter(Boolean).map(s => s![0].toUpperCase()).join("") || "U";
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ") || "Usuario";
  const roleLabel = roleLabels[role] ?? role;

  const navItems = currentMenu.map((item) =>
    item.children ? (
      <SidebarDropdown
        key={item.id}
        label={item.label}
        icon={item.icon}
        open={!!openMenus[item.id]}
        onClick={() => setOpenMenus(p => ({ ...p, [item.id]: !p[item.id] }))}
        items={item.children}
      />
    ) : item.to ? (
      <SidebarItem key={item.id} icon={item.icon} label={item.label} to={item.to} />
    ) : null
  );

  // ── SIDEBAR EXPANDIDO ──
  if (!collapsed) {
    return (
      <aside className="w-full h-full bg-[#1e3a5f] text-white flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-3.5 pt-3.5 pb-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/12 flex items-center justify-center flex-shrink-0">
              <PawIcon size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-[13px] leading-tight m-0">PET SPA</p>
              <p className="text-white/40 text-[9px] uppercase tracking-wider leading-tight m-0">Sistema de Gestión</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            title="Colapsar"
            className="bg-transparent border-none cursor-pointer text-white/40 p-1.5 rounded-lg flex items-center justify-center hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            <FiChevronLeft size={18} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center py-4 px-4 border-b border-white/10 flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-2 shadow-md">
            {initials}
          </div>
          <p className="text-white font-semibold text-sm text-center m-0 leading-tight">{fullName}</p>
          <p className="text-white/60 text-[11px] text-center mt-1 m-0">{roleLabel}</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 py-1.5 flex-shrink-0">
          <SidebarItem icon={<FiUser />} label="Perfil" to={`/${role}/perfil`} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2 mx-2 my-0.5 rounded-lg text-sm font-medium text-white/60 bg-transparent hover:bg-white/10 hover:text-white transition-all duration-150 cursor-pointer w-[calc(100%-16px)] border-none"
          >
            <FiLogOut className="text-[17px] flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    );
  }

  // ── SIDEBAR COLAPSADO ──
  return (
    <aside className="w-full h-full bg-[#1e3a5f] text-white flex flex-col items-center shadow-2xl overflow-hidden">
      {/* Header colapsado */}
      <div className="w-full py-3 pb-2.5 border-b border-white/10 flex flex-col items-center gap-2 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-white/12 flex items-center justify-center">
          <PawIcon size={20} />
        </div>
        <button
          onClick={onToggle}
          title="Expandir"
          className="bg-transparent border-none cursor-pointer text-white/40 p-1 rounded-md flex hover:text-white hover:bg-white/10 transition-all duration-150"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Avatar colapsado */}
      <div className="w-full py-2.5 border-b border-white/10 flex justify-center flex-shrink-0">
        <div
          title={fullName}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-300 to-blue-600 flex items-center justify-center text-white font-bold text-xs"
        >
          {initials}
        </div>
      </div>

      {/* Navegación colapsada */}
      <nav className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-1 w-full">
        {currentMenu.map(item =>
          item.children ? (
            <CollapsedParentItem key={item.id} item={item} />
          ) : item.to ? (
            <CollapsedSimpleItem key={item.id} item={item} />
          ) : null
        )}
      </nav>

      {/* Footer colapsado */}
      <div className="border-t border-white/10 py-2 flex flex-col items-center gap-1.5 flex-shrink-0 w-full">
        <NavLink
          to={`/${role}/perfil`}
          title="Perfil"
          className={({ isActive }) => `
            w-10 h-10 flex items-center justify-center rounded-xl
            text-lg no-underline transition-all duration-150
            ${isActive
              ? 'bg-blue-600 text-white opacity-100'
              : 'text-white/70 hover:bg-white/10 hover:text-white hover:opacity-100'
            }
          `}
        >
          <FiUser />
        </NavLink>
        <button
          onClick={handleLogout}
          title="Cerrar Sesión"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-all duration-150 cursor-pointer border-none bg-transparent text-white"
        >
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
}