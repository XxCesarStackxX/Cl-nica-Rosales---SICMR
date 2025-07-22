// backend/src/routes/object.routes.js
const express = require('express');
const {
  listObjects,
  createObject,
  updateObject,
  deleteObject,
} = require('../controllers/object.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/permission.middleware');

const router = express.Router();

// Listar todos los objetos
router.get(
  '/',
  authenticate,
  authorize('Objetos', 'CONSULTAR'),
  listObjects
);

// Crear nuevo objeto
router.post(
  '/',
  authenticate,
  authorize('Objetos', 'INSERTAR'),
  createObject
);

// Actualizar objeto existente
router.put(
  '/:id',
  authenticate,
  authorize('Objetos', 'ACTUALIZAR'),
  updateObject
);

// Eliminar objeto
router.delete(
  '/:id',
  authenticate,
  authorize('Objetos', 'ELIMINAR'),
  deleteObject
);

module.exports = router;
