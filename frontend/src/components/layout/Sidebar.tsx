// src/components/layout/Sidebar.tsx
import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiHome,
  FiUsers,
  FiBox,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiUser,
  FiBriefcase,
  FiPackage,
  FiBarChart2,
  FiShoppingBag,
  FiCalendar,
  FiScissors,
  FiBell,
  FiDollarSign,
  FiGrid,
  FiClock,
  FiHeart,
} from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../services/types/auth";

interface SidebarProps {
  collapsed: boolean;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  to?: string;
  children?: Array<{
    label: string;
    to: string;
    icon?: React.ReactNode;
  }>;
}

interface SidebarDropdownProps {
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onClick: () => void;
  items: Array<{
    label: string;
    to: string;
    icon?: React.ReactNode;
  }>;
}

interface DropdownItemProps {
  item: {
    label: string;
    to: string;
    icon?: React.ReactNode;
  };
}

// -------------------- Items para sidebar expandido --------------------

function DropdownItem({ item }: DropdownItemProps) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => {
        const baseClasses =
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group";
        const activeClasses =
          "bg-white/20 text-white shadow-md border border-white/10";
        const inactiveClasses =
          "hover:bg-white/10 text-white/80 hover:text-white border border-transparent";

        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
      }}
    >
      {({ isActive }) => (
        <>
          {item.icon && (
            <span
              className={`transition-transform duration-200 ${
                isActive ? "scale-110" : "group-hover:scale-105"
              }`}
            >
              {item.icon}
            </span>
          )}
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarItem({ icon, label, to }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        const baseClasses =
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group";
        const activeClasses =
          "bg-white/20 text-white shadow-lg shadow-black/10 border border-white/10";
        const inactiveClasses =
          "hover:bg-white/10 text-white/90 hover:text-white border border-transparent";

        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
      }}
    >
      {({ isActive }) => (
        <>
          <span
            className={`transition-transform duration-200 ${
              isActive ? "scale-110" : "group-hover:scale-105"
            }`}
          >
            {icon}
          </span>
          <span className="font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarDropdown({
  icon,
  label,
  open,
  onClick,
  items,
}: SidebarDropdownProps) {
  return (
    <div className="space-y-1">
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white border border-transparent hover:border-white/5 group"
      >
        <div className="flex items-center gap-3">
          <span className="transition-transform duration-200 group-hover:scale-105">
            {icon}
          </span>
          <span className="font-medium">{label}</span>
        </div>
        {open ? (
          <FiChevronUp className="transition-transform duration-200" />
        ) : (
          <FiChevronDown className="transition-transform duration-200" />
        )}
      </button>

      {open && (
        <div className="ml-4 space-y-1 border-l-2 border-white/20 pl-3 py-1">
          {items.map((item, index) => (
            <DropdownItem key={index} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------- Menús por rol --------------------

// ==================== ADMINISTRADOR ====================
const administradorMenu: MenuItem[] = [
  {
    id: "admin-dashboard",
    label: "Dashboard",
    icon: <FiHome className="text-lg" />,
    to: "/admin/dashboard",
  },
  {
    id: "admin-agenda",
    label: "Agenda",
    icon: <FiCalendar className="text-lg" />,
    to: "/admin/agenda",
  },
  {
    id: "admin-grooming",
    label: "Grooming",
    icon: <FiScissors className="text-lg" />,
    to: "/admin/grooming",
  },
  {
    id: "admin-clientes",
    label: "Clientes",
    icon: <FiUsers className="text-lg" />,
    children: [
      {
        label: "Clientes",
        to: "/admin/clientes",
        icon: <FiUsers className="text-sm" />,
      },
      {
        label: "Mascotas",
        to: "/admin/mascotas",
        icon: <FiHeart className="text-sm" />,
      },
    ],
  },
  {
    id: "admin-catalogo",
    label: "Catálogo",
    icon: <FiPackage className="text-lg" />,
    children: [
      {
        label: "Productos",
        to: "/admin/catalogo/productos",
        icon: <FiBox className="text-sm" />,
      },
      {
        label: "Insumos",
        to: "/admin/catalogo/insumos",
        icon: <FiPackage className="text-sm" />,
      },
      {
        label: "Categorías",
        to: "/admin/catalogo/categorias",
        icon: <FiGrid className="text-sm" />,
      },
      {
        label: "Movimientos",
        to: "/admin/catalogo/movimientos",
        icon: <FiClock className="text-sm" />,
      },
    ],
  },
  {
    id: "admin-reportes",
    label: "Reportes",
    icon: <FiBarChart2 className="text-lg" />,
    to: "/admin/reportes",
  },
  {
    id: "admin-configuracion",
    label: "Configuración",
    icon: <FiSettings className="text-lg" />,
    children: [
      {
        label: "Datos del Negocio",
        to: "/admin/configuracion/negocio",
        icon: <FiBriefcase className="text-sm" />,
      },
      {
        label: "Usuarios",
        to: "/admin/configuracion/usuarios",
        icon: <FiUsers className="text-sm" />,
      },
      {
        label: "Notificaciones",
        to: "/admin/configuracion/notificaciones",
        icon: <FiBell className="text-sm" />,
      },
    ],
  },
  {
    id: "admin-perfil",
    label: "Perfil",
    icon: <FiUser className="text-lg" />,
    to: "/admin/perfil",
  },
];

// ==================== RECEPCIONISTA ====================
const recepcionistaMenu: MenuItem[] = [
  {
    id: "recepcion-dashboard",
    label: "Dashboard",
    icon: <FiHome className="text-lg" />,
    to: "/recepcionista/dashboard",
  },
  {
    id: "recepcion-agenda",
    label: "Agenda",
    icon: <FiCalendar className="text-lg" />,
    to: "/recepcionista/agenda",
  },
  {
    id: "recepcion-clientes",
    label: "Clientes",
    icon: <FiUsers className="text-lg" />,
    children: [
      {
        label: "Clientes",
        to: "/recepcionista/clientes",
        icon: <FiUsers className="text-sm" />,
      },
      {
        label: "Mascotas",
        to: "/recepcionista/mascotas",
        icon: <FiHeart className="text-sm" />,
      },
    ],
  },
  {
    id: "recepcion-ventas",
    label: "Ventas",
    icon: <FiDollarSign className="text-lg" />,
    to: "/recepcionista/ventas",
  },
  {
    id: "recepcion-notificaciones",
    label: "Notificaciones",
    icon: <FiBell className="text-lg" />,
    to: "/recepcionista/notificaciones",
  },
  {
    id: "recepcion-perfil",
    label: "Perfil",
    icon: <FiUser className="text-lg" />,
    to: "/recepcionista/perfil",
  },
];

// ==================== GROOMER ====================
const groomerMenu: MenuItem[] = [
  {
    id: "groomer-dashboard",
    label: "Dashboard",
    icon: <FiHome className="text-lg" />,
    to: "/groomer/dashboard",
  },
  {
    id: "groomer-agenda",
    label: "Mi Agenda",
    icon: <FiCalendar className="text-lg" />,
    to: "/groomer/agenda",
  },
  {
    id: "groomer-fichas",
    label: "Fichas",
    icon: <FiFileText className="text-lg" />,
    children: [
      {
        label: "Fichas de Hoy",
        to: "/groomer/fichas/hoy",
        icon: <FiClock className="text-sm" />,
      },
      {
        label: "Todas las Fichas",
        to: "/groomer/fichas/todas",
        icon: <FiFileText className="text-sm" />,
      },
    ],
  },
  {
    id: "groomer-perfil",
    label: "Perfil",
    icon: <FiUser className="text-lg" />,
    to: "/groomer/perfil",
  },
];

// ==================== CLIENTE ====================
const clienteMenu: MenuItem[] = [
  {
    id: "cliente-dashboard",
    label: "Inicio",
    icon: <FiHome className="text-lg" />,
    to: "/cliente/dashboard",
  },
  {
    id: "cliente-mascotas",
    label: "Mis Mascotas",
    icon: <FiHeart className="text-lg" />,
    to: "/cliente/mis-mascotas",
  },
  {
    id: "cliente-citas",
    label: "Mis Citas",
    icon: <FiCalendar className="text-lg" />,
    to: "/cliente/mis-citas",
  },
  {
    id: "cliente-catalogo",
    label: "Catálogo",
    icon: <FiShoppingBag className="text-lg" />,
    to: "/cliente/catalogo",
  },
  {
    id: "cliente-historial",
    label: "Mi Historial",
    icon: <FiFileText className="text-lg" />,
    children: [
      {
        label: "Servicios",
        to: "/cliente/historial/servicios",
        icon: <FiScissors className="text-sm" />,
      },
      {
        label: "Compras",
        to: "/cliente/historial/compras",
        icon: <FiShoppingBag className="text-sm" />,
      },
    ],
  },
  {
    id: "cliente-perfil",
    label: "Perfil",
    icon: <FiUser className="text-lg" />,
    to: "/cliente/perfil",
  },
];

// ------------- Componentes para sidebar colapsado -------------

function CollapsedSimpleItem({ item }: { item: MenuItem }) {
  return (
    <NavLink
      to={item.to!}
      className={({ isActive }) =>
        `w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-200 ${
          isActive
            ? "bg-white/20 border-white/80 text-white"
            : "border-white/20 text-white/90 hover:bg-white/10"
        }`
      }
    >
      {item.icon}
      <span className="sr-only">{item.label}</span>
    </NavLink>
  );
}

function CollapsedParentItem({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const OFFSET = 65;
      const newTop = Math.max(8, rect.top - OFFSET);
      setTop(newTop);
    }
    setOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/10"
      >
        {item.icon}
      </button>

      {open && (
        <div
          className="fixed left-16 bg-gray-800 rounded-xl shadow-xl border border-gray-600 z-50 min-w-[190px]"
          style={{ top }}
          onMouseLeave={() => setOpen(false)}
        >
          <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-300">
            {item.label}
          </p>
          <div className="py-1">
            {item.children?.map((child, idx) => (
              <NavLink
                key={idx}
                to={child.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`
                }
              >
                {child.icon && <span>{child.icon}</span>}
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// -------------------- Sidebar principal --------------------

export default function Sidebar({ collapsed }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const role = user?.rol as UserRole;

  let currentMenu: MenuItem[] = administradorMenu;
  if (role === "recepcionista") currentMenu = recepcionistaMenu;
  if (role === "groomer") currentMenu = groomerMenu;
  if (role === "cliente") currentMenu = clienteMenu;

  // ---------- Sidebar EXPANDIDO ----------
  const renderExpanded = () => (
    <>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        {currentMenu.map((item) =>
          item.children ? (
            <SidebarDropdown
              key={item.id}
              label={item.label}
              icon={item.icon}
              open={!!openMenus[item.id]}
              onClick={() =>
                setOpenMenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
              }
              items={item.children}
            />
          ) : (
            item.to && (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                to={item.to}
              />
            )
          )
        )}
      </nav>

      {/* Footer - Cerrar Sesión */}
      <div className="p-4 border-t border-white/10 space-y-2 bg-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-white group border border-transparent hover:border-white/10"
        >
          <FiLogOut className="text-lg group-hover:scale-110 transition-transform" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  // ---------- Sidebar COLAPSADO ----------
  const renderCollapsed = () => (
    <>
      <nav className="flex-1 py-4 flex flex-col items-center gap-3 overflow-y-auto no-scrollbar">
        {currentMenu.map((item) =>
          item.children ? (
            <CollapsedParentItem key={item.id} item={item} />
          ) : (
            item.to && <CollapsedSimpleItem key={item.id} item={item} />
          )
        )}
      </nav>

      {/* Footer colapsado */}
      <div className="p-3 border-t border-white/10 bg-white/5 flex flex-col items-center gap-3">
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/20 transition-all duration-200"
        >
          <FiLogOut className="text-lg" />
          <span className="sr-only">Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <aside
      className={`
        h-full bg-gradient-to-b from-blue-800 to-blue-950
        text-white flex flex-col shadow-2xl
        transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="relative z-10 flex flex-col h-full">
        {collapsed ? renderCollapsed() : renderExpanded()}
      </div>
    </aside>
  );
}