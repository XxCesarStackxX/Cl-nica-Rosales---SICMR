// backend/src/services/email.service.js

require('dotenv').config();
const nodemailer = require('nodemailer');

// Configuración del transporte
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// URLs base
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Enviar correo de recuperación de contraseña
 */
async function sendResetEmail(to, token, expiry) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <p>Se solicitó restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
    <a href="${resetUrl}">Restablecer contraseña</a>
    <p>El enlace expira el ${expiry.toLocaleString()}.</p>
  `;
  await transporter.sendMail({
    from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Recuperación de contraseña - Clínica Estética Rosales',
    html
  });
}

/**
 * Enviar correo de verificación de cuenta
 */
async function sendVerificationEmail(to, token, name) {
  const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${token}`;
  const html = `
    <p>Hola ${name},</p>
    <p>Gracias por registrarte. Verifica tu cuenta haciendo clic en el siguiente enlace:</p>
    <a href="${verifyUrl}">Verificar cuenta</a>
    <p>Este enlace expira en 24 horas.</p>
  `;
  await transporter.sendMail({
    from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verificación de cuenta - Clínica Estética Rosales',
    html
  });
}

/**
 * Enviar correo de aprobación de cuenta
 */
async function sendApprovalEmail(toEmail) {
  const html = `
    <p>Hola,</p>
    <p>Tu cuenta ha sido <strong>aprobada</strong> por el administrador. Ya puedes iniciar sesión en el sistema.</p>
    <p><a href="${FRONTEND_URL}/login">Ir al inicio de sesión</a></p>
    <p>Clínica Estética Rosales</p>
  `;
  await transporter.sendMail({
    from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Cuenta aprobada - Clínica Estética Rosales',
    html
  });
}

/**
 * Enviar correo de rechazo de cuenta
 */
async function sendRejectionEmail(toEmail) {
  const html = `
    <p>Hola,</p>
    <p>Lamentamos informarte que tu cuenta ha sido <strong>rechazada</strong> por el administrador.</p>
    <p>Si crees que esto es un error, contacta al personal de la clínica.</p>
    <p>Clínica Estética Rosales</p>
  `;
  await transporter.sendMail({
    from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Cuenta rechazada - Clínica Estética Rosales',
    html
  });
}

// Exportación unificada
module.exports = {
  sendResetEmail,
  sendVerificationEmail,
  sendApprovalEmail,
  sendRejectionEmail
};
