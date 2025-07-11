// backend/src/services/hash.service.js
const bcrypt = require('bcryptjs');

/**
 * Encripta una contraseña con las rondas definidas en el entorno.
 * @param {string} plainTextPassword - Contraseña en texto plano.
 * @returns {Promise<string>} - Contraseña hasheada.
 */
async function encryptPassword(plainTextPassword) {
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
  return bcrypt.hash(plainTextPassword, rounds);
}

/**
 * Compara una contraseña en texto plano con una encriptada.
 * @param {string} plainTextPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plainTextPassword, hashedPassword) {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}

module.exports = {
  encryptPassword,
  verifyPassword
};
