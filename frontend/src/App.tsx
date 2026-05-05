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

// Componentes placeholder para las demás pantallas del administrador
const AgendaAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Agenda del Administrador</h1><p className="mt-4 text-gray-600">Panel de gestión de citas y horarios.</p></div>;
const GroomingAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Grooming</h1><p className="mt-4 text-gray-600">Gestión de fichas de grooming y galería de fotos.</p></div>;
const ClientesAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Clientes</h1><p className="mt-4 text-gray-600">Gestión de clientes y sus mascotas.</p></div>;
const MascotasAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Mascotas</h1><p className="mt-4 text-gray-600">Gestión de mascotas del sistema.</p></div>;
const ProductosAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Productos</h1><p className="mt-4 text-gray-600">Catálogo de productos y variantes.</p></div>;
const InsumosAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Insumos</h1><p className="mt-4 text-gray-600">Gestión de insumos y stock.</p></div>;
const CategoriasAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Categorías</h1><p className="mt-4 text-gray-600">Gestión de categorías de productos e insumos.</p></div>;
const MovimientosAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Movimientos de Inventario</h1><p className="mt-4 text-gray-600">Historial de movimientos de stock.</p></div>;
const ReportesAdmin = () => <div className="p-6"><h1 className="text-2xl font-bold">Reportes</h1><p className="mt-4 text-gray-600">Generación de reportes del sistema.</p></div>;
const ConfiguracionNegocio = () => <div className="p-6"><h1 className="text-2xl font-bold">Datos del Negocio</h1><p className="mt-4 text-gray-600">Configuración de la empresa.</p></div>;
const ConfiguracionUsuarios = () => <div className="p-6"><h1 className="text-2xl font-bold">Usuarios del Sistema</h1><p className="mt-4 text-gray-600">Gestión de usuarios y roles.</p></div>;
const ConfiguracionNotificaciones = () => <div className="p-6"><h1 className="text-2xl font-bold">Notificaciones del Sistema</h1><p className="mt-4 text-gray-600">Historial y envío de notificaciones.</p></div>;
import { PerfilAdmin } from "./pages/admin/perfil/pages/PerfilAdmin";

// ========================
// RECEPCIONISTA
// ========================
const DashboardRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Dashboard Recepcionista</h1><p className="mt-4 text-gray-600">Bienvenido al panel de recepción.</p></div>;
const AgendaRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Agenda</h1><p className="mt-4 text-gray-600">Gestión de citas del día.</p></div>;
const ClientesRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Clientes</h1><p className="mt-4 text-gray-600">Gestión de clientes.</p></div>;
const MascotasRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Mascotas</h1><p className="mt-4 text-gray-600">Gestión de mascotas.</p></div>;
const VentasRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Ventas</h1><p className="mt-4 text-gray-600">Registro de ventas.</p></div>;
const NotificacionesRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Notificaciones</h1><p className="mt-4 text-gray-600">Envío de notificaciones a clientes.</p></div>;
const PerfilRecepcionista = () => <div className="p-6"><h1 className="text-2xl font-bold">Mi Perfil</h1><p className="mt-4 text-gray-600">Configuración de tu cuenta.</p></div>;

// ========================
// GROOMER
// ========================
const DashboardGroomer = () => <div className="p-6"><h1 className="text-2xl font-bold">Dashboard Groomer</h1><p className="mt-4 text-gray-600">Bienvenido al panel del groomer.</p></div>;
const AgendaGroomer = () => <div className="p-6"><h1 className="text-2xl font-bold">Mi Agenda</h1><p className="mt-4 text-gray-600">Lista de tus citas del día.</p></div>;
const FichasGroomerHoy = () => <div className="p-6"><h1 className="text-2xl font-bold">Fichas de Hoy</h1><p className="mt-4 text-gray-600">Fichas de grooming del día.</p></div>;
const FichasGroomerTodas = () => <div className="p-6"><h1 className="text-2xl font-bold">Todas las Fichas</h1><p className="mt-4 text-gray-600">Historial de fichas de grooming.</p></div>;
const PerfilGroomer = () => <div className="p-6"><h1 className="text-2xl font-bold">Mi Perfil</h1><p className="mt-4 text-gray-600">Configuración de tu cuenta.</p></div>;

// ========================
// CLIENTE
// ========================
const DashboardCliente = () => <div className="p-6"><h1 className="text-2xl font-bold">Dashboard Cliente</h1><p className="mt-4 text-gray-600">Bienvenido a tu panel.</p></div>;
const MisMascotas = () => <div className="p-6"><h1 className="text-2xl font-bold">Mis Mascotas</h1><p className="mt-4 text-gray-600">Gestión de tus mascotas.</p></div>;
const MisCitas = () => <div className="p-6"><h1 className="text-2xl font-bold">Mis Citas</h1><p className="mt-4 text-gray-600">Tus citas programadas.</p></div>;
const CatalogoCliente = () => <div className="p-6"><h1 className="text-2xl font-bold">Catálogo</h1><p className="mt-4 text-gray-600">Productos disponibles.</p></div>;
const HistorialServicios = () => <div className="p-6"><h1 className="text-2xl font-bold">Historial de Servicios</h1><p className="mt-4 text-gray-600">Servicios realizados.</p></div>;
const HistorialCompras = () => <div className="p-6"><h1 className="text-2xl font-bold">Historial de Compras</h1><p className="mt-4 text-gray-600">Tus compras realizadas.</p></div>;
const PerfilCliente = () => <div className="p-6"><h1 className="text-2xl font-bold">Mi Perfil</h1><p className="mt-4 text-gray-600">Configuración de tu cuenta.</p></div>;

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
        <Route path="admin/configuracion/usuarios" element={<ConfiguracionUsuarios />} />
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
        <Route path="groomer/agenda" element={<AgendaGroomer />} />
        <Route path="groomer/fichas/hoy" element={<FichasGroomerHoy />} />
        <Route path="groomer/fichas/todas" element={<FichasGroomerTodas />} />
        <Route path="groomer/perfil" element={<PerfilGroomer />} />

        {/* ===================================== */}
        {/* CLIENTE */}
        {/* ===================================== */}
        <Route path="cliente/dashboard" element={<DashboardCliente />} />
        <Route path="cliente/mis-mascotas" element={<MisMascotas />} />
        <Route path="cliente/mis-citas" element={<MisCitas />} />
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
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;