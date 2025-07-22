// backend/src/controllers/permiso.controller.js
const Permiso = require('../models/permiso.model');
const BitacoraService = require('../services/bitacora.service');

// Listar todos los permisos
async function listPermisos(req, res, next) {
  try {
    const permisos = await Permiso.findAll();
    res.json(permisos);
  } catch (err) {
    console.error('Error listando permisos:', err);
    next(err);
  }
}

// Obtener permisos por rol
async function getPermisosByRol(req, res, next) {
  try {
    const { rolId } = req.params;
    const permisos = await Permiso.findAll({ where: { atr_id_rol: rolId } });
    res.json(permisos);
  } catch (err) {
    console.error('Error obteniendo permisos por rol:', err);
    next(err);
  }
}

// Crear o actualizar permisos para un rol y objeto
async function upsertPermiso(req, res, next) {
  try {
    const {
      atr_id_rol,
      atr_id_objeto,
      atr_permiso_insercion,
      atr_permiso_eliminacion,
      atr_permiso_actualizacion,
      atr_permiso_consultar
    } = req.body;

    if (!atr_id_rol || !atr_id_objeto) {
      return res.status(400).json({ error: 'Rol y Objeto son requeridos.' });
    }

    // Verifica si ya existe el permiso para ese rol y objeto
    const existing = await Permiso.findOne({
      where: { atr_id_rol, atr_id_objeto }
    });

    let permiso;
    if (existing) {
      // Actualizar permisos existentes
      await existing.update({
        atr_permiso_insercion,
        atr_permiso_eliminacion,
        atr_permiso_actualizacion,
        atr_permiso_consultar,
        atr_modificado_por: req.user?.atr_usuario || 'sistema',
        atr_fecha_modificacion: new Date()
      });
      permiso = existing;
    } else {
      // Crear nuevo permiso
      permiso = await Permiso.create({
        atr_id_rol,
        atr_id_objeto,
        atr_permiso_insercion,
        atr_permiso_eliminacion,
        atr_permiso_actualizacion,
        atr_permiso_consultar,
        atr_creado_por: req.user?.atr_usuario || 'sistema',
        atr_fecha_creacion: new Date()
      });
    }

    // Registrar en bitácora
    await BitacoraService.registrarEvento({
      usuarioId: req.user?.atr_id_usuario,
      objetoId: atr_id_objeto,
      accion: existing ? 'Update' : 'Create',
      descripcion: `Permiso ${existing ? 'actualizado' : 'creado'} para Rol ${atr_id_rol}, Objeto ${atr_id_objeto}`,
      ip: req.ip
    });

    res.status(existing ? 200 : 201).json(permiso);
  } catch (err) {
    console.error('Error guardando permiso:', err);
    next(err);
  }
}

// Eliminar permisos de un rol para un objeto
async function deletePermiso(req, res, next) {
  try {
    const { rolId, objetoId } = req.params;
    const borrado = await Permiso.destroy({
      where: { atr_id_rol: rolId, atr_id_objeto: objetoId }
    });
    if (!borrado) {
      return res.status(404).json({ error: 'Permiso no encontrado.' });
    }

    // Registrar en bitácora
    await BitacoraService.registrarEvento({
      usuarioId: req.user?.atr_id_usuario,
      objetoId,
      accion: 'Delete',
      descripcion: `Permiso eliminado para Rol ${rolId}, Objeto ${objetoId}`,
      ip: req.ip
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error eliminando permiso:', err);
    next(err);
  }
}

module.exports = {
  listPermisos,
  getPermisosByRol,
  upsertPermiso,
  deletePermiso
};
