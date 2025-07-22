// frontend/src/pages/RolesPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from '../services/api';

const statusOptions = ['ACTIVO', 'INACTIVO'];

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({
    id: null,
    name: '',
    description: '',
    status: 'ACTIVO'
  });
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getRoles();
      setRoles(Array.isArray(response) ? response : response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpen = (role = null) => {
    setError('');
    setCurrentRole(
      role
        ? {
            id: role.atr_id_rol,
            name: role.atr_nombre_rol,
            description: role.atr_descripcion,
            status: role.atr_estado_rol
          }
        : { id: null, name: '', description: '', status: 'ACTIVO' }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (field) => (e) => {
    setCurrentRole((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const payload = {
      name: currentRole.name,
      description: currentRole.description,
      status: currentRole.status
    };

    try {
      if (currentRole.id) {
        await updateRole(currentRole.id, payload);
      } else {
        await createRole(payload);
      }

      await fetchRoles();
      setOpen(false);
    } catch (err) {
      console.error('Error saving role:', err);
      setError('Error al guardar el rol');
    } finally {
      setSaving(false);
    }
  };

const handleDelete = async (role) => {
  if (role.atr_estado_rol !== 'INACTIVO') {
    if (!window.confirm('¿Seguro que quieres inactivar este rol? Los usuarios con este rol seguirán existiendo, pero el rol quedará inactivo.')) return;
  } else {
    if (!window.confirm('El rol ya está inactivo. ¿Seguro que quieres eliminarlo PERMANENTEMENTE? Esta acción no se puede deshacer y solo es posible si no tiene relaciones activas.')) return;
  }
  setSaving(true);
  setError('');
  try {
    await deleteRole(role.atr_id_rol);
    await fetchRoles();
  } catch (err) {
    let msg = 'Error al eliminar el rol';
    if (err?.response?.data?.error) {
      msg = err.response.data.error;
    }
    setError(msg);
  } finally {
    setSaving(false);
  }
};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Roles
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen(null)}>
          Crear Rol
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado por</TableCell>
                <TableCell>Fecha creación</TableCell>
                <TableCell>Modificado por</TableCell>
                <TableCell>Fecha modificación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => {
                const createdAt = role.atr_fecha_creacion
                  ? new Date(role.atr_fecha_creacion).toLocaleString()
                  : '-';
                const updatedAt = role.atr_fecha_modificacion
                  ? new Date(role.atr_fecha_modificacion).toLocaleString()
                  : '-';

                return (
                  <TableRow key={role.atr_id_rol} hover>
                    <TableCell>{role.atr_id_rol}</TableCell>
                    <TableCell>{role.atr_nombre_rol}</TableCell>
                    <TableCell>{role.atr_descripcion || '-'}</TableCell>
                    <TableCell>{role.atr_estado_rol}</TableCell>
                    <TableCell>{role.atr_creado_por || '-'}</TableCell>
                    <TableCell>{createdAt}</TableCell>
                    <TableCell>{role.atr_modificado_por || '-'}</TableCell>
                    <TableCell>{updatedAt}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleOpen(role)}>
                        Editar
                      </Button>
                      {role.atr_estado_rol === 'ACTIVO' && (
                        <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(role)}>
                          Inactivar
                        </Button>
                      )}
                      {role.atr_estado_rol === 'INACTIVO' && (
                        <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(role)}>
                          Eliminar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{currentRole.id ? 'Editar Rol' : 'Crear Rol'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Rol"
              value={currentRole.name}
              onChange={handleChange('name')}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              minRows={2}
              value={currentRole.description}
              onChange={handleChange('description')}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                value={currentRole.status}
                label="Estado"
                onChange={handleChange('status')}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesPage;
