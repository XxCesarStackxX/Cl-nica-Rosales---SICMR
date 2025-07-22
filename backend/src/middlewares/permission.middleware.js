// backend/src/middlewares/permission.middleware.js

const Permiso = require('../models/permiso.model');
const Objeto = require('../models/object.model');

/**
 * Middleware para validar permisos por objeto y acción
 * Uso: authorize('PACIENTES', 'CONSULTAR')
 */
function authorize(nombreObjeto, accion) {
  return async (req, res, next) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Busca el objeto por nombre para obtener su id
      const objeto = await Objeto.findOne({
        where: { atr_objeto: nombreObjeto }
      });
      if (!objeto) {
        return res.status(403).json({ error: `Objeto "${nombreObjeto}" no registrado` });
      }

      // Busca el permiso según rol y objeto
      const permiso = await Permiso.findOne({
        where: {
          atr_id_rol: user.atr_id_rol,
          atr_id_objeto: objeto.atr_id_objetos
        }
      });
      if (!permiso) {
        return res.status(403).json({ error: `No tienes permisos para este módulo (${nombreObjeto})` });
      }

      // ¿El permiso de la acción está habilitado?
      const campo = {
        INSERTAR: 'atr_permiso_insercion',
        ELIMINAR: 'atr_permiso_eliminacion',
        ACTUALIZAR: 'atr_permiso_actualizacion',
        CONSULTAR: 'atr_permiso_consultar'
      }[accion.toUpperCase()];

      if (!campo) {
        return res.status(500).json({ error: `Acción "${accion}" no reconocida` });
      }

      // ACEPTA 'SI'/'si', '1', 1, true como permiso válido
      if (
        permiso[campo] !== '1' &&
        permiso[campo] !== 1 &&
        permiso[campo] !== true &&
        permiso[campo] !== 'SI' &&
        permiso[campo] !== 'si'
      ) {
        return res.status(403).json({ error: `No tienes permiso para ${accion.toLowerCase()} en este módulo` });
      }

      // Permiso concedido
      next();
    } catch (error) {
      console.error('Error en authorize:', error);
      return res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
}

module.exports = { authorize };
