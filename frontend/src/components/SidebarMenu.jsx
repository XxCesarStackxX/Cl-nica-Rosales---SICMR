// frontend/src/components/SidebarMenu.jsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Avatar,
  Typography,
  Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HealingIcon from '@mui/icons-material/Healing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HomeIcon from '@mui/icons-material/Home';

const drawerWidth = 260;

const SidebarMenu = () => {
  const { logout, user: fullUser, hasPermission } = useAuth();
  const username = fullUser?.atr_usuario || 'Usuario';
  const userRole = fullUser?.rol || fullUser?.atr_nombre_rol || ''; // Asegúrate de cómo recibes el rol, usa el campo correcto.
  const { pathname } = useLocation();
  const [openUsers, setOpenUsers] = React.useState(false);
  const [openConfig, setOpenConfig] = React.useState(false);

  const toggleUsers = () => setOpenUsers((prev) => !prev);
  const toggleConfig = () => setOpenConfig((prev) => !prev);

  // Menú principal: módulos de operación diaria
  const menuItems = [
    // Ítem "Inicio" solo para el rol Usuario
    hasPermission('Inicio', 'CONSULTAR') && {
      text: 'Inicio',
      to: '/dashboard',
      icon: <HomeIcon />
    },
    hasPermission('Citas', 'CONSULTAR') && {
      text: 'Citas',
      to: '/citas',
      icon: <CalendarTodayIcon />
    },
    hasPermission('Pacientes', 'CONSULTAR') && {
      text: 'Pacientes',
      to: '/pacientes',
      icon: <PeopleIcon />
    },
    hasPermission('Historial', 'CONSULTAR') && {
      text: 'Historial',
      to: '/historial',
      icon: <AssignmentIcon />
    },
    hasPermission('Examenes', 'CONSULTAR') && {
      text: 'Examenes',
      to: '/examenes',
      icon: <MedicalServicesIcon />
    },
    hasPermission('Recetas', 'CONSULTAR') && {
      text: 'Recetas',
      to: '/recetas',
      icon: <HealingIcon />
    },
    hasPermission('Tratamientos', 'CONSULTAR') && {
      text: 'Tratamientos',
      to: '/tratamientos',
      icon: <HealingIcon />
    },
    hasPermission('Reportes', 'CONSULTAR') && {
      text: 'Reportes',
      to: '/reportes',
      icon: <AssignmentIcon />
    }
  ].filter(Boolean);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
        <Avatar src="/logo192.png" alt="Logo" sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>
          Centro Médico
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
            {username.charAt(0)}
          </Avatar>
          <Typography variant="subtitle1" noWrap>
            {username}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" fullWidth sx={{ mt: 2 }} onClick={logout}>
          Cerrar sesión
        </Button>
      </Box>
      <Divider />

      {/* Menú principal */}
      <List>
        {menuItems.map(({ text, to, icon }) => (
          <ListItemButton
            key={text}
            component={NavLink}
            to={to}
            selected={pathname === to}
            sx={{ mb: 0.5 }}
          >
            <ListItemIcon sx={{ color: pathname === to ? 'primary.main' : 'text.secondary' }}>
              {icon}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}

        {/* Menú de administración: Usuarios, Roles, Objetos, Permisos */}
        {(hasPermission('Usuarios', 'CONSULTAR') ||
          hasPermission('Roles', 'CONSULTAR') ||
          hasPermission('Objetos', 'CONSULTAR') ||
          hasPermission('Permisos', 'CONSULTAR')) && (
          <>
            <ListItemButton onClick={toggleUsers} sx={{ mb: 0.5 }}>
              <ListItemIcon sx={{ color: openUsers ? 'primary.main' : 'text.secondary' }}>
                <MenuIcon />
              </ListItemIcon>
              <ListItemText primary="Administración" />
              {openUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={openUsers} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* PANEL DE ADMINISTRACIÓN */}
                <ListItemButton
                  component={NavLink}
                  to="/admin-dashboard"
                  selected={pathname === '/admin-dashboard'}
                  sx={{ pl: 4, mb: 0.5 }}
                >
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Panel de Administración" />
                </ListItemButton>

                {/* GESTIONAR USUARIOS */}
                {hasPermission('Usuarios', 'CONSULTAR') && (
                  <ListItemButton
                    component={NavLink}
                    to="/gestionar-usuario"
                    selected={pathname === '/gestionar-usuario'}
                    sx={{ pl: 4, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Gestionar Usuarios" />
                  </ListItemButton>
                )}

                {/* REGISTRAR USUARIO */}
                {hasPermission('Usuarios', 'INSERTAR') && (
                  <ListItemButton
                    component={NavLink}
                    to="/registrar-usuario"
                    selected={pathname === '/registrar-usuario'}
                    sx={{ pl: 4, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <PersonAddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Registrar Usuario" />
                  </ListItemButton>
                )}

                {/* ROLES */}
                {hasPermission('Roles', 'CONSULTAR') && (
                  <ListItemButton
                    component={NavLink}
                    to="/roles"
                    selected={pathname === '/roles'}
                    sx={{ pl: 4, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <AdminPanelSettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Roles" />
                  </ListItemButton>
                )}

                {/* OBJETOS */}
                {hasPermission('Objetos', 'CONSULTAR') && (
                  <ListItemButton
                    component={NavLink}
                    to="/objects"
                    selected={pathname === '/objects'}
                    sx={{ pl: 4, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Objetos" />
                  </ListItemButton>
                )}

                {/* PERMISOS */}
                {hasPermission('Permisos', 'CONSULTAR') && (
                  <ListItemButton
                    component={NavLink}
                    to="/admin/permisos"
                    selected={pathname === '/admin/permisos'}
                    sx={{ pl: 4, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <AdminPanelSettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Permisos" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          </>
        )}

        {/* Configuración/Bitácora */}
        {(hasPermission('Bitacora', 'CONSULTAR') ||
          hasPermission('Parametro Seguridad', 'CONSULTAR')) && (
          <>
            <ListItemButton onClick={toggleConfig} sx={{ mb: 0.5 }}>
              <ListItemIcon sx={{ color: openConfig ? 'primary.main' : 'text.secondary' }}>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Configuración" />
              {openConfig ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={openConfig} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {hasPermission('Bitacora', 'CONSULTAR') && (
                  <ListItemButton
                    component={NavLink}
                    to="/bitacora"
                    selected={pathname === '/bitacora'}
                    sx={{ pl: 4, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Bitácora" />
                  </ListItemButton>
                )}
                {hasPermission('Parametro Seguridad', 'CONSULTAR') && (
                  <ListItemButton
                    component={NavLink}
                    to="/parametros-seguridad"
                    selected={pathname === '/parametros-seguridad'}
                    sx={{ pl: 4, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Parámetros Seguridad" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Drawer>
  );
};

export default SidebarMenu;
