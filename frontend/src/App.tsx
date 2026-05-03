// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import type { UserRole } from "./services/types/auth";

// Pages de Auth
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Unauthorized } from "./pages/auth/Unauthorized";

// Layout
import DashboardLayout from "./components/layout/Layout";

// ========================
// ADMINISTRADOR
// ========================
import { DashboardAdmin } from "./pages/admin/dashboard/pages/DashboardAdmin";
// import { AgendaAdmin } from "./pages/admin/agenda/pages/AgendaAdmin";
// import { GroomingAdmin } from "./pages/admin/grooming/pages/GroomingAdmin";
// import { ClientesAdmin } from "./pages/admin/clientes/pages/ClientesAdmin";
// import { CatalogoAdmin } from "./pages/admin/catalogo/pages/CatalogoAdmin";
// import { ReportesAdmin } from "./pages/admin/reportes/pages/ReportesAdmin";
// import { ConfiguracionAdmin } from "./pages/admin/configuracion/pages/ConfiguracionAdmin";
// import { PerfilAdmin } from "./pages/admin/perfil/pages/PerfilAdmin";

// ========================
// RECEPCIONISTA
// ========================
// import DashboardRecepcionista from "./pages/recepcionista/dashboard/pages/DashboardRecepcionista";
// import AgendaRecepcionista from "./pages/recepcionista/agenda/pages/AgendaRecepcionista";
// import ClientesRecepcionista from "./pages/recepcionista/clientes/pages/ClientesRecepcionista";
// import VentasRecepcionista from "./pages/recepcionista/ventas/pages/VentasRecepcionista";
// import NotificacionesRecepcionista from "./pages/recepcionista/notificaciones/pages/NotificacionesRecepcionista";
// import PerfilRecepcionista from "./pages/recepcionista/perfil/pages/PerfilRecepcionista";

// ========================
// GROOMER
// ========================
// import DashboardGroomer from "./pages/groomer/dashboard/pages/DashboardGroomer";
// import AgendaGroomer from "./pages/groomer/agenda/pages/AgendaGroomer";
// import FichasGroomer from "./pages/groomer/fichas/pages/FichasGroomer";
// import PerfilGroomer from "./pages/groomer/perfil/pages/PerfilGroomer";

// ========================
// CLIENTE
// ========================
// import DashboardCliente from "./pages/cliente/dashboard/pages/DashboardCliente";
// import MisMascotas from "./pages/cliente/mascotas/pages/MisMascotas";
// import MisCitas from "./pages/cliente/citas/pages/MisCitas";
// import CatalogoCliente from "./pages/cliente/catalogo/pages/CatalogoCliente";
// import MiHistorial from "./pages/cliente/historial/pages/MiHistorial";
// import PerfilCliente from "./pages/cliente/perfil/pages/PerfilCliente";

const dashboardByRole: Record<UserRole, string> = {
  administrador: "/admin/dashboard",
  recepcionista: "/recepcionista/dashboard",
  groomer: "/groomer/dashboard",
  cliente: "/cliente/dashboard",
};

const NavigateToDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={dashboardByRole[user.rol]} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================================================== */}
      {/* RUTAS PÚBLICAS (LOGIN / REGISTER / UNAUTHORIZED)   */}
      {/* ================================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Ruta raíz - redirige al dashboard según el rol */}
      <Route path="/" element={<NavigateToDashboard />} />

      {/* ============================================================================ */}
      {/* RUTAS PROTEGIDAS envueltas en DashboardLayout                               */}
      {/* ============================================================================ */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* =============================================== */}
        {/* RUTAS COMUNES A TODOS LOS ROLES                 */}
        {/* =============================================== */}
        {/* <Route path="perfil" element={<PerfilAdmin />} /> */}

        {/* ============================== */}
        {/* ADMINISTRADOR                  */}
        {/* ============================== */}
        <Route path="admin/dashboard" element={<DashboardAdmin />} />
        {/* <Route path="admin/agenda" element={<AgendaAdmin />} />
        <Route path="admin/grooming" element={<GroomingAdmin />} />
        <Route path="admin/clientes" element={<ClientesAdmin />} />
        <Route path="admin/catalogo" element={<CatalogoAdmin />} />
        <Route path="admin/reportes" element={<ReportesAdmin />} />
        <Route path="admin/configuracion" element={<ConfiguracionAdmin />} />
        <Route path="admin/perfil" element={<PerfilAdmin />} /> */}

        {/* ============================== */}
        {/* RECEPCIONISTA                  */}
        {/* ============================== */}
        {/* <Route path="recepcionista/dashboard" element={<DashboardRecepcionista />} />
        <Route path="recepcionista/agenda" element={<AgendaRecepcionista />} />
        <Route path="recepcionista/clientes" element={<ClientesRecepcionista />} />
        <Route path="recepcionista/ventas" element={<VentasRecepcionista />} />
        <Route path="recepcionista/notificaciones" element={<NotificacionesRecepcionista />} />
        <Route path="recepcionista/perfil" element={<PerfilRecepcionista />} /> */}

        {/* ============================== */}
        {/* GROOMER                        */}
        {/* ============================== */}
        {/* <Route path="groomer/dashboard" element={<DashboardGroomer />} />
        <Route path="groomer/agenda" element={<AgendaGroomer />} />
        <Route path="groomer/fichas" element={<FichasGroomer />} />
        <Route path="groomer/perfil" element={<PerfilGroomer />} /> */}

        {/* ============================== */}
        {/* CLIENTE                        */}
        {/* ============================== */}
        {/* <Route path="cliente/dashboard" element={<DashboardCliente />} />
        <Route path="cliente/mis-mascotas" element={<MisMascotas />} />
        <Route path="cliente/mis-citas" element={<MisCitas />} />
        <Route path="cliente/catalogo" element={<CatalogoCliente />} />
        <Route path="cliente/mi-historial" element={<MiHistorial />} />
        <Route path="cliente/perfil" element={<PerfilCliente />} /> */}

        {/* Ruta por defecto dentro del layout protegido */}
        <Route index element={<NavigateToDashboard />} />
      </Route>

      {/* ========================================= */}
      {/* RUTA 404 GLOBAL                           */}
      {/* ========================================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
