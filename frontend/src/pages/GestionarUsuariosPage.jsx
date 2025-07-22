// frontend/src/pages/GestionarUsuariosPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { getUsers, getRoles, updateUser, updateUserRole, deleteUser, createUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GestionarUsuariosPage = () => {
  const { user: loggedUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [newUser, setNewUser] = useState({
    atr_usuario: '',
    atr_nombre_usuario: '',
    atr_correo_electronico: '',
    atr_id_rol: '',
    atr_estado_usuario: 'ACTIVO',
    atr_contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Cargar usuarios y roles
  useEffect(() => {
    fetchAll();
  }, []);

  const navigate = useNavigate();

  const handleCrearUsuario = () => {
    navigate('/registrar-usuario'); // ruta a la página de registro
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const usersRes = await getUsers();
      const rolesRes = await getRoles();
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
      setRoles(Array.isArray(rolesRes) ? rolesRes : rolesRes?.data || []);
    } catch {
      setAlert({ open: true, message: 'Error cargando datos', severity: 'error' });
    }
    setLoading(false);
  };

  // Filtro de búsqueda
  const filteredUsers = users.filter(
    (u) =>
      u.atr_usuario?.toLowerCase().includes(search.toLowerCase()) ||
      u.atr_correo_electronico?.toLowerCase().includes(search.toLowerCase())
  );

  // Cambiar rol
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setAlert({ open: true, message: 'Rol actualizado', severity: 'success' });
      fetchAll();
    } catch {
      setAlert({ open: true, message: 'Error actualizando rol', severity: 'error' });
    }
  };

  // Editar usuario
  const handleEdit = (user) => {
    setEditUser({ ...user });
    setOpenEdit(true);
  };

  // Guardar cambios en edición
  const handleEditSave = async () => {
    // Validación: el usuario debe tener un rol seleccionado
    if (!editUser.atr_id_rol) {
      setAlert({ open: true, message: 'Selecciona un rol para el usuario.', severity: 'warning' });
      return;
    }
    try {
      await updateUser(editUser.atr_id_usuario, editUser);
      setOpenEdit(false);
      setAlert({ open: true, message: 'Usuario actualizado', severity: 'success' });
      fetchAll();
    } catch {
      setAlert({ open: true, message: 'Error actualizando usuario', severity: 'error' });
    }
  };

