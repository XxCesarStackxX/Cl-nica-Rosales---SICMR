// frontend/src/pages/ObjectsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, Alert
} from '@mui/material';
import {
  getObjects,
  createObject,
  updateObject,
  deleteObject
} from '../services/api';

const typeOptions = ['Pantalla', 'Proceso', 'Reporte', 'Otro'];

const ObjectsPage = () => {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentObj, setCurrentObj] = useState({
    id: null,
    name: '',
    description: '',
    type: 'Pantalla'
  });

  const fetchObjects = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await getObjects();
      setObjects(Array.isArray(resp) ? resp : resp.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar objetos');
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      fetchObjects();
    }, []);

  const openDialog = obj => {
    if (obj) {
      setCurrentObj({
        id: obj.atr_id_objetos,
        name: obj.atr_objeto,
        description: obj.atr_descripcion,
        type: obj.atr_tipo_objeto
      });
    } else {
      setCurrentObj({ id: null, name: '', description: '', type: 'Pantalla' });
    }
    setError('');
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleChange = field => e =>
    setCurrentObj(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const payload = {
      name: currentObj.name,
      description: currentObj.description,
      type: currentObj.type
    };
    try {
      if (currentObj.id) {
        await updateObject(currentObj.id, payload);
      } else {
        await createObject(payload);
      }
      await fetchObjects();
      closeDialog();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el objeto');
    } finally {
      setSaving(false);
    }
  };

const handleDelete = async obj => {
  if (obj.atr_estado_objeto !== 'INACTIVO') {
    if (!window.confirm('¿Seguro que quieres inactivar este objeto? Ya no podrá ser asignado ni usado, pero se conservará su información.')) return;
  } else {
    if (!window.confirm('El objeto ya está inactivo. ¿Seguro que quieres eliminarlo PERMANENTEMENTE? Esta acción no se puede deshacer y solo es posible si no tiene relaciones activas.')) return;
  }
  setSaving(true);
  setError('');
  try {
    await deleteObject(obj.atr_id_objetos);
    await fetchObjects();
  } catch (err) {
    let msg = 'Error al eliminar el objeto';
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
        Catálogo de Objetos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => openDialog(null)}>
          Crear Objeto
        </Button>
      </Stack>

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
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Creado por</TableCell>
                <TableCell>Fecha creación</TableCell>
                <TableCell>Modificado por</TableCell>
                <TableCell>Fecha modif.</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objects.map(obj => (
                <TableRow key={obj.atr_id_objetos} hover>
                  <TableCell>{obj.atr_id_objetos}</TableCell>
                  <TableCell>{obj.atr_objeto}</TableCell>
                  <TableCell>{obj.atr_descripcion}</TableCell>
                  <TableCell>{obj.atr_tipo_objeto}</TableCell>
                  <TableCell>{obj.atr_creado_por || '-'}</TableCell>
                  <TableCell>
                    {obj.atr_fecha_creacion
                      ? new Date(obj.atr_fecha_creacion).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>{obj.atr_modificado_por || '-'}</TableCell>
                  <TableCell>
                    {obj.atr_fecha_modificacion
                      ? new Date(obj.atr_fecha_modificacion).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openDialog(obj)}>
                      Editar
                    </Button>
                    {obj.atr_estado_objeto === 'ACTIVO' && (
                      <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(obj)}>
                        Inactivar
                      </Button>
                    )}
                    {obj.atr_estado_objeto === 'INACTIVO' && (
                      <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(obj)}>
                        Eliminar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth>
        <DialogTitle>
          {currentObj.id ? 'Editar Objeto' : 'Crear Objeto'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              fullWidth
              label="Nombre"
              value={currentObj.name}
              onChange={handleChange('name')}
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              minRows={2}
              value={currentObj.description}
              onChange={handleChange('description')}
            />
            <FormControl fullWidth>
              <InputLabel id="type-label">Tipo</InputLabel>
              <Select
                labelId="type-label"
                label="Tipo"
                value={currentObj.type}
                onChange={handleChange('type')}
              >
                {typeOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ObjectsPage;
