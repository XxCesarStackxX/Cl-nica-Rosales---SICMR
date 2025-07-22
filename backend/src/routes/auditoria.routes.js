// Rutas de auditoría bajo /api/admin
router.get('/logs', async (req, res) => {
  try {
    const eventos = await BitacoraHelper.obtenerEventos({
      usuarioId: req.query.userId,
      objetoId: req.query.objetoId,
      accion: req.query.action,
      fechaInicio: req.query.from,
      fechaFin: req.query.to,
      limit: parseInt(req.query.limit) || 50
    });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