// Eliminar o inactivar usuario
const handleDelete = async (user) => {
  if (user.atr_estado_usuario !== 'INACTIVO') {
    if (!window.confirm('¿Seguro que quieres inactivar este usuario? Ya no podrá iniciar sesión, pero su información se conservará.')) return;
  } else {
    if (!window.confirm('El usuario ya está inactivo. ¿Seguro que quieres eliminarlo PERMANENTEMENTE? Esta acción no se puede deshacer y solo es posible si no tiene relaciones activas.')) return;
  }
  try {
    await deleteUser(user.atr_id_usuario);
    setAlert({ open: true, message: user.atr_estado_usuario !== 'INACTIVO' ? 'Usuario inactivado' : 'Usuario eliminado físicamente', severity: 'success' });
    fetchAll();
  } catch (error) {
    let msg = 'Error eliminando usuario';
    // Si el backend manda un mensaje claro, úsalo
    if (error?.response?.data?.error) {
      msg = error.response.data.error;
    }
    setAlert({ open: true, message: msg, severity: 'error' });
  }
};

  // Crear usuario
  const handleCreateUser = async () => {
    if (!newUser.atr_usuario || !newUser.atr_correo_electronico || !newUser.atr_id_rol || !newUser.atr_contrasena) {
      setAlert({ open: true, message: 'Completa todos los campos', severity: 'warning' });
      return;
    }
    try {
      await createUser(newUser);
      setOpenCreate(false);
      setAlert({ open: true, message: 'Usuario creado correctamente', severity: 'success' });
      setNewUser({
        atr_usuario: '',
        atr_nombre_usuario: '',
        atr_correo_electronico: '',
        atr_id_rol: '',
        atr_estado_usuario: 'ACTIVO',
        atr_contrasena: ''
      });
      fetchAll();
    } catch (err) {
      setAlert({ open: true, message: 'Error creando usuario', severity: 'error' });
    }
  };

  // ---- RENDER ----
  return (
    <Paper sx={{ padding: 3, mt: 2, borderRadius: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ color: '#b6506b' }}>Gestión CRUD de Usuarios</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
          sx={{ background: 'linear-gradient(90deg, #e999ba, #c8a2c8)' }}
        >
          Crear Usuario
        </Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <SearchIcon sx={{ color: '#e999ba', mr: 1 }} />
        <TextField
          size="small"
          label="Buscar usuario o email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 260 }}
        />
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f7cac9' }}>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.atr_id_usuario}>
                <TableCell>{user.atr_id_usuario}</TableCell>
                <TableCell>{user.atr_usuario}</TableCell>
                <TableCell>{user.atr_nombre_usuario}</TableCell>
                <TableCell>{user.atr_correo_electronico}</TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={user.atr_id_rol}
                      label="Rol"
                      onChange={e => handleRoleChange(user.atr_id_usuario, e.target.value)}
                      sx={{
                        bgcolor: '#fff',
                        borderRadius: 1,
                        fontWeight: 500
                      }}
                    >
                      {roles.map(rol => (
                        <MenuItem key={rol.atr_id_rol} value={rol.atr_id_rol}>
                          {rol.atr_nombre_rol}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{user.atr_estado_usuario}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  {(user.atr_estado_usuario === 'INACTIVO' || user.atr_estado_usuario === 'ACTIVO' || user.atr_estado_usuario === 'BLOQUEADO') && (
                    <IconButton color="error" onClick={() => handleDelete(user)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay usuarios</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal editar usuario */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Usuario"
            value={editUser?.atr_usuario || ''}
            onChange={e => setEditUser({ ...editUser, atr_usuario: e.target.value })}
            fullWidth
            disabled
          />
          <TextField
            margin="dense"
            label="Nombre"
            value={editUser?.atr_nombre_usuario || ''}
            onChange={e => setEditUser({ ...editUser, atr_nombre_usuario: e.target.value })}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            value={editUser?.atr_correo_electronico || ''}
            onChange={e => setEditUser({ ...editUser, atr_correo_electronico: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Rol</InputLabel>
            <Select
              value={editUser?.atr_id_rol || ''}
              label="Rol"
              onChange={e => setEditUser({ ...editUser, atr_id_rol: e.target.value })}
            >
              {roles.map(rol => (
                <MenuItem key={rol.atr_id_rol} value={rol.atr_id_rol}>{rol.atr_nombre_rol}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Estado</InputLabel>
            <Select
              value={editUser?.atr_estado_usuario || ''}
              label="Estado"
              onChange={e => setEditUser({ ...editUser, atr_estado_usuario: e.target.value })}
            >
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="BLOQUEADO">Bloqueado</MenuItem>
              <MenuItem value="INACTIVO">Inactivo</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button variant="contained" sx={{ bgcolor: '#e999ba' }} onClick={handleEditSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal crear usuario */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Crear Usuario</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Usuario"
            value={newUser.atr_usuario}
            onChange={e => setNewUser({ ...newUser, atr_usuario: e.target.value })}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Nombre"
            value={newUser.atr_nombre_usuario}
            onChange={e => setNewUser({ ...newUser, atr_nombre_usuario: e.target.value })}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            value={newUser.atr_correo_electronico}
            onChange={e => setNewUser({ ...newUser, atr_correo_electronico: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Rol</InputLabel>
            <Select
              value={newUser.atr_id_rol}
              label="Rol"
              onChange={e => setNewUser({ ...newUser, atr_id_rol: e.target.value })}
            >
              {roles.map(rol => (
                <MenuItem key={rol.atr_id_rol} value={rol.atr_id_rol}>{rol.atr_nombre_rol}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Estado</InputLabel>
            <Select
              value={newUser.atr_estado_usuario}
              label="Estado"
              onChange={e => setNewUser({ ...newUser, atr_estado_usuario: e.target.value })}
            >
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="BLOQUEADO">Bloqueado</MenuItem>
              <MenuItem value="INACTIVO">Inactivo</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Contraseña"
            type="password"
            value={newUser.atr_contrasena}
            onChange={e => setNewUser({ ...newUser, atr_contrasena: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" sx={{ bgcolor: '#e999ba' }} onClick={handleCreateUser}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alertas */}
      <Snackbar
        open={alert.open}
        autoHideDuration={2700}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default GestionarUsuariosPage;
