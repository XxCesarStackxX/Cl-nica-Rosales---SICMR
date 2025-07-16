// frontend/src/pages/SecurityParameters.jsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Paper
} from '@mui/material';

const SecurityParameters = () => {
  const [params, setParams] = useState({
    vigenciaHoras: 24,
    intentosMax: 5,
    lockoutMinutos: 15
  });

  const handleChange = (field) => (evt) => {
    const value = evt.target.value === '' ? '' : Number(evt.target.value);
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    // Enviar `params` al backend
    console.log('Guardar parámetros:', params);
    // TODO: llamada a API para guardar parámetros
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Parámetros de Seguridad
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Vigencia de sesión (horas)"
                value={params.vigenciaHoras}
                onChange={handleChange('vigenciaHoras')}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Intentos válidos"
                value={params.intentosMax}
                onChange={handleChange('intentosMax')}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Bloqueo tras (minutos)"
                value={params.lockoutMinutos}
                onChange={handleChange('lockoutMinutos')}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained">
                Guardar Cambios
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default SecurityParameters;
