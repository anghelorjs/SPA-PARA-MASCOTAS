// src/pages/auth/Unauthorized.tsx
import { Link } from 'react-router-dom';

export const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-red-600">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
        <div>
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};