// frontend/src/services/api.js

import axios from 'axios';

// Construye la URL base del API garantizando siempre el prefijo '/api'.
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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

/**
 * Función utilitaria para obtener siempre un array, sin importar la forma del backend
 */
function unwrapArrayResponse(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return res;
}

/**
 * Roles
 */
// Listar todos los roles
export const getRoles = () =>
  api.get('/admin/roles').then(r => unwrapArrayResponse(r));

// Crear un nuevo rol
export const createRole = (payload) => api.post('/admin/roles', payload);

// Actualizar un rol existente
export const updateRole = (id, payload) =>
  api.put(`/admin/roles/${id}`, payload);

// Eliminar un rol
export const deleteRole = (id) => api.delete(`/admin/roles/${id}`);

/**
 * Bitácora
 */
// Obtener registros de bitácora con filtros opcionales
export const getLogs = (params) => api.get('/admin/logs', { params });

// Eliminar un registro de bitácora
export const deleteLog = (id) => api.delete(`/admin/logs/${id}`);

/**
 * Objetos
 */
// Listar todos los objetos
export const getObjects = () =>
  api.get('/admin/objects').then(r => unwrapArrayResponse(r));

// Crear un nuevo objeto
export const createObject = payload => api.post('/admin/objects', payload);

// Actualizar un objeto existente
export const updateObject = (id, payload) => api.put(`/admin/objects/${id}`, payload);

// Eliminar un objeto
export const deleteObject = id => api.delete(`/admin/objects/${id}`);

/**
* Usuarios
*/
// Listar usuarios (devuelve solo el array de usuarios)
export async function getUsers() {
  const res = await api.get('/admin/users');
  return unwrapArrayResponse(res);
}

// Crear usuario nuevo
export const createUser = async (payload) => {
  return api.post('/admin/users', payload);
};

// Actualizar datos de usuario (usado en editar usuario)
export const updateUser = (id, payload) =>
  api.put(`/admin/users/${id}`, {
    atr_usuario: payload.atr_usuario,
    atr_nombre_usuario: payload.atr_nombre_usuario,
    atr_correo_electronico: payload.atr_correo_electronico,
    atr_estado_usuario: payload.atr_estado_usuario,
    atr_id_rol: payload.atr_id_rol,
  });

// Cambiar solo el rol del usuario (usado por el dropdown)
export const updateUserRole = (id, roleId) =>
  api.put(`/admin/users/${id}`, { atr_id_rol: roleId });

// Eliminar usuario
export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export default api;
