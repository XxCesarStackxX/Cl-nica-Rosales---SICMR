// backend/src/middlewares/auth.middleware.js
// Middleware de autenticación y autorización

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Permiso = require('../models/permiso.model');
const Objeto = require('../models/object.model');

/**
 * Verifica y decodifica el token JWT, carga el usuario y valida estado
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id || decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (user.atr_estado_usuario !== 'ACTIVO') {
      const statusMessages = {
        PENDIENTE_VERIFICACION: 'Verifica tu email primero',
        PENDIENTE_APROBACION: 'Cuenta pendiente de aprobación',
        BLOQUEADO: 'Cuenta bloqueada. Contacta al administrador',
        RECHAZADO: 'Cuenta rechazada'
      };

      return res.status(403).json({
        error: statusMessages[user.atr_estado_usuario] || 'Cuenta no activa',
        status: user.atr_estado_usuario
      });
    }

    if (user.atr_reset_expiry && new Date(user.atr_reset_expiry) > new Date()) {
      const unlockTime = new Date(user.atr_reset_expiry).toLocaleString();
      return res.status(403).json({
        error: `Cuenta bloqueada temporalmente hasta ${unlockTime}`
      });
    }

    await user.update({ atr_fecha_ultima_conexion: new Date() });

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    return res.status(500).json({ error: 'Error en el servidor durante la autenticación' });
  }
};

/**
 * Verifica que el usuario autenticado sea administrador
 */
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    if (req.user.atr_id_rol !== 1) {
      return res.status(403).json({ error: 'Acceso restringido a administradores' });
    }
    next();
  } catch (error) {
    console.error('Error en middleware isAdmin:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * Comprueba si es el primer ingreso para forzar cambio de contraseña
 */
const checkFirstLogin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.atr_primer_ingreso) {
      return res.status(403).json({
        error: 'Debes cambiar tu contraseña en el primer ingreso',
        firstLogin: true,
        resetToken: req.user.atr_reset_token
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware checkFirstLogin:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * Middleware general para verificar permisos por objeto y acción (CRUD)
 * Uso: authorizeByPermission('Roles', 'consultar')
 * 
 * Acciones posibles: 'consultar', 'insertar', 'actualizar', 'eliminar'
 * 
 * El administrador (rol 1) siempre tiene acceso completo.
 */
const authorizeByPermission = (nombreObjeto, accion) => {
  return async (req, res, next) => {
    try {
      // Si el usuario es admin, acceso total
      if (req.user && req.user.atr_id_rol === 1) {
        // LOG EXTRA: para depurar
        console.log('Acceso admin permitido sin validar permisos.');
        return next();
      }

      // Buscar objeto en BD para obtener su ID
      const objeto = await Objetos.findOne({ where: { atr_objeto: nombreObjeto } });
      if (!objeto) {
        console.error(`No se encontró el objeto con nombre "${nombreObjeto}" en la tabla tbl_objetos.`);
        return res.status(404).json({ error: `Objeto "${nombreObjeto}" no encontrado` });
      }

      // Buscar permiso correspondiente
      const permiso = await Permisos.findOne({
        where: {
          atr_id_rol: req.user.atr_id_rol,
          atr_id_objeto: objeto.atr_id_objetos
        }
      });

      if (!permiso) {
        console.error(`No se encontró permiso para rol ${req.user.atr_id_rol} y objeto ${objeto.atr_id_objetos}.`);
        return res.status(403).json({ error: 'No tienes permiso para esta acción en este módulo' });
      }

      const value = permiso[`atr_permiso_${accion}`];
      if (!(value === 'SI' || value === 1 || value === '1')) {
        console.error(`Permiso denegado: valor de permiso atr_permiso_${accion} es "${value}"`);
        return res.status(403).json({ error: 'No tienes permiso para esta acción en este módulo' });
      }

      next();
    } catch (error) {
      console.error('Error en authorizeByPermission:', error);
      res.status(500).json({ error: 'Error al verificar permisos' });
    }
  };
};

// Middleware combinado para rutas de administrador
const authenticateAdmin = [authenticate, isAdmin];

module.exports = {
  authenticate,
  isAdmin,
  checkFirstLogin,
  authenticateAdmin,
  authorizeByPermission
};
