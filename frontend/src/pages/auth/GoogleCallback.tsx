import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        authService.handleGoogleCallback(token, user);
        
        // Redirigir según el rol
        const dashboardByRole: Record<string, string> = {
          administrador: '/admin/dashboard',
          recepcionista: '/recepcionista/dashboard',
          groomer: '/groomer/dashboard',
          cliente: '/cliente/dashboard',
        };
        
        navigate(dashboardByRole[user.rol] || '/');
      } catch (error) {
        console.error('Error al procesar callback de Google:', error);
        navigate('/login?error=google_callback_failed');
      }
    } else {
      const error = searchParams.get('error');
      if (error) {
        navigate(`/login?error=${error}`);
      } else {
        navigate('/login');
      }
    }
  }, [searchParams, navigate]);

  return <LoadingSpinner />;
};