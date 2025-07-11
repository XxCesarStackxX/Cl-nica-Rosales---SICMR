// backend/src/services/passwordGenerator.service.js

const crypto = require('crypto');

/**
 * Genera una contraseña temporal robusta de longitud `length`.
 * Usa crypto.randomBytes + Base64 y recorta al largo deseado.
 * @param {number} length Longitud de la contraseña (por defecto 12).
 * @returns {string} Contraseña temporal.
 */
function generateTempPassword(length = 12) {
  const raw = crypto
    .randomBytes(Math.ceil((length * 3) / 4))
    .toString('base64');
  return raw.slice(0, length);
}

module.exports = { generateTempPassword };
