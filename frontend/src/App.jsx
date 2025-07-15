// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/main.css'; // Estilos globales
import EmailVerifiedPage from './pages/EmailVerifiedPage';

// Contexto de autenticación
import { AuthProvider } from './context/AuthContext';

// Páginas y componentes
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard.jsx'
import AdminPage from './pages/AdminDashboard.jsx'
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import Setup2FAPage from './pages/Setup2FAPage';
import Layout from './components/Layout.jsx'

function App() {
  return (
    // useAuth() encuentre siempre el contexto
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<EmailVerifiedPage />} />

          <Route
              path="/setup-2fa"
                element={
              <ProtectedRoute>
                <Setup2FAPage />
            </ProtectedRoute>
            }
          />

        {/* Rutas protegidas bajo Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* GET /  → redirect a dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard para todos los usuarios */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Panel de admin sólo para rol 1 */}
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={[1]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Aquí puedes añadir rutas hijas: citas, médicos, pacientes… */}
        </Route>

          {/* Ruta de acceso denegado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* añadir más rutas */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
