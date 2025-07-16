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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const drawerWidth = 260;

const SidebarMenu = ({ user }) => {
  const { logout, user: fullUser } = useAuth();
  const isAdmin = fullUser?.atr_id_rol === 1;
  const { pathname } = useLocation();
  const [openUsers, setOpenUsers] = React.useState(false);
  const [openConfig, setOpenConfig] = React.useState(false);

  const toggleUsers = () => setOpenUsers(prev => !prev);
  const toggleConfig = () => setOpenConfig(prev => !prev);

  // Menú principal: Citas siempre primero, sin ítem "Inicio" para admin
  const menuItems = [
    { text: 'Citas', to: '/citas', icon: <CalendarTodayIcon /> },
    { text: 'Pacientes', to: '/pacientes', icon: <PeopleIcon /> },
    { text: 'Historial', to: '/historial', icon: <AssignmentIcon /> },
    { text: 'Exámenes', to: '/examenes', icon: <MedicalServicesIcon /> },
    { text: 'Recetas', to: '/recetas', icon: <HealingIcon /> },
    { text: 'Tratamientos', to: '/tratamientos', icon: <HealingIcon /> },
    { text: 'Calendario', to: '/calendario', icon: <CalendarTodayIcon /> },
    { text: 'Reportes', to: '/reportes', icon: <AssignmentIcon /> }
  ];

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
            {user.charAt(0)}
          </Avatar>
          <Typography variant="subtitle1" noWrap>
            {user}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" fullWidth sx={{ mt: 2 }} onClick={logout}>
          Cerrar sesión
        </Button>
      </Box>
      <Divider />

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

        {isAdmin && (
          <>
            <ListItemButton onClick={toggleUsers} sx={{ mb: 0.5 }}>
              <ListItemIcon sx={{ color: openUsers ? 'primary.main' : 'text.secondary' }}>
                <MenuIcon />
              </ListItemIcon>
              <ListItemText primary="Usuarios" />
              {openUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={openUsers} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  component={NavLink}
                  to="/admin"
                  selected={pathname === '/admin'}
                  sx={{ pl: 4, mb: 0.5 }}
                >
                  <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                  <ListItemText primary="Panel de Administración" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/registrar-usuario"
                  selected={pathname === '/registrar-usuario'}
                  sx={{ pl: 4, mb: 0.5 }}
                >
                  <ListItemIcon><PersonAddIcon /></ListItemIcon>
                  <ListItemText primary="Registrar Usuario" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/gestionar-usuario"
                  selected={pathname === '/gestionar-usuario'}
                  sx={{ pl: 4, mb: 0.5 }}
                >
                  <ListItemIcon><PeopleIcon /></ListItemIcon>
                  <ListItemText primary="Gestionar Usuarios" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/roles"
                  selected={pathname === '/roles'}
                  sx={{ pl: 4, mb: 0.5 }}
                >
                  <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                  <ListItemText primary="Roles" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/asignar-rol"
                  selected={pathname === '/asignar-rol'}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                  <ListItemText primary="Asignar Rol" />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        {isAdmin && (
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
                <ListItemButton
                  component={NavLink}
                  to="/bitacora"
                  selected={pathname === '/bitacora'}
                  sx={{ pl: 4, mb: 0.5 }}
                >
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Bitácora" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/parametros-seguridad"
                  selected={pathname === '/parametros-seguridad'}
                  sx={{ pl: 4, mb: 0.5 }}
                >
                  <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                  <ListItemText primary="Parámetros Seguridad" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/security/access"
                  selected={pathname === '/security/access'}
                  sx={{ pl: 4, mb: 0.5 }}
                >
                  <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                  <ListItemText primary="Accesos" />
                </ListItemButton>
                <ListItemButton
                  component={NavLink}
                  to="/parametros-sistema"
                  selected={pathname === '/parametros-sistema'}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                  <ListItemText primary="Parámetros Sistema" />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Drawer>
  );
};

export default SidebarMenu;
