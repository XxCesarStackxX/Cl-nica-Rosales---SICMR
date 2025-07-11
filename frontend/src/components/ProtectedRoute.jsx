// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mientras carga las credenciales mostramos un spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Si NO está autenticado (boolean), redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles y el usuario NO tiene ninguno de ellos, Forbidden
  if (roles.length > 0 && !roles.includes(user?.atr_id_rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // En caso contrario, renderizamos los hijos (ruta protegida)
  return <>{children}</>;
};

export default ProtectedRoute;
