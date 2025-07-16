// frontend/src/pages/SecurityAccessConfig.jsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack
} from '@mui/material';

// Datos simulados
const objetos = [
  { id: 1, name: 'Citas' },
  { id: 2, name: 'Pacientes' },
  { id: 3, name: 'Historial' },
  { id: 4, name: 'Recetas' },
  { id: 5, name: 'Usuarios' }
];
const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Médico' },
  { id: 3, name: 'Asistente' }
];
// Inicializamos permisos false
const initPermisos = objetos.reduce((acc, obj) => {
  acc[obj.id] = roles.reduce((rAcc, rol) => {
    rAcc[rol.id] = { view: false, insert: false, update: false, delete: false };
    return rAcc;
  }, {});
  return acc;
}, {});

const SecurityAccessConfig = () => {
  const [selectedRole, setSelectedRole] = useState(1);
  const [permisos, setPermisos] = useState(initPermisos);

  const handleRoleChange = (evt) => {
    setSelectedRole(evt.target.value);
  };

  const togglePermiso = (objId, action) => {
    setPermisos((prev) => ({
      ...prev,
      [objId]: {
        ...prev[objId],
        [selectedRole]: {
          ...prev[objId][selectedRole],
          [action]: !prev[objId][selectedRole][action]
        }
      }
    }));
  };

  const handleSave = () => {
    // Enviar `permisos` al backend
    console.log('Guardando permisos:', permisos[selectedRole]);
    // TODO: llamada fetch/axios para guardar permisos
  };

  const handleCancel = () => {
    setPermisos(initPermisos);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configuración de Accesos
      </Typography>
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel id="rol-select-label">Rol</InputLabel>
        <Select
          labelId="rol-select-label"
          value={selectedRole}
          label="Rol"
          onChange={handleRoleChange}
        >
          {roles.map((rol) => (
            <MenuItem key={rol.id} value={rol.id}>
              {rol.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Objeto / Pantalla</TableCell>
              <TableCell align="center">Ver</TableCell>
              <TableCell align="center">Insertar</TableCell>
              <TableCell align="center">Actualizar</TableCell>
              <TableCell align="center">Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {objetos.map((obj) => (
              <TableRow key={obj.id} hover>
                <TableCell>{obj.name}</TableCell>
                {['view', 'insert', 'update', 'delete'].map((action) => (
                  <TableCell key={action} align="center">
                    <Checkbox
                      checked={permisos[obj.id][selectedRole][action]}
                      onChange={() => togglePermiso(obj.id, action)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
        <Button variant="outlined" onClick={handleCancel}>
          Cancelar
        </Button>
      </Stack>
    </Box>
  );
};

export default SecurityAccessConfig;
