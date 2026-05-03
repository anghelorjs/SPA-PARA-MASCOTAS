// src/components/layout/Layout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Sidebar fixed, full height ─────────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? 68 : 220 }}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      </aside>

      {/* ── Navbar fixed, top, respeta ancho del sidebar ───────────────────── */}
      <Navbar sidebarCollapsed={collapsed} />

      {/* ── Overlay móvil ──────────────────────────────────────────────────── */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* ── Contenido principal ────────────────────────────────────────────── */}
      <main
        className="transition-all duration-300 ease-in-out min-h-screen"
        style={{ marginLeft: collapsed ? 68 : 220, paddingTop: 64 }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}