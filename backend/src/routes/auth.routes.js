// backend/src/routes/auth.routes.js

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');
const twoFAController = require('../controllers/two.factor.controller');

const router = express.Router();

// Helper para formatear errores de validación
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(e => e.msg).join('. ');
    return res.status(400).json({ error: errorMessages });
  }
  next();
};

// Registro de usuario
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 4, max: 15 }).withMessage('Usuario entre 4 y 15 caracteres')
      .matches(/^[A-Z0-9]+$/).withMessage('Solo mayúsculas y números'),
    body('name').trim().notEmpty().withMessage('Nombre requerido'),
    body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
      .matches(/[a-z]/).withMessage('Debe contener minúscula')
      .matches(/[A-Z]/).withMessage('Debe contener mayúscula')
      .matches(/\d/).withMessage('Debe contener número')
      .matches(/[@$!%*?&]/).withMessage('Debe contener carácter especial'),
    body('confirmPassword')
      .custom((c, { req }) => c === req.body.password)
      .withMessage('Las contraseñas no coinciden')
  ],
  validateRequest,
  authController.register
);

// Verificación de email
router.get(
  '/verify-email',
  [query('token').notEmpty().withMessage('Token de verificación requerido')],
  validateRequest,
  authController.verifyEmail
);

// Login
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Usuario requerido'),
    body('password').notEmpty().withMessage('Contraseña requerida')
  ],
  validateRequest,
  authController.login
);

// Perfil del usuario autenticado
router.get('/me', authenticate, authController.getUserProfile);
router.get('/profile', authenticate, authController.getUserProfile);

// Verificar token JWT
router.get('/verify-token', authenticate, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Rutas de autenticación en dos pasos (2FA)
router.get('/2fa/setup', authenticate, twoFAController.generate2FASecret);
router.post('/2fa/verify', authenticate, twoFAController.verify2FAToken);
router.delete('/2fa/disable', authenticate, twoFAController.disable2FA);
router.get('/2fa/new-backup-codes', authenticate, twoFAController.generateNewBackupCodes);
router.post('/2fa/verify-login', twoFAController.verifyLogin2FA);
router.post('/2fa/resend-code', twoFAController.resendLoginCode);
router.post('/2fa/verify-email-code', twoFAController.verifyEmailCode);

// Recuperación de contraseña
router.post(
  '/forgot-password',
  [body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail()],
  validateRequest,
  authController.forgotPassword
);

// Restablecer contraseña con token
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token requerido'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
      .matches(/[a-z]/).withMessage('Debe contener minúscula')
      .matches(/[A-Z]/).withMessage('Debe contener mayúscula')
      .matches(/\d/).withMessage('Debe contener número')
      .matches(/[@$!%*?&]/).withMessage('Debe contener carácter especial'),
    body('confirmPassword')
      .custom((c, { req }) => c === req.body.newPassword)
      .withMessage('Las contraseñas no coinciden')
  ],
  validateRequest,
  authController.resetPassword
);

// Cambio de contraseña
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
