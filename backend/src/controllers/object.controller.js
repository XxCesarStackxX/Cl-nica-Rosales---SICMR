// backend/src/controllers/object.controller.js

const Objeto = require('../models/object.model');
const BitacoraService = require('../services/bitacora.service');

async function listObjects(req, res, next) {
  try {
    const lista = await Objeto.findAll({ order: [['atr_id_objetos', 'ASC']] });
    res.json(lista);
  } catch (err) {
    console.error('Error listando objetos:', err);
    next(err);
  }
}

async function createObject(req, res, next) {
  try {
    // Mapeo flexible: acepta nombres en español o inglés
    const objeto = req.body.objeto || req.body.nombre || req.body.name;
    const descripcion = req.body.descripcion || req.body.description;
    const tipo = req.body.tipo || req.body.type;

    // Validación básica
    if (!objeto) {
      return res.status(400).json({ error: 'El nombre del objeto es requerido.' });
    }

    const nuevo = await Objeto.create({
      atr_objeto: objeto,
      atr_descripcion: descripcion,
      atr_tipo_objeto: tipo,
      atr_creado_por: req.user.atr_usuario,
      atr_fecha_creacion: new Date()
    });

    // —> Bitácora
    await BitacoraService.registrarEvento({
      usuarioId: req.user.atr_id_usuario,
      objetoId: nuevo.atr_id_objetos,
      accion: 'Create',
      descripcion: `Creación de objeto “${nuevo.atr_objeto}”`,
      ip: req.ip
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error creando objeto:', err);
    next(err);
  }
}

async function updateObject(req, res, next) {
  try {
    const { id } = req.params;
    // Igual que arriba: mapeo flexible
    const objeto = req.body.objeto || req.body.nombre || req.body.name;
    const descripcion = req.body.descripcion || req.body.description;
    const tipo = req.body.tipo || req.body.type;

    const reg = await Objeto.findByPk(id);
    if (!reg) return res.status(404).json({ error: 'Objeto no encontrado' });

    await reg.update({
      atr_objeto: objeto,
      atr_descripcion: descripcion,
      atr_tipo_objeto: tipo,
      atr_modificado_por: req.user.atr_usuario,
      atr_fecha_modificacion: new Date()
    });

    // —> Bitácora
    await BitacoraService.registrarEvento({
      usuarioId: req.user.atr_id_usuario,
      objetoId: id,
      accion: 'Update',
      descripcion: `Actualización de objeto “${reg.atr_objeto}”`,
      ip: req.ip
    });

    res.json(reg);
  } catch (err) {
    console.error('Error actualizando objeto:', err);
    next(err);
  }
}

// Eliminar o inactivar objeto (borrado lógico + físico)
async function deleteObject(req, res, next) {
  try {
    const { id } = req.params;
    const objeto = await Objeto.findByPk(id);
    if (!objeto) return res.status(404).json({ error: 'Objeto no encontrado' });

    // Si el objeto está ACTIVO, solo lo inactiva (borrado lógico)
    if (objeto.atr_estado_objeto !== 'INACTIVO') {
      await objeto.update({ atr_estado_objeto: 'INACTIVO' });
      return res.json({ success: true, logicalDelete: true, message: 'Objeto inactivado correctamente' });
    }

    // Si ya está INACTIVO, intenta borrado físico solo si no hay dependencias
    const Bitacora = require('../models/bitacora.model');
    await Bitacora.destroy({ where: { idObjeto: id } }); // idObjeto: tu campo FK en bitácora

    await objeto.destroy();

    res.json({ success: true, logicalDelete: false, message: 'Objeto eliminado físicamente' });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'No se puede eliminar el objeto porque tiene información relacionada (bitácora, etc.)'
      });
    }
    console.error('Error eliminando objeto:', err);
    next(err);
  }
}

module.exports = {
  listObjects,
  createObject,
  updateObject,
  deleteObject
};
