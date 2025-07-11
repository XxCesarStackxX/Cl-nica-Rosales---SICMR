// frontend/src/App.js
import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

import AuthForm from './components/auth/LoginForm';
import SignUp from './components/signup/SignUpForm';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ChangePassword from './components/auth/ChangePassword';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import EmailVerification from './components/twoFactor/Verify2FA';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import Setup2FA from './components/twoFactor/Setup2FA';


// Configuración global de axios
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/auth';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.atr_id_rol !== requiredRole) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

// Componente para redirigir según el estado de autenticación
const AuthRedirectHandler = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to={user.atr_id_rol === 1 ? '/admin' : '/dashboard'} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<AuthForm />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protegidas: SidebarMenu */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* /dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* /admin */}
            <Route
              path="admin/*"
              element={
                <ProtectedRoute requiredRole={1}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* perfil, otras rutas hijas… */}
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Recuperación y cambio de contraseña */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route path="/setup-2fa" element={<ProtectedRoute><Setup2FA /></ProtectedRoute>} />

          {/* Verificación de email */}
          <Route path="/verify-email" element={<EmailVerification />} />

          {/* Redirección tras login */}
          <Route path="/auth-redirect" element={<AuthRedirectHandler />} />

          {/* Página 404 */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
