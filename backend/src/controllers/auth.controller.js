// backend/src/controllers/auth.controller.js

const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/user.model.js');
const Parametro = require('../models/parametro.model.js');
const PasswordHistory = require('../models/passwordhistory.model.js');

const { sendResetEmail, sendVerificationEmail } = require('../services/email.service.js');
const { generateTempPassword } = require('../services/passwordGenerator.service.js');
const { generateToken } = require('../services/token.service.js');

/**
 * Registra un usuario y envía correo de verificación.
 */
exports.register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(password)) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
      });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const usuario = username.toUpperCase();
    const exists = await User.findOne({
      where: {
        [Op.or]: [
          { atr_usuario: usuario },
          { atr_correo_electronico: email.toLowerCase() }
        ]
      }
    });
    if (exists) {
      return res.status(400).json({ error: 'Usuario o correo ya registrados' });
    }

    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const newUser = await User.create({
      atr_usuario: usuario,
      atr_nombre_usuario: name,
      atr_correo_electronico: email.toLowerCase(),
      atr_contrasena: hashedPassword,
      atr_estado_usuario: 'PENDIENTE_VERIFICACION',
      atr_verification_token: verificationToken,
      atr_token_expiry: tokenExpiry,
      atr_primer_ingreso: false
    });

    await sendVerificationEmail(
      newUser.atr_correo_electronico,
      verificationToken,
      newUser.atr_nombre_usuario
    );

    return res.status(201).json({ message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.' });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Verifica token de email.
 */
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Token de verificación requerido' });
  }

  try {
    const user = await User.findOne({
      where: {
        atr_verification_token: token,
        atr_token_expiry: { [Op.gt]: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    await user.update({
      atr_is_verified: true,
      atr_verification_token: null,
      atr_token_expiry: null,
      atr_estado_usuario: 'PENDIENTE_APROBACION'
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${FRONTEND_URL}/email-verified?success=true`);
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${FRONTEND_URL}/email-verified?success=false&error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Login de usuario con manejo de bloqueo e intentos y flujo 2FA.
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const uname = username.toUpperCase();

    const user = await User.findOne({ where: { atr_usuario: uname } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const maxParam = await Parametro.findOne({
      where: { atr_parametro: 'ADMIN_INTENTOS_INVALIDOS' }
    });
    const MAX_ATTEMPTS = maxParam ? parseInt(maxParam.atr_valor, 10) : 3;
    const LOCK_TIME = 30 * 60 * 1000;

    if (user.atr_estado_usuario !== 'ACTIVO') {
      if (
        user.atr_estado_usuario === 'BLOQUEADO' &&
        user.atr_reset_expiry > new Date()
      ) {
        return res.status(403).json({
          error: `Cuenta bloqueada hasta ${user.atr_reset_expiry.toLocaleString()}`
        });
      }
      if (user.atr_estado_usuario === 'PENDIENTE_VERIFICACION') {
        return res.status(403).json({ error: 'Verifica tu email primero' });
      }
      if (user.atr_estado_usuario === 'PENDIENTE_APROBACION') {
        return res.status(403).json({ error: 'Cuenta pendiente de aprobación' });
      }

      // Reactivar tras bloqueo expirado
      await user.update({
        atr_estado_usuario: 'ACTIVO',
        atr_intentos_fallidos: 0,
        atr_reset_expiry: null
      });
    }

    const match = await bcrypt.compare(password, user.atr_contrasena);
    if (!match) {
      const attempts = user.atr_intentos_fallidos + 1;
      await user.update({ atr_intentos_fallidos: attempts });

      if (attempts >= MAX_ATTEMPTS) {
        await user.update({
          atr_estado_usuario: 'BLOQUEADO',
          atr_reset_expiry: new Date(Date.now() + LOCK_TIME)
        });
        return res.status(403).json({
          error: `Cuenta bloqueada tras ${MAX_ATTEMPTS} intentos fallidos`
        });
      }

      return res.status(401).json({
        error: `Credenciales inválidas. Restan ${MAX_ATTEMPTS - attempts} intentos`
      });
    }

    await user.update({
      atr_intentos_fallidos: 0,
      atr_reset_expiry: null,
      atr_fecha_ultima_conexion: new Date()
    });

    // Si el usuario es administrador, omitir 2FA y generar token
if (user.atr_id_rol === 1) {
  const token = jwt.sign(
    { id: user.atr_id_usuario, role: user.atr_id_rol },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  const safeUser = user.toJSON();
  delete safeUser.atr_contrasena;
  delete safeUser.atr_intentos_fallidos;
  delete safeUser.atr_reset_token;
  delete safeUser.atr_reset_expiry;
  return res.json({ token, user: safeUser });
}

// Si no tiene 2FA configurado
// Si no tiene 2FA y está aprobado (usuario no-admin)
if (
  user.atr_id_rol !== 1 &&
  user.atr_is_approved &&
  !user.atr_2fa_enabled &&
  user.atr_primer_ingreso
) {
  const token = jwt.sign(
    { id: user.atr_id_usuario, role: user.atr_id_rol },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  const safeUser = user.toJSON();
  delete safeUser.atr_contrasena;
  delete safeUser.atr_reset_token;
  delete safeUser.atr_reset_expiry;
  delete safeUser.atr_2fa_secret;

  return res.json({
    require2FASetup: true,
    token,
    user: safeUser,
    firstLogin: true
  });
}

// Si tiene 2FA habilitado, requiere verificación
return res.json({ twoFARequired: true, userId: user.atr_id_usuario });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Cambia la contraseña en primer ingreso o desde perfil.
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.atr_id_usuario;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Debes ingresar y confirmar la nueva contraseña.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'La nueva contraseña no cumple con los requisitos de seguridad.'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Si no es primer ingreso, validar contraseña actual
    if (!user.atr_primer_ingreso) {
      const isValid = await bcrypt.compare(currentPassword || '', user.atr_contrasena);
      if (!isValid) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
      }
    }

    // Validar que no sea igual a las anteriores
    const history = await PasswordHistory.findAll({
      where: { atr_usuario: user.atr_id_usuario },
      order: [['atr_fecha_creacion', 'DESC']],
      limit: 5
    });

    for (const old of history) {
      if (await bcrypt.compare(newPassword, old.atr_contrasena)) {
        return res.status(400).json({ error: 'No puedes reutilizar una contraseña reciente.' });
      }
    }

    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(newPassword, salt);

    await user.update({
      atr_contrasena: hashed,
      atr_reset_token: null,
      atr_reset_expiry: null,
      atr_primer_ingreso: false // marcar primer ingreso como falso
    });

    await PasswordHistory.create({ atr_usuario: user.atr_id_usuario, atr_contrasena: hashed });

    return res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error en changePassword:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Inicia proceso de recuperación de contraseña.
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { atr_correo_electronico: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const resetToken = generateToken();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.update({ atr_reset_token: resetToken, atr_reset_expiry: expiry });
    await sendResetEmail(user.atr_correo_electronico, resetToken, expiry);
    return res.json({ message: 'Correo de recuperación enviado correctamente' });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Restablece contraseña a partir de token.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }
    const user = await User.findOne({
      where: { atr_reset_token: token, atr_reset_expiry: { [Op.gt]: new Date() } }
    });
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(newPassword)) {
      return res.status(400).json({ error: 'Formato de contraseña inválido' });
    }
    // Historial
    const history = await PasswordHistory.findAll({
      where: { atr_usuario: user.atr_id_usuario },
      order: [['atr_fecha_creacion', 'DESC']],
      limit: 5
    });
    for (const old of history) {
      if (await bcrypt.compare(newPassword, old.atr_contrasena)) {
        return res.status(400).json({ error: 'No puedes reutilizar contraseñas anteriores' });
      }
    }
    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(newPassword, salt);
    await user.update({ atr_contrasena: hashed, atr_reset_token: null, atr_reset_expiry: null });
    await PasswordHistory.create({ atr_usuario: user.atr_id_usuario, atr_contrasena: hashed });
    return res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene perfil del usuario autenticado.
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const safe = user.toJSON();
    delete safe.atr_contrasena;
    delete safe.atr_intentos_fallidos;
    delete safe.atr_reset_token;
    delete safe.atr_reset_expiry;
    return res.json(safe);
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
