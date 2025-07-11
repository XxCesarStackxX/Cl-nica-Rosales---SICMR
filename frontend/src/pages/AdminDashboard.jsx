// frontend/src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/userManagement/UserManager';
import PendingUsers from '../components/admin/PendingUsers';
import LogManagement from '../components/logManagement/LogManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('users'); // users | pending | logs

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Panel de Administración</h1>
      </div>

      <p>
        Bienvenido, {user?.atr_nombre_usuario || user?.atr_usuario} (Rol: {user?.atr_id_rol})
      </p>

      <div className="mb-3">
        <button
          onClick={() => setView('users')}
          className={`btn me-2 ${view === 'users' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          Gestión de Usuarios
        </button>
        <button
          onClick={() => setView('pending')}
          className={`btn me-2 ${view === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          Usuarios Pendientes
        </button>
        <button
          onClick={() => setView('logs')}
          className={`btn ${view === 'logs' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          Gestión de Bitácora
        </button>
      </div>

      <div>
        {view === 'users' && <UserManagement />}
        {view === 'pending' && <PendingUsers />}
        {view === 'logs' && <LogManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
