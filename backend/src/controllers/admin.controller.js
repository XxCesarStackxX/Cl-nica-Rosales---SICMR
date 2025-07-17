// backend/src/controllers/admin.controller.js

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const PasswordHistory = require('../models/passwordhistory.model');
const Bitacora = require('../models/bitacora.model');
const { sendApprovalEmail, sendRejectionEmail } = require('../services/email.service');

// Genera contraseña aleatoria segura
function generarContraseña(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Listar usuarios
async function listUsers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const where = search ? { atr_usuario: { [Op.like]: `%${search}%` } } : {};

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['atr_fecha_creacion', 'DESC']],
      offset,
      limit
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error listando usuarios:', err);
    next(err);
  }
}

// Crear nuevo usuario
async function createUser(req, res, next) {
  try {
    const { username, email, password, autoGenerate } = req.body;

    if (!/@[^@]+\.[^@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const rawPwd = autoGenerate ? generarContraseña() : password;
    const hash = await bcrypt.hash(rawPwd, 12);

    const expiresAt = new Date(
      Date.now() + (parseInt(process.env.ADMIN_DIAS_VIGENCIA, 10) || 30) * 86400000
    );

    const user = await User.create({
      atr_usuario: username,
      atr_correo_electronico: email,
      atr_contrasena: hash,
      atr_fecha_vencimiento: expiresAt,
      atr_fecha_ultima_conexion: null,
      atr_fecha_creacion: new Date(),
      atr_estado_usuario: 'ACTIVO',
      atr_is_verified: false,
      atr_is_approved: true
    });

    await PasswordHistory.create({
      atr_usuario: user.atr_id_usuario,
      atr_contrasena: hash,
      atr_creado_por: req.user.username,
      atr_fecha_creacion: new Date()
    });

    res.status(201).json({
      success: true,
      user,
      plainPassword: rawPwd
    });
  } catch (err) {
    console.error('Error creando usuario:', err);
    next(err);
  }
}

// Bloquear usuario
async function blockUser(req, res, next) {
  try {
    const { id } = req.params;
    await User.update({ atr_estado_usuario: 'BLOQUEADO' }, { where: { atr_id_usuario: id } });
    res.json({ success: true, message: 'Usuario bloqueado' });
  } catch (err) {
    console.error('Error bloqueando usuario:', err);
    next(err);
  }
}

// Resetear contraseña
async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const nuevaPlain = generarContraseña();
    const hash = await bcrypt.hash(nuevaPlain, 12);

    await user.update({
      atr_contrasena: hash,
      atr_fecha_modificacion: new Date(),
      atr_primer_ingreso: false, // Importante: desactivar primer ingreso
      atr_is_verified: true,
      atr_reset_token: null,
      atr_reset_expiry: null,
      atr_2fa_enabled: false
    });

    await PasswordHistory.create({
      atr_usuario: user.atr_id_usuario,
      atr_contrasena: hash,
      atr_creado_por: req.user.username,
      atr_fecha_creacion: new Date()
    });

    res.json({
      success: true,
      message: 'Contraseña reseteada correctamente',
      nuevaContraseña: nuevaPlain
    });
  } catch (err) {
    console.error('Error al resetear contraseña:', err);
    next(err);
  }
}

// Listar bitácora
async function listLogs(req, res, next) {
  try {
    const { usuario, from, to } = req.query;
    const where = {};

    if (usuario) {
      where.idUsuario = usuario;
    }
    if (from || to) {
      where.fecha = {};
      if (from) where.fecha[Op.gte] = new Date(from);
      if (to) where.fecha[Op.lte] = new Date(to);
    }

    const logs = await Bitacora.findAll({
      where,
      order: [['fecha', 'DESC']],
      attributes: ['id', 'fecha', 'idUsuario', 'idObjeto', 'accion', 'descripcion']
    });

    res.json(logs);
  } catch (err) {
    console.error('Error listando logs:', err);
    next(err);
  }
}

// Eliminar entrada de bitácora
async function deleteLogEntry(req, res, next) {
  try {
    const { id } = req.params;
    await Bitacora.destroy({ where: { id } });
    res.json({ success: true, message: 'Registro eliminado' });
  } catch (err) {
    console.error('Error eliminando log:', err);
    next(err);
  }
}

// Listar usuarios pendientes
async function getPendingUsers(req, res, next) {
  try {
    const list = await User.findAll({
      where: { atr_estado_usuario: 'PENDIENTE_APROBACION' }
    });
    const safe = list.map((u) => {
      const j = u.toJSON();
      delete j.atr_contrasena;
      delete j.atr_reset_token;
      delete j.atr_reset_expiry;
      return j;
    });
    res.json(safe);
  } catch (error) {
    console.error('Error listando usuarios pendientes:', error);
    next(error);
  }
}

// Aprobar usuario
async function approveUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.atr_estado_usuario !== 'PENDIENTE_APROBACION') {
      return res.status(400).json({ error: 'No está pendiente de aprobación' });
    }

    await user.update({ 
        atr_estado_usuario: 'ACTIVO',
        atr_is_approved: true,
        atr_primer_ingreso: true
    });
    await sendApprovalEmail(user.atr_correo_electronico);
    res.json({ message: 'Usuario aprobado exitosamente' });
  } catch (error) {
    console.error('Error aprobando usuario:', error);
    next(error);
  }
}

// Rechazar usuario
async function rejectUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.atr_estado_usuario !== 'PENDIENTE_APROBACION') {
      return res.status(400).json({ error: 'No está pendiente de aprobación' });
    }

    await user.update({ atr_estado_usuario: 'RECHAZADO' });
    await sendRejectionEmail(user.atr_correo_electronico);
    res.json({ message: 'Usuario rechazado exitosamente' });
  } catch (error) {
    console.error('Error rechazando usuario:', error);
    next(error);
  }
}

// Desbloquear usuario
async function unlockUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await user.update({
      atr_intentos_fallidos: 0,
      atr_reset_expiry: null,
      atr_estado_usuario: 'ACTIVO'
    });

    res.json({ success: true, message: 'Usuario desbloqueado' });
  } catch (err) {
    console.error('Error desbloqueando usuario:', err);
    next(err);
  }
}

/**
* Listar todos los roles
*/
async function listRoles(req, res, next) {
  try {
    const roles = await Role.findAll({ order: [['atr_id_rol','ASC']] });
    res.json(roles);
  } catch (err) {
    console.error('Error listando roles:', err);
    next(err);
  }
}

/**
* Crear un nuevo rol
*/
async function createRole(req, res, next) {
  try {
    const { name, description, status } = req.body;
    const newRole = await Role.create({
      atr_nombre_rol: name,
      atr_descripcion: description,
      atr_estado_rol: status
    });
    res.status(201).json(newRole);
  } catch (err) {
    console.error('Error creando rol:', err);
    next(err);
  }
}

/**
* Actualizar un rol existente
*/
async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ error: 'Rol no encontrado' });
    await role.update({
      atr_nombre_rol: name,
      atr_descripcion: description,
      atr_estado_rol: status
    });
    res.json(role);
  } catch (err) {
    console.error('Error actualizando rol:', err);
    next(err);
  }
}

/**
* Eliminar un rol
*/
async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Role.destroy({ where: { atr_id_rol: id } });
    if (!deleted) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json({ success: true, message: 'Rol eliminado' });
  } catch (err) {
    console.error('Error eliminando rol:', err);
    next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
  blockUser,
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
  deleteRole
};
