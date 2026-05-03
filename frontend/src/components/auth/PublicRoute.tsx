// src/components/auth/PublicRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  redirectTo?: string;
}

export const PublicRoute = ({ redirectTo = '/' }: PublicRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    // Redirigir según el rol del usuario
    switch (user.rol) {
      case 'administrador':
        return <Navigate to="/admin/dashboard" replace />;
      case 'recepcionista':
        return <Navigate to="/recepcionista/dashboard" replace />;
      case 'groomer':
        return <Navigate to="/groomer/dashboard" replace />;
      case 'cliente':
        return <Navigate to="/cliente/dashboard" replace />;
      default:
        return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
};