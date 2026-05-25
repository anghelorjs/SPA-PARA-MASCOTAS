import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import type { UserRole } from "./services/types/auth";
import { useToast } from './hooks/useToast';
import { ActivateAccount } from "./pages/auth/ActivateAccount";
import { ForceChangePassword } from "./pages/auth/ForceChangePassword";
import { GoogleCallback } from "./pages/auth/GoogleCallback";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";

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

// Componentes placeholder para las demás pantallas del administrador
import { AgendaAdmin } from "./pages/admin/agenda/pages/AgendaAdmin";
const GroomingAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Grooming</h1><p className="mt-4 text-gray-600">Gestión de fichas de grooming y galería de fotos.</p></div>;
const ClientesAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Clientes</h1><p className="mt-4 text-gray-600">Gestión de clientes y sus mascotas.</p></div>;
const MascotasAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Mascotas</h1><p className="mt-4 text-gray-600">Gestión de mascotas del sistema.</p></div>;
import { ProductosAdmin } from "./pages/admin/catalogo/productos/pages/ProductosAdmin";
import { InsumosAdmin } from "./pages/admin/catalogo/insumos/pages/InsumosAdmin";
import { CategoriasAdmin } from "./pages/admin/catalogo/categorias/pages/CategoriasAdmin";
import { MovimientosAdmin } from "./pages/admin/catalogo/movimientos/pages/MovimientosAdmin";
const ReportesAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Reportes</h1><p className="mt-4 text-gray-600">Generación de reportes del sistema.</p></div>;
const ConfiguracionNegocio = () => <div className="p-6"><h1 className="text-2xl font-bold">Datos del Negocio</h1><p className="mt-4 text-gray-600">Configuración de la empresa.</p></div>;
import { UsuariosPage } from "./pages/admin/configuracion/usuarios/pages/UsuariosPage";
import { LogsPage } from "./pages/admin/configuracion/logs/pages/LogsPage";
const ConfiguracionNotificaciones = () => <div className="p-6"><h1 className="text-2xl font-bold">Notificaciones del Sistema</h1><p className="mt-4 text-gray-600">Historial y envío de notificaciones.</p></div>;
import { PerfilAdmin } from "./pages/admin/perfil/pages/PerfilAdmin";

// ========================
// RECEPCIONISTA
// ========================
import { DashboardRecepcionista } from "./pages/recepcionista/dashboard/pages/DashboardRecepcionista";
import { AgendaRecepcionista } from "./pages/recepcionista/agenda/pages/AgendaRecepcionista";
const ClientesRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Clientes</h1><p className="mt-4 text-gray-600">Gestión de clientes.</p></div>;
const MascotasRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Mascotas</h1><p className="mt-4 text-gray-600">Gestión de mascotas.</p></div>;
// ✅ AGREGA ESTE IMPORT:
import { VentasRecepcionista } from "./pages/recepcionista/ventas/pages/VentasRecepcionista";
const NotificacionesRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Notificaciones</h1><p className="mt-4 text-gray-600">Envío de notificaciones a clientes.</p></div>;
import { PerfilRecepcionista } from "./pages/recepcionista/perfil/pages/PerfilRecepcionista";

// ========================
// GROOMER
// ========================
import { DashboardGroomer } from "./pages/groomer/dashboard/pages/DashboardGroomer";
import { MiAgendaGroomer } from "./pages/groomer/agenda/pages/MiAgendaGroomer";
import { FichasGroomer } from "./pages/groomer/fichas/pages/FichasGroomer";
import { DetalleFichaGroomer } from "./pages/groomer/fichas/pages/DetalleFichaGroomer";
import { PerfilGroomer } from "./pages/groomer/perfil/pages/PerfilGroomer";
// ========================
// CLIENTE
// ========================
import { DashboardCliente } from "./pages/cliente/dashboard/pages/DashboardCliente";
import { MisMascotas } from "./pages/cliente/mascotas/pages/MisMascotas";
import { DetalleMascota } from "./pages/cliente/mascotas/pages/DetalleMascota";
import { MisCitas } from "./pages/cliente/citas/pages/MisCitas";
const CatalogoCliente = () => <div className="p-6"><h1 className="text-2xl font-bold">Catálogo</h1><p className="mt-4 text-gray-600">Productos disponibles.</p></div>;
const HistorialServicios = () => <div className="p-6"><h1 className="text-2xl font-bold">Historial de Servicios</h1><p className="mt-4 text-gray-600">Servicios realizados.</p></div>;
const HistorialCompras = () => <div className="p-6"><h1 className="text-2xl font-bold">Historial de Compras</h1><p className="mt-4 text-gray-600">Tus compras realizadas.</p></div>;
import { PerfilCliente } from "./pages/cliente/perfil/pages/PerfilCliente";

