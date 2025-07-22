// controllers/userController.js
const { logError } = require('../services/error.service');
const User = require('../models/user.model.js');

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const allowedStates = [
      'ACTIVO',
      'BLOQUEADO',
      'INACTIVO',
      'PENDIENTE_VERIFICACION',
      'PENDIENTE_APROBACION'
    ];
    if (!allowedStates.includes(estado)) {
      return res.status(400).json({ error: 'Estado no permitido.' });
    }
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    await user.update({ atr_estado_usuario: estado });
    return res.json({ message: 'Estado actualizado correctamente.' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado.' });
  }
};

async function getUser(req, res) {
    try {
        // Lógica del controlador...
    } catch (error) {
        logError('Error al obtener usuario', {
            stack: error.stack,
            endpoint: '/api/users',
            userId: req.user.id,
            ip: req.ip
        });
        
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
}