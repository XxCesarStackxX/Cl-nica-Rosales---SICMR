// frontend/src/services/api.js

import axios from 'axios';

// Construye la URL base del API garantizando siempre el prefijo '/api'.
// - Si defines REACT_APP_API_BASE_URL (p.ej. 'http://localhost:5000'), añadimos '/api' al final.
// - Si no, usamos '/api' para aprovechar el proxy de CRA o rutas relativas.
const rawBase = process.env.REACT_APP_API_BASE_URL || '';
const baseURL = rawBase
  ? `${rawBase.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inyecta el token JWT en cada petición si existe en localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


/**
 * Roles
 */
// Listar todos los roles
export const getRoles = () => api.get('/admin/roles');

// Crear un nuevo rol
// payload debe tener { name, description, status }
export const createRole = (payload) => api.post('/admin/roles', payload);

// Actualizar un rol existente
// id: número, payload igual que en createRole
export const updateRole = (id, payload) =>
  api.put(`/admin/roles/${id}`, payload);

// Eliminar un rol
export const deleteRole = (id) => api.delete(`/admin/roles/${id}`);

export default api;
