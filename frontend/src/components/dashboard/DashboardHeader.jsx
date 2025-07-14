// frontend/src/components/dashboard/DashboardHeader.jsx

import React, { useEffect, useState } from 'react';
import './dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  return (
    <div>
      <header className="dashboard-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
        <div className="welcome-section">
          <h2 className="mb-1">
            Bienvenido, {user?.name || user?.username || 'Usuario'}
          </h2>
          <small className="text-muted">
            Panel de control - {new Date().toLocaleDateString()}
          </small>
        </div>
        {/* Botones eliminados */}
      </header>

      {/* Aquí puedes seguir agregando el resto del contenido del dashboard */}
    </div>
  );
};

export default Dashboard;
