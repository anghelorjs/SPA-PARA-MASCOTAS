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

const SIDEBAR_BG = "#1e4080";

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

// ─── Estilos globales ─────────────────────────────────────────────────────────
const globalStyle = `
  /* ── Item ACTIVO: pastilla blanca con esquinas curvas internas ── */
  .nav-active-wrap {
    position: relative;
    /* sin margen horizontal — la pastilla va de borde a borde derecho */
  }

  /* Esquina curva SUPERIOR derecha */
  .nav-corner-top {
    position: absolute;
    bottom: 100%;
    right: 0;
    width: 22px;
    height: 22px;
    overflow: hidden;
    pointer-events: none;
    z-index: 2;
  }
  .nav-corner-top::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 44px;
    height: 44px;
    background: transparent;
    border-bottom-right-radius: 22px;
    box-shadow: 12px 12px 0 0 #E9E9EB;
  }

  /* Esquina curva INFERIOR derecha */
  .nav-corner-bottom {
    position: absolute;
    top: 100%;
    right: 0;
    width: 22px;
    height: 22px;
    overflow: hidden;
    pointer-events: none;
    z-index: 2;
  }
  .nav-corner-bottom::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 44px;
    height: 44px;
    background: transparent;
    border-top-right-radius: 22px;
    box-shadow: 12px -12px 0 0 #E9E9EB;
  }

  /* Pastilla blanca activa */
  .nav-active-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 20px 13px 20px;
    margin-right: 0;
    border-radius: 28px 0 0 28px;
    background: #E9E9EB;
    color: #1e3a6e;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    z-index: 1;
  }

  /* ── Item INACTIVO: gradiente blanco de izq a der ── */
  .nav-inactive-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px 13px 20px;
    margin: 3px 14px 3px 0;
    border-radius: 28px;
    background: linear-gradient(
      to right,
      rgba(255,255,255,0.22) 0%,
      rgba(255,255,255,0.08) 55%,
      rgba(255,255,255,0.01) 100%
    );
    color: rgba(255,255,255,0.92);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .nav-inactive-pill:hover {
    background: linear-gradient(
      to right,
      rgba(255,255,255,0.32) 0%,
      rgba(255,255,255,0.12) 55%,
      rgba(255,255,255,0.02) 100%
    );
  }

  .nav-scroll::-webkit-scrollbar { width: 3px; }
  .nav-scroll::-webkit-scrollbar-track { background: transparent; }
  .nav-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
`;

// ─── SidebarItem ──────────────────────────────────────────────────────────────
function SidebarItem({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <NavLink to={to} style={{ textDecoration: "none", display: "block" }}>
      {({ isActive }) =>
        isActive ? (
          <div className="nav-active-wrap">
            <div className="nav-corner-top" />
            <div className="nav-active-pill">
              <span style={{ fontSize: "18px", display: "flex", color: "#1e3a6e" }}>{icon}</span>
              <span>{label}</span>
            </div>
            <div className="nav-corner-bottom" />
          </div>
        ) : (
          <div className="nav-inactive-pill">
            <span style={{ fontSize: "18px", display: "flex", opacity: 0.68 }}>{icon}</span>
            <span style={{ opacity: 0.9 }}>{label}</span>
          </div>
        )
      }
    </NavLink>
  );
}

