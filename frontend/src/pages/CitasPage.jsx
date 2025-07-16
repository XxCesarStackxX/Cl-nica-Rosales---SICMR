// frontend/src/pages/CitasPage.jsx

import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Box
} from '@mui/material';

const dummyCitas = [
  { id: 1, fecha: '2025-07-20 09:00', paciente: 'Juan Pérez', medico: 'Dra. Gómez', estado: 'Confirmada' },
  { id: 2, fecha: '2025-07-20 10:30', paciente: 'María López', medico: 'Dr. Ruiz', estado: 'Pendiente' },
  { id: 3, fecha: '2025-07-21 08:00', paciente: 'Carlos Sánchez', medico: 'Dra. Díaz', estado: 'Cancelada' }
];

const CitasPage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>
      Citas
    </Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Fecha y Hora</TableCell>
            <TableCell>Paciente</TableCell>
            <TableCell>Médico</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dummyCitas.map((cita) => (
            <TableRow key={cita.id}>
              <TableCell>{cita.id}</TableCell>
              <TableCell>{cita.fecha}</TableCell>
              <TableCell>{cita.paciente}</TableCell>
              <TableCell>{cita.medico}</TableCell>
              <TableCell>{cita.estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default CitasPage;
