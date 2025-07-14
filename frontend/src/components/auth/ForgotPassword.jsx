// frontend/src/components/auth/ForgotPassword.jsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Correo electrónico requerido' });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim()
      });
      setStatus({ type: 'success', message: data.message });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Error del servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#fff0f5"
      px={2}
    >
      <Paper elevation={4} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography
          variant="h5"
          align="center"
          fontWeight="bold"
          sx={{ color: '#db7093' }}
        >
          Estética Rosales
        </Typography>
        <Typography
          variant="subtitle2"
          align="center"
          mb={2}
          sx={{ color: '#6a11cb' }}
        >
          Medicina y Podología
        </Typography>

        <Typography variant="h6" align="center" fontWeight={600} gutterBottom>
          Recuperar contraseña
        </Typography>

        <Typography variant="body2" align="center" mb={2} color="text.secondary">
          Ingrese su correo para recibir instrucciones
        </Typography>

        {status && (
          <Alert severity={status.type} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              mt: 2,
              background: '#ff69b4',
              '&:hover': { background: '#db7093' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar instrucciones'}
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{
              mt: 1,
              color: '#6a11cb',
              fontWeight: 500,
              textTransform: 'uppercase'
            }}
            onClick={() => navigate('/login')}
          >
            Volver al login
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

