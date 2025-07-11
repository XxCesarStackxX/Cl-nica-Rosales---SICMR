// frontend/src/components/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarMenu from './SidebarMenu';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="layout-root">
      <SidebarMenu user={user?.atr_nombre_usuario || user?.atr_usuario} />
      <div className="layout-main">
        <section className="layout-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
