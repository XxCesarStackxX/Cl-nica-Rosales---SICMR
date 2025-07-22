// frontend/src/services/permisoService.js
import api from './api';

// Listar todos los roles (usa tu endpoint real)
export async function getRoles(token) {
  const res = await api.get('/admin/roles', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Listar todos los objetos
export async function getObjetos(token) {
  const res = await api.get('/admin/objects', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Listar permisos de un rol
export async function getPermisosByRol(rolId, token) {
  const res = await api.get(`/permisos/rol/${rolId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Crear o actualizar permisos
export async function upsertPermiso(data, token) {
  const res = await api.post('/permisos', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
