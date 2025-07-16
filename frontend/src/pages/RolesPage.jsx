// frontend/src/pages/RolesPage.jsx

import React, { useState } from 'react';
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
  MenuItem
} from '@mui/material';

// Datos simulados iniciales
const initialRoles = [
  { id: 1, name: 'Admin', description: 'Acceso completo al sistema', status: 'Activo' },
  { id: 2, name: 'Médico', description: 'Gestión de pacientes y citas', status: 'Activo' },
  { id: 3, name: 'Asistente', description: 'Soporte y administración de agendas', status: 'Activo' }
];
const statusOptions = ['Activo', 'Inactivo'];

const RolesPage = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [open, setOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({ id: null, name: '', description: '', status: 'Activo' });

  const handleOpen = (role = null) => {
    setCurrentRole(
      role
        ? { ...role }
        : { id: null, name: '', description: '', status: 'Activo' }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setCurrentRole(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!currentRole.name.trim()) {
      return;
    }
    if (currentRole.id) {
      setRoles(prev => prev.map(r => r.id === currentRole.id ? currentRole : r));
    } else {
      const newId = roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1;
      setRoles(prev => [...prev, { ...currentRole, id: newId }]);
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Roles
      </Typography>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen(null)}>
          Crear Rol
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id} hover>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{role.status}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpen(role)}>
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(role.id)}
                    sx={{ ml: 1 }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
                {statusOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesPage;
