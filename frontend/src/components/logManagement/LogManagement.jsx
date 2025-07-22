// frontend/src/components/logManagement/LogManagement.jsx

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
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { getLogs, deleteLog, getUsers, getObjects } from '../../services/api';
import './log-management.css';

const LogManagement = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    username: '',
    objeto: '',
    action: '',
    from: '',
    to: ''
  });

  // Cargar usuarios y objetos al inicio
  useEffect(() => {
    (async () => {
      try {
        const [usersData, objectsData] = await Promise.all([
          getUsers(),
          getObjects()
        ]);
        setUsers(usersData);
        setObjects(objectsData);
      } catch (err) {
        setError('No se pudieron cargar usuarios u objetos');
      }
    })();
  }, []);

  // Obtener nombre de usuario por ID
  const getUserNameById = (id) => {
    const user = users.find(u => u.atr_id_usuario === id || u.id === id);
    return user ? user.atr_nombre_usuario : '-';
  };

  // Obtener nombre de rol por ID de rol
  const getRoleNameById = (roleId) => {
    const user = users.find(u => u.atr_id_rol === roleId);
    return user && user.roleName ? user.roleName : '';
  };

  // Obtener nombre de objeto por ID
  const getObjectNameById = (id) => {
    const obj = objects.find(o => o.atr_id_objetos === id || o.id === id);
    return obj ? obj.atr_objeto : '-';
  };

  // Mapea los logs para mostrar nombres en vez de IDs
  const mapLogs = (rawLogs) => {
    return rawLogs.map(log => ({
      ID_BITACORA: log.id || log.ID_BITACORA,
      USUARIO: getUserNameById(log.idUsuario || log.usuario),
      ROL: (() => {
        const user = users.find(u => u.atr_id_usuario === (log.idUsuario || log.usuario));
        return user && user.roleName ? user.roleName : user && user.atr_id_rol ? user.atr_id_rol : '-';
      })(),
      OBJETO: getObjectNameById(log.idObjeto || log.objeto),
      ACCION: log.accion || log.ACCION || '-',
      DESCRIPCION: log.descripcion || log.DESCRIPCION || '-',
      FECHA: log.fecha || log.FECHA || '-'
    }));
  };

  // Filtra por nombre de usuario, objeto, acción y fechas
  const applyFilters = (logs) => {
    return logs.filter(log => {
      // Filtro por usuario (nombre)
      if (filters.username && log.USUARIO && !log.USUARIO.toLowerCase().includes(filters.username.toLowerCase())) {
        return false;
      }
      // Filtro por objeto (nombre)
      if (filters.objeto && log.OBJETO && !log.OBJETO.toLowerCase().includes(filters.objeto.toLowerCase())) {
        return false;
      }
      // Filtro por acción
      if (filters.action && log.ACCION && !log.ACCION.toLowerCase().includes(filters.action.toLowerCase())) {
        return false;
      }
      // Filtro por fechas (corrige timezones)
      if (filters.from) {
        const logDate = new Date(log.FECHA);
        const fromDate = new Date(filters.from + 'T00:00:00');
        if (logDate < fromDate) return false;
      }
      if (filters.to) {
        const logDate = new Date(log.FECHA);
        const toDate = new Date(filters.to + 'T23:59:59');
        if (logDate > toDate) return false;
      }
      return true;
    });
  };

  // Traer logs y hacer el mapeo
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getLogs();
      const mapped = mapLogs(response.data || response);
      setLogs(mapped);
    } catch (err) {
      setError('No fue posible cargar la bitácora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo carga logs cuando ya tienes usuarios y objetos
    if (users.length && objects.length) fetchData();
  }, [users, objects]);

  const handleChange = (field) => (e) => {
    setFilters(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFilter = () => {
    setLogs(prev => applyFilters(prev));
  };

  const handleClear = () => {
    setFilters({ username: '', objeto: '', action: '', from: '', to: '' });
    fetchData();
  };

  const handleDeleteLog = async (id) => {
    setDeleting(true);
    setError('');
    try {
      await deleteLog(id);
      fetchData();
    } catch (err) {
      setError('No fue posible eliminar el registro de bitácora');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="log-management" sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Bitácora
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Usuario"
            value={filters.username}
            onChange={handleChange('username')}
            size="small"
          />
          <TextField
            label="Objeto"
            value={filters.objeto}
            onChange={handleChange('objeto')}
            size="small"
          />
          <TextField
            label="Acción"
            value={filters.action}
            onChange={handleChange('action')}
            size="small"
          />
          <TextField
            label="Desde"
            type="date"
            value={filters.from}
            onChange={handleChange('from')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Hasta"
            type="date"
            value={filters.to}
            onChange={handleChange('to')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="contained" onClick={handleFilter}>
            Filtrar
          </Button>
          <Button variant="outlined" onClick={handleClear}>
            Limpiar
          </Button>
        </Stack>
      </Paper>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Objeto</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No hay registros que mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log.ID_BITACORA} hover>
                    <TableCell>{log.ID_BITACORA}</TableCell>
                    <TableCell>{log.USUARIO}</TableCell>
                    <TableCell>{log.ROL}</TableCell>
                    <TableCell>{log.OBJETO}</TableCell>
                    <TableCell>{log.ACCION}</TableCell>
                    <TableCell>{log.DESCRIPCION}</TableCell>
                    <TableCell>
                      {log.FECHA !== '-'
                        ? new Date(log.FECHA).toLocaleDateString('es-HN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        disabled={deleting}
                        onClick={() => handleDeleteLog(log.ID_BITACORA)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default LogManagement;
