// src/components/layout/Layout.tsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useIdleTimer } from "../../hooks/useIdleTimer";
import { InactivityModal } from "../common/InactivityModal";
import { useAuth } from "../../hooks/useAuth";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Función cuando el usuario está inactivo
  const handleIdle = () => {
    setShowInactivityModal(true);
  };

  // Función para cerrar sesión por inactividad
  const handleLogout = async () => {
    setShowInactivityModal(false);
    // El logout se manejará en el hook
  };

  // Función para continuar sesión
  const handleContinue = () => {
    setShowInactivityModal(false);
    resetTimer();
  };

  const { resetTimer } = useIdleTimer({
    timeout: 30 * 60 * 1000, // 30 minutos
    onIdle: handleIdle,
  });

  // No aplicar el temporizador si el usuario no está autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <aside
        className="fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? 68 : 220 }}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      </aside>

      <Navbar sidebarCollapsed={collapsed} />

      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <main
        className="transition-all duration-300 ease-in-out min-h-screen"
        style={{ marginLeft: collapsed ? 68 : 220, paddingTop: 64 }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <InactivityModal
        isOpen={showInactivityModal}
        onClose={handleContinue}
        onLogout={handleLogout}
      />
    </div>
  );
}