// ─── SidebarDropdown ──────────────────────────────────────────────────────────
function SidebarDropdown({
  icon, label, open, onClick, items,
}: {
  icon: React.ReactNode; label: string; open: boolean;
  onClick: () => void;
  items: Array<{ label: string; to: string; icon?: React.ReactNode }>;
}) {
  return (
    <div style={{ margin: "3px 14px 3px 0" }}>
      <button
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "13px 14px 13px 20px",
          borderRadius: open ? "12px 12px 0 0" : "12px",
          fontSize: "14px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.92)",
          background: open
            ? "rgba(255,255,255,0.2)"
            : "linear-gradient(to right, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0.01) 100%)",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxSizing: "border-box",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "18px", display: "flex", opacity: 0.8 }}>{icon}</span>
          <span style={{ opacity: 0.9 }}>{label}</span>
        </span>
        <span style={{ opacity: 0.45, display: "flex", fontSize: "13px" }}>
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </span>
      </button>

      <div style={{
        overflow: "hidden",
        maxHeight: open ? "400px" : "0",
        opacity: open ? 1 : 0,
        transition: "max-height 0.3s ease, opacity 0.2s ease",
        background: "rgba(0,0,0,0.12)",
        borderRadius: "0 0 12px 12px",
      }}>
        <div style={{ padding: "4px 6px 8px" }}>
          {items.map((item, idx) => (
            <NavLink key={idx} to={item.to} style={{ textDecoration: "none", display: "block" }}>
              {({ isActive }) => (
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 14px", margin: "2px 0", borderRadius: "8px",
                  fontSize: "13px", fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                  background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}>
                  {item.icon && <span style={{ opacity: isActive ? 1 : 0.6, display: "flex" }}>{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
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
    <NavLink to={item.to!} title={item.label} style={{ textDecoration: "none", display: "block", width: "100%" }}>
      {({ isActive }) =>
        isActive ? (
          <div style={{ position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: "46px",
              background: "white",
              color: "#1e3a6e",
              fontSize: "18px",
              borderRadius: "14px 0 0 14px",
              marginRight: "0",
              marginLeft: "8px",
              position: "relative", zIndex: 1,
            }}>
              {item.icon}
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "44px", margin: "2px 10px 2px 4px",
            background: "linear-gradient(to right, rgba(255,255,255,0.22), rgba(255,255,255,0.04))",
            borderRadius: "10px",
            color: "rgba(255,255,255,0.85)",
            fontSize: "18px", cursor: "pointer",
          }}>
            {item.icon}
          </div>
        )
      }
    </NavLink>
  );
}

// ─── CollapsedParentItem ──────────────────────────────────────────────────────
function CollapsedParentItem({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!open && btnRef.current) setTop(Math.max(8, btnRef.current.getBoundingClientRect().top));
    setOpen(p => !p);
  };

  return (
    <>
      <button ref={btnRef} onClick={handleToggle} title={item.label} style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "44px", margin: "2px 10px 2px 4px", width: "calc(100% - 14px)",
        background: "linear-gradient(to right, rgba(255,255,255,0.22), rgba(255,255,255,0.04))",
        borderRadius: "10px", color: "rgba(255,255,255,0.85)",
        fontSize: "18px", cursor: "pointer", border: "none",
      }}>
        {item.icon}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "fixed", left: "76px", top, zIndex: 50,
            minWidth: "200px", background: "#1a3a6b",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "14px", boxShadow: "0 12px 32px rgba(0,0,0,0.35)", padding: "6px",
          }}>
            <p style={{ padding: "6px 12px", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
              {item.label}
            </p>
            {item.children?.map((child, idx) => (
              <NavLink key={idx} to={child.to} onClick={() => setOpen(false)} style={{ textDecoration: "none", display: "block" }}>
                {({ isActive }) => (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 14px", margin: "2px 0", borderRadius: "10px",
                    fontSize: "13px", color: "#ffffff",
                    background: isActive ? "rgba(255,255,255,0.18)" : "transparent", cursor: "pointer",
                  }}>
                    {child.icon && <span style={{ opacity: 0.7, display: "flex" }}>{child.icon}</span>}
                    <span>{child.label}</span>
                  </div>
                )}
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
  { id: "admin-clientes", label: "Clientes", icon: <FiUsers />, children: [
    { label: "Clientes", to: "/admin/clientes", icon: <FiUsers size={13} /> },
    { label: "Mascotas", to: "/admin/mascotas", icon: <FiHeart size={13} /> },
  ]},
  { id: "admin-catalogo", label: "Catálogo", icon: <FiPackage />, children: [
    { label: "Productos", to: "/admin/catalogo/productos", icon: <FiBox size={13} /> },
    { label: "Insumos", to: "/admin/catalogo/insumos", icon: <FiPackage size={13} /> },
    { label: "Categorías", to: "/admin/catalogo/categorias", icon: <FiGrid size={13} /> },
    { label: "Movimientos", to: "/admin/catalogo/movimientos", icon: <FiClock size={13} /> },
  ]},
  { id: "admin-reportes", label: "Reportes", icon: <FiBarChart2 />, to: "/admin/reportes" },
  { id: "admin-configuracion", label: "Configuración", icon: <FiSettings />, children: [
    { label: "Datos del Negocio", to: "/admin/configuracion/negocio", icon: <FiBriefcase size={13} /> },
    { label: "Usuarios", to: "/admin/configuracion/usuarios", icon: <FiUsers size={13} /> },
    { label: "Notificaciones", to: "/admin/configuracion/notificaciones", icon: <FiBell size={13} /> },
  ]},
];

const recepcionistaMenu: MenuItem[] = [
  { id: "rec-dashboard", label: "Dashboard", icon: <FiHome />, to: "/recepcionista/dashboard" },
  { id: "rec-agenda", label: "Agenda", icon: <FiCalendar />, to: "/recepcionista/agenda" },
  { id: "rec-clientes", label: "Clientes", icon: <FiUsers />, children: [
    { label: "Clientes", to: "/recepcionista/clientes", icon: <FiUsers size={13} /> },
    { label: "Mascotas", to: "/recepcionista/mascotas", icon: <FiHeart size={13} /> },
  ]},
  { id: "rec-ventas", label: "Ventas", icon: <FiDollarSign />, to: "/recepcionista/ventas" },
  { id: "rec-notificaciones", label: "Notificaciones", icon: <FiBell />, to: "/recepcionista/notificaciones" },
];

const groomerMenu: MenuItem[] = [
  { id: "grm-dashboard", label: "Dashboard", icon: <FiHome />, to: "/groomer/dashboard" },
  { id: "grm-agenda", label: "Mi Agenda", icon: <FiCalendar />, to: "/groomer/agenda" },
  { id: "grm-fichas", label: "Fichas", icon: <FiFileText />, children: [
    { label: "Fichas de Hoy", to: "/groomer/fichas/hoy", icon: <FiClock size={13} /> },
    { label: "Todas las Fichas", to: "/groomer/fichas/todas", icon: <FiFileText size={13} /> },
  ]},
];

const clienteMenu: MenuItem[] = [
  { id: "cli-dashboard", label: "Inicio", icon: <FiHome />, to: "/cliente/dashboard" },
  { id: "cli-mascotas", label: "Mis Mascotas", icon: <FiHeart />, to: "/cliente/mis-mascotas" },
  { id: "cli-citas", label: "Mis Citas", icon: <FiCalendar />, to: "/cliente/mis-citas" },
  { id: "cli-catalogo", label: "Catálogo", icon: <FiShoppingBag />, to: "/cliente/catalogo" },
  { id: "cli-historial", label: "Mi Historial", icon: <FiFileText />, children: [
    { label: "Servicios", to: "/cliente/historial/servicios", icon: <FiScissors size={13} /> },
    { label: "Compras", to: "/cliente/historial/compras", icon: <FiShoppingBag size={13} /> },
  ]},
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

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const role = (user?.rol as UserRole) ?? "administrador";
  const currentMenu = { administrador: administradorMenu, recepcionista: recepcionistaMenu, groomer: groomerMenu, cliente: clienteMenu }[role] ?? administradorMenu;
  const initials = [user?.nombre, user?.apellido].filter(Boolean).map(s => s![0].toUpperCase()).join("") || "U";
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ") || "Usuario";
  const roleLabel = roleLabels[role] ?? role;

  const navItems = currentMenu.map((item) =>
    item.children ? (
      <SidebarDropdown key={item.id} label={item.label} icon={item.icon}
        open={!!openMenus[item.id]}
        onClick={() => setOpenMenus(p => ({ ...p, [item.id]: !p[item.id] }))}
        items={item.children}
      />
    ) : item.to ? (
      <SidebarItem key={item.id} icon={item.icon} label={item.label} to={item.to} />
    ) : null
  );

  const sidebarStyle: React.CSSProperties = {
    width: "100%", height: "100%",
    background: `linear-gradient(180deg, #1b3d70 0%, ${SIDEBAR_BG} 45%, #1b3d70 100%)`,
    color: "#ffffff",
    display: "flex", flexDirection: "column",
    boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
    overflow: "hidden", position: "relative",
  };

  if (!collapsed) {
    return (
      <>
        <style>{globalStyle}</style>
        <aside style={sidebarStyle}>
          {/* Header */}
          <div style={{ padding: "12px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PawIcon size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" }}>PET SPA</p>
                <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1px" }}>Sistema de Gestión</p>
              </div>
            </div>
            <button onClick={onToggle} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", cursor: "pointer", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiChevronLeft size={16} />
            </button>
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #a8c8f8 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700, fontSize: "22px", boxShadow: "0 6px 20px rgba(59,130,246,0.4)", border: "3px solid rgba(255,255,255,0.25)", marginBottom: "10px" }}>
              {initials}
            </div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", textAlign: "center" }}>{fullName}</p>
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.55)", textAlign: "center" }}>{roleLabel}</p>
          </div>

          {/* Nav */}
          <nav className="nav-scroll" style={{ flex: 1, overflowY: "auto", padding: "28px 0" }}>
            {navItems}
          </nav>

          {/* Footer */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "8px 0", flexShrink: 0 }}>
            <SidebarItem icon={<FiUser />} label="Perfil" to={`/${role}/perfil`} />
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px 13px 20px", margin: "3px 14px 3px 0", borderRadius: "12px", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.8)", background: "linear-gradient(to right, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 100%)", border: "none", cursor: "pointer", width: "calc(100% - 14px)", boxSizing: "border-box" }}>
              <FiLogOut style={{ fontSize: "18px", flexShrink: 0, opacity: 0.8 }} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      </>
    );
  }

  // ── COLAPSADO ──
  return (
    <>
      <style>{globalStyle}</style>
      <aside style={{ ...sidebarStyle, alignItems: "center" }}>
        <div style={{ width: "100%", padding: "12px 0 10px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PawIcon size={20} />
          </div>
          <button onClick={onToggle} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", cursor: "pointer", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiChevronRight size={15} />
          </button>
        </div>
        <div style={{ width: "100%", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <div title={fullName} style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #a8c8f8 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700, fontSize: "13px" }}>
            {initials}
          </div>
        </div>
        <nav className="nav-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "stretch", gap: "2px", width: "100%" }}>
          {currentMenu.map(item =>
            item.children ? <CollapsedParentItem key={item.id} item={item} /> : item.to ? <CollapsedSimpleItem key={item.id} item={item} /> : null
          )}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "stretch", gap: "2px", flexShrink: 0, width: "100%" }}>
          <NavLink to={`/${role}/perfil`} title="Perfil" style={{ textDecoration: "none", display: "block" }}>
            {({ isActive }) => (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "44px", margin: "2px 0 2px 4px", background: isActive ? "white" : "linear-gradient(to right, rgba(255,255,255,0.22), rgba(255,255,255,0.04))", borderRadius: isActive ? "14px 0 0 14px" : "10px", color: isActive ? "#1e3a6e" : "rgba(255,255,255,0.85)", fontSize: "18px", cursor: "pointer" }}>
                <FiUser />
              </div>
            )}
          </NavLink>
          <button onClick={handleLogout} title="Cerrar Sesión" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "44px", margin: "2px 10px 2px 4px", background: "linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.02))", borderRadius: "10px", color: "rgba(255,255,255,0.75)", fontSize: "18px", cursor: "pointer", border: "none" }}>
            <FiLogOut />
          </button>
        </div>
      </aside>
    </>
  );
}