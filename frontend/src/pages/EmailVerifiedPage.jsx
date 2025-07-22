// frontend/src/pages/EmailVerifiedPage.jsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function EmailVerifiedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const success = queryParams.get('success') === 'true';
  const error = queryParams.get('error');

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#fff0f5"
      px={2}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%', textAlign: 'center' }}>
        {success ? (
          <>
            <CheckCircleIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#db7093' }}>
              ✔ CORREO VERIFICADO CON EXITO ✔
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ya puedes iniciar sesión con tu cuenta.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ background: '#ff69b4', '&:hover': { background: '#db7093' } }}
            >
              Ir al Login
            </Button>
          </>
        ) : (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#c62828' }}>
              Error al verificar el correo
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error ? decodeURIComponent(error) : 'El enlace es inválido o ha expirado.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ background: '#f44336', '&:hover': { background: '#c62828' } }}
            >
              Volver al Login
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default EmailVerifiedPage;
