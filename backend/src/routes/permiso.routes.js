// backend/src/routes/permiso.routes.js
const express = require('express');
const {
  listPermisos,
  getPermisosByRol,
  upsertPermiso,
  deletePermiso
} = require('../controllers/permiso.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/permission.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar todos los permisos
router.get(
  '/',
  authorize('Permisos', 'CONSULTAR'),
  listPermisos
);

// Obtener permisos por rol
router.get(
  '/rol/:rolId',
  authorize('Permisos', 'CONSULTAR'),
  getPermisosByRol
);

// Crear o actualizar un permiso (upsert)
router.post(
  '/',
  authorize('Permisos', 'INSERTAR'),
  upsertPermiso
);

// Eliminar permiso por rol y objeto
router.delete(
  '/:rolId/:objetoId',
  authorize('Permisos', 'ELIMINAR'),
  deletePermiso
);

module.exports = router;
