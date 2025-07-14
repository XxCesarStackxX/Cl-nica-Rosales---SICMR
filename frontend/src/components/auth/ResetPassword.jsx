// frontend/src/components/auth/ResetPassword.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado');
    }
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });
      setSuccess('¡Contraseña restablecida con éxito!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer contraseña');
    } finally {
      setIsSubmitting(false);
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
          Restablecer contraseña
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nueva contraseña"
              name="newPassword"
              fullWidth
              margin="normal"
              type={showPassword.new ? 'text' : 'password'}
              value={form.newPassword}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility('new')}
                      edge="end"
                      aria-label="Mostrar u ocultar contraseña"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Confirmar contraseña"
              name="confirmPassword"
              fullWidth
              margin="normal"
              type={showPassword.confirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility('confirm')}
                      edge="end"
                      aria-label="Mostrar u ocultar contraseña"
                    >
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 2,
                background: '#ff69b4',
                '&:hover': { background: '#db7093' }
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enviar'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}
