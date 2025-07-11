// backend/src/controllers/two.factor.controller.js

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { send2FABackupCodesEmail } = require('../services/email.service');
const User = require('../models/user.model');
const BackupCode = require('../models/backupcode.model');
const { generateToken } = require('../services/token.service');

// Genera y retorna secreto TOTP + QR + códigos de respaldo
const generate2FASecret = async (req, res) => {
  try {
    const user = req.user;
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `ClínicaEsteticaRosales:${user.atr_usuario}`,
      issuer: 'ClínicaEsteticaRosales'
    });
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    await user.update({ atr_2fa_secret: secret.base32, atr_2fa_enabled: false });
    const backupCodes = await generateBackupCodes(user.atr_id_usuario);

    return res.json({
      qrCode,
      secret: secret.base32,
      backupCodes,
      message: 'Escanea el QR con tu app y guarda los códigos de respaldo.'
    });
  } catch (error) {
    console.error('Error generando secreto 2FA:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Verifica token TOTP e habilita 2FA
const verify2FAToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;

    const verified = speakeasy.totp.verify({
      secret: user.atr_2fa_secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ error: 'Código 2FA inválido' });
    }

    await user.update({ atr_2fa_enabled: true });
    return res.json({ message: '2FA habilitada correctamente.' });
  } catch (error) {
    console.error('Error verificando token 2FA:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Deshabilita 2FA y borra códigos de respaldo
const disable2FA = async (req, res) => {
  try {
    const user = req.user;
    await user.update({ atr_2fa_enabled: false, atr_2fa_secret: null });
    await BackupCode.destroy({ where: { atr_usuario: user.atr_id_usuario } });

    return res.json({ message: '2FA deshabilitada correctamente.' });
  } catch (error) {
    console.error('Error deshabilitando 2FA:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Verifica token o código de respaldo durante login
const verifyLogin2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findByPk(userId);

    if (!user || !user.atr_2fa_enabled) {
      return res.status(400).json({ error: '2FA no habilitado.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.atr_2fa_secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      const authToken = jwt.sign(
        { id: user.atr_id_usuario, role: user.atr_id_rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      const safeUser = user.toJSON();
      delete safeUser.atr_contrasena;
      delete safeUser.atr_2fa_secret;
      delete safeUser.atr_reset_token;
      delete safeUser.atr_reset_expiry;

      return res.json({ token: authToken, user: safeUser, message: '2FA exitosa.' });
    }

    const backupCode = await BackupCode.findOne({
      where: {
        atr_usuario: user.atr_id_usuario,
        atr_codigo: token,
        atr_utilizado: false
      }
    });

    if (backupCode) {
      await backupCode.update({
        atr_utilizado: true,
        atr_fecha_utilizacion: new Date()
      });

      const authToken = jwt.sign(
        { id: user.atr_id_usuario, role: user.atr_id_rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      const safeUser = user.toJSON();
      delete safeUser.atr_contrasena;
      delete safeUser.atr_2fa_secret;
      delete safeUser.atr_reset_token;
      delete safeUser.atr_reset_expiry;

      return res.json({ token: authToken, user: safeUser, message: 'Código de respaldo utilizado.' });
    }

    return res.status(400).json({ error: 'Token inválido.' });
  } catch (error) {
    console.error('Error verificando login 2FA:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Genera nuevos códigos de respaldo
const generateNewBackupCodes = async (req, res) => {
  try {
    const user = req.user;
    await BackupCode.update({ atr_utilizado: true }, { where: { atr_usuario: user.atr_id_usuario } });
    const codes = await generateBackupCodes(user.atr_id_usuario);

    return res.json({ backupCodes: codes, message: 'Códigos de respaldo regenerados.' });
  } catch (error) {
    console.error('Error generando nuevos códigos de respaldo:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Reenvía OTP por email durante login
const resendLoginCode = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await user.update({
      atr_2fa_email_code: code,
      atr_2fa_email_expiry: new Date(Date.now() + 5 * 60 * 1000)
    });

    await send2FABackupCodesEmail(user.atr_correo_electronico, [code]);

    return res.json({ message: 'Código enviado por email.' });
  } catch (error) {
    console.error('Error reenviando código 2FA:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Verifica OTP enviado por email durante login
const verifyEmailCode = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findByPk(userId);

    if (!user || !user.atr_2fa_email_code) {
      return res.status(400).json({ error: '2FA por email no configurado' });
    }

    if (user.atr_2fa_email_code !== token || new Date() > user.atr_2fa_email_expiry) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    await user.update({ atr_2fa_email_code: null, atr_2fa_email_expiry: null });

    const authToken = jwt.sign(
      { id: user.atr_id_usuario, role: user.atr_id_rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    const safeUser = user.toJSON();
    delete safeUser.atr_contrasena;
    delete safeUser.atr_2fa_secret;
    delete safeUser.atr_reset_token;
    delete safeUser.atr_reset_expiry;

    return res.json({ token: authToken, user: safeUser, message: '2FA por email exitosa.' });
  } catch (error) {
    console.error('Error verificando código de email 2FA:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Generador de códigos de respaldo
async function generateBackupCodes(userId) {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = generateToken(10);
    codes.push(code);
    await BackupCode.create({ atr_usuario: userId, atr_codigo: code });
  }
  return codes;
}

module.exports = {
  generate2FASecret,
  verify2FAToken,
  disable2FA,
  verifyLogin2FA,
  generateNewBackupCodes,
  resendLoginCode,
  verifyEmailCode
};
