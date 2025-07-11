// backend/src/services/token.service.js

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, BCRYPT_SALT_ROUNDS } = process.env;

/**
 * Genera un token aleatorio seguro en formato hexadecimal.
 * @param {number} length Longitud en bytes (por defecto 32).
 * @returns {string} Token hexadecimal.
 */
function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Alias de generateRandomToken para compatibilidad con los controladores.
 * Genera un token aleatorio (hex) de la longitud indicada.
 */
const generateToken = generateRandomToken;

/**
 * Firma un payload en un JWT con expiración opcional.
 * @param {Object} payload Datos a incluir en el token JWT.
 * @param {string} [expiresIn='1h'] Tiempo de expiración (ej. '1h', '7d').
 * @returns {string} JWT firmado.
 */
function generateJWT(payload, expiresIn = '1h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Genera una contraseña temporal aleatoria de 10 caracteres.
 * @returns {string} Contraseña temporal.
 */
function generateTempPassword() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 10; i += 1) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Valida la fortaleza de una contraseña usando regex.
 * @param {string} password Contraseña a validar.
 * @returns {boolean} True si cumple con los criterios.
 */
function validatePasswordStrength(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

/**
 * Genera un hash de la contraseña usando bcrypt.
 * @param {string} password Contraseña en texto plano.
 * @returns {Promise<string>} Hash de la contraseña.
 */
async function hashPassword(password) {
  const rounds = parseInt(BCRYPT_SALT_ROUNDS, 10) || 10;
  return bcrypt.hash(password, rounds);
}

/**
 * Compara una contraseña con su hash.
 * @param {string} password Contraseña en texto plano.
 * @param {string} hash Hash con el que comparar.
 * @returns {Promise<boolean>} True si coinciden.
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  generateRandomToken,
  generateToken,
  generateJWT,
  generateTempPassword,
  validatePasswordStrength,
  hashPassword,
  comparePassword,
};
