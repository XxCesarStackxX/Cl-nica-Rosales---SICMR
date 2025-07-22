// backend/src/routes/admin.routes.js

const express = require('express');
const { param, body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const { updateUserStatus } = require('../controllers/user.controller');

const {
  listUsers,
  createUser,
  blockUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  listLogs,
  deleteLogEntry,
  getPendingUsers,
  approveUser,
  rejectUser,
  unlockUser,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermisos
} = require('../controllers/admin.controller');

// Importa middlewares de autenticación y permisos
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/permission.middleware');

// Middleware de validación de express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({ field: err.param, msg: err.msg })),
    });
  }
  next();
};

// ───────── Usuarios ─────────

// Listar usuarios (paginado + búsqueda opcional)
router.get(
  '/users',
  authenticate,
  authorize('Usuarios', 'CONSULTAR'),
  asyncHandler(listUsers)
);

// Crear usuario
router.post(
  '/users',
  authenticate,
  authorize('Usuarios', 'INSERTAR'),
  [
    body('username').notEmpty().withMessage('Usuario requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
  ],
  validate,
  asyncHandler(createUser)
);

// Actualizar usuario existente
router.put(
  '/users/:id',
  authenticate,
  authorize('Usuarios', 'ACTUALIZAR'),
  [
    param('id').isInt().withMessage('ID debe ser un número entero'),
    body('atr_usuario').optional(),
    body('atr_nombre_usuario').optional(),
    body('atr_correo_electronico').optional().isEmail(),
    body('atr_id_rol').optional().isInt(),
    body('atr_estado_usuario').optional().isString(),
  ],
  validate,
  asyncHandler(updateUser)
);

// Eliminar usuario existente
router.delete(
  '/users/:id',
  authenticate,
  authorize('Usuarios', 'ELIMINAR'),
  [param('id').isInt().withMessage('ID debe ser un número entero')],
  validate,
  asyncHandler(deleteUser)
);

// Bloquear usuario
router.patch(
  '/users/:id/block',
  authenticate,
  authorize('Usuarios', 'ACTUALIZAR'),
  [param('id').isInt().withMessage('ID debe ser un número entero')],
  validate,
  asyncHandler(blockUser)
);

// Resetear contraseña de usuario
router.put(
  '/users/:id/reset-password',
  authenticate,
  authorize('Usuarios', 'ACTUALIZAR'),
  [
    param('id').isInt().withMessage('ID debe ser un número entero'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
      .matches(/[a-z]/).withMessage('Debe contener minúscula')
      .matches(/[A-Z]/).withMessage('Debe contener mayúscula')
      .matches(/\d/).withMessage('Debe contener número')
      .matches(/[!@#$%^&*]/).withMessage('Debe contener carácter especial'),
  ],
  validate,
  asyncHandler(resetUserPassword)
);

router.patch('/users/:id/status', authenticate, authorize('Usuarios', 'ACTUALIZAR'), updateUserStatus);

// ───────── Bitácora ─────────

// Listar logs
router.get(
  '/logs',
  authenticate,
  authorize('Bitacora', 'CONSULTAR'),
  asyncHandler(listLogs)
);

// Eliminar entrada de log
router.delete(
  '/logs/:id',
  authenticate,
  authorize('Bitacora', 'ELIMINAR'),
  [param('id').isInt().withMessage('ID debe ser un número entero')],
  validate,
  asyncHandler(deleteLogEntry)
);

// ──────── Pendientes ────────

// Listar usuarios pendientes de aprobación
router.get(
  '/pending-users',
  authenticate,
  authorize('Usuarios', 'CONSULTAR'),
  asyncHandler(getPendingUsers)
);

// Aprobar usuario pendiente
router.post(
  '/approve-user/:id',
  authenticate,
  authorize('Usuarios', 'ACTUALIZAR'),
  [param('id').isInt().withMessage('ID inválido')],
  validate,
  asyncHandler(approveUser)
);

// Rechazar usuario pendiente
router.post(
  '/reject-user/:id',
  authenticate,
  authorize('Usuarios', 'ACTUALIZAR'),
  [param('id').isInt().withMessage('ID inválido')],
  validate,
  asyncHandler(rejectUser)
);

// Desbloquear usuario manualmente
router.patch(
  '/unlock-user/:id',
  authenticate,
  authorize('Usuarios', 'ACTUALIZAR'),
  [param('id').isInt().withMessage('ID inválido')],
  validate,
  asyncHandler(unlockUser)
);

// ───────── Roles ─────────

// Listar todos los roles
router.get(
  '/roles',
  authenticate,
  authorize('Roles', 'CONSULTAR'),
  asyncHandler(listRoles)
);

// Crear un nuevo rol
router.post(
  '/roles',
  authenticate,
  authorize('Roles', 'INSERTAR'),
  [
    body('name').notEmpty().withMessage('Nombre de rol requerido'),
    body('description').optional().isString(),
    body('status')
      .isIn(['ACTIVO', 'INACTIVO'])
      .withMessage('Estado inválido'),
  ],
  validate,
  asyncHandler(createRole)
);

// Actualizar un rol existente
router.put(
  '/roles/:id',
  authenticate,
  authorize('Roles', 'ACTUALIZAR'),
  [
    param('id').isInt().withMessage('ID debe ser un entero'),
    body('name').notEmpty().withMessage('Nombre de rol requerido'),
    body('description').optional().isString(),
    body('status')
      .isIn(['ACTIVO', 'INACTIVO'])
      .withMessage('Estado inválido'),
  ],
  validate,
  asyncHandler(updateRole)
);

// Eliminar un rol
router.delete(
  '/roles/:id',
  authenticate,
  authorize('Roles', 'ELIMINAR'),
  [param('id').isInt().withMessage('ID debe ser un entero')],
  validate,
  asyncHandler(deleteRole)
);

// Para Permisos
router.get('/permisos', authenticate, authorize('Permisos', 'CONSULTAR'), asyncHandler(getPermisos));

// ───────── Handler 404 para /api/admin ─────────
router.use((req, res) => {
  res.status(404).json({ error: 'Ruta de administración no encontrada' });
});

module.exports = router;