// ============================================================
// COMPONENTE PARA REDIRIGIR AL DASHBOARD SEGÚN EL ROL
// ============================================================
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

// ============================================================
// APLICACIÓN PRINCIPAL
// ============================================================
const AppRoutes = () => {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/activar-cuenta" element={<ActivateAccount />} />
      <Route path="/force-change-password" element={<ForceChangePassword />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Ruta raíz - redirige según rol */}
      <Route path="/" element={<NavigateToDashboard />} />

      {/* RUTAS PROTEGIDAS */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ===================================== */}
        {/* ADMINISTRADOR */}
        {/* ===================================== */}
        <Route path="admin/dashboard" element={<DashboardAdmin />} />
        <Route path="admin/agenda" element={<AgendaAdmin />} />
        <Route path="admin/grooming" element={<GroomingAdmin />} />
        <Route path="admin/clientes" element={<ClientesAdmin />} />
        <Route path="admin/mascotas" element={<MascotasAdmin />} />
        <Route path="admin/catalogo/productos" element={<ProductosAdmin />} />
        <Route path="admin/catalogo/insumos" element={<InsumosAdmin />} />
        <Route path="admin/catalogo/categorias" element={<CategoriasAdmin />} />
        <Route path="admin/catalogo/movimientos" element={<MovimientosAdmin />} />
        <Route path="admin/reportes" element={<ReportesAdmin />} />
        <Route path="admin/configuracion/negocio" element={<ConfiguracionNegocio />} />
        <Route path="admin/configuracion/usuarios" element={<UsuariosPage />} />
        <Route path="admin/configuracion/logs" element={<LogsPage />} />
        <Route path="admin/configuracion/notificaciones" element={<ConfiguracionNotificaciones />} />
        <Route path="admin/perfil" element={<PerfilAdmin />} />

        {/* ===================================== */}
        {/* RECEPCIONISTA */}
        {/* ===================================== */}
        <Route path="recepcionista/dashboard" element={<DashboardRecepcionista />} />
        <Route path="recepcionista/agenda" element={<AgendaRecepcionista />} />
        <Route path="recepcionista/clientes" element={<ClientesRecepcionista />} />
        <Route path="recepcionista/mascotas" element={<MascotasRecepcionista />} />
        <Route path="recepcionista/ventas" element={<VentasRecepcionista />} />
        <Route path="recepcionista/notificaciones" element={<NotificacionesRecepcionista />} />
        <Route path="recepcionista/perfil" element={<PerfilRecepcionista />} />

        {/* ===================================== */}
        {/* GROOMER */}
        {/* ===================================== */}
        <Route path="groomer/dashboard" element={<DashboardGroomer />} />
        <Route path="groomer/agenda" element={<MiAgendaGroomer />} />
        <Route path="groomer/fichas" element={<FichasGroomer />} />        {/* ← SOLO ESTA RUTA */}
        <Route path="groomer/fichas/:id" element={<DetalleFichaGroomer />} />  {/* ← Para detalle */}
        <Route path="groomer/perfil" element={<PerfilGroomer />} />

        {/* ===================================== */}
        {/* CLIENTE */}
        {/* ===================================== */}
        <Route path="cliente/dashboard" element={<DashboardCliente />} />
        <Route path="cliente/mis-mascotas" element={<MisMascotas />} />
        <Route path="cliente/mis-mascotas/:id" element={<DetalleMascota />} />
        <Route path="cliente/mis-citas" element={<MisCitas />} />
        <Route path="cliente/agendado" element={<Navigate to="/cliente/mis-citas" replace />} />
        <Route path="cliente/catalogo" element={<CatalogoCliente />} />
        <Route path="cliente/historial/servicios" element={<HistorialServicios />} />
        <Route path="cliente/historial/compras" element={<HistorialCompras />} />
        <Route path="cliente/perfil" element={<PerfilCliente />} />

        {/* Ruta por defecto dentro del layout */}
        <Route index element={<NavigateToDashboard />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  const { ToastContainer } = useToast();
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
