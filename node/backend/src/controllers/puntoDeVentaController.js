const { PuntoDeVenta, Ubicacion } = require("../models");

// GET /api/puntos-de-venta - Listar todos
exports.listarTodos = async (req, res) => {
  try {
    const puntos = await PuntoDeVenta.findAll({
      include: [
        {
          model: Ubicacion,
          as: "ubicacion",
          attributes: ["uId", "uNombre"],
        },
      ],
      order: [["pvId", "ASC"]],
    });
    res.json(puntos);
  } catch (error) {
    console.error("Error en listarTodos:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/puntos-de-venta/:id - Buscar por ID
exports.buscarPorId = async (req, res) => {
  try {
    const punto = await PuntoDeVenta.findByPk(req.params.id, {
      include: [{ model: Ubicacion, as: "ubicacion" }],
    });
    if (!punto) return res.status(404).json({ error: "Punto de venta no encontrado" });
    res.json(punto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/puntos-de-venta/ubicacion/:uId - BUSCAR POR UBICACIÓN (FALTABA)
exports.buscarPorUbicacion = async (req, res) => {
  try {
    const puntos = await PuntoDeVenta.findAll({
      where: { uId: req.params.uId },
      include: [{ model: Ubicacion, as: "ubicacion" }],
      order: [["pvNombre", "ASC"]],
    });
    res.json(puntos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/puntos-de-venta - Crear
exports.crear = async (req, res) => {
  try {
    const { pvNombre, uId } = req.body;
    if (!pvNombre || !uId) {
      return res.status(400).json({ error: "pvNombre y uId son obligatorios" });
    }

    const ubicacion = await Ubicacion.findByPk(uId);
    if (!ubicacion) {
      return res.status(404).json({ error: "Ubicación no encontrada" });
    }

    const punto = await PuntoDeVenta.create({ pvNombre, uId });
    const nuevo = await PuntoDeVenta.findByPk(punto.pvId, {
      include: [{ model: Ubicacion, as: "ubicacion" }],
    });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/puntos-de-venta/:id - Actualizar
exports.actualizar = async (req, res) => {
  try {
    const punto = await PuntoDeVenta.findByPk(req.params.id);
    if (!punto) return res.status(404).json({ error: "Punto de venta no encontrado" });

    const { pvNombre, uId } = req.body;

    if (uId) {
      const ubicacion = await Ubicacion.findByPk(uId);
      if (!ubicacion) return res.status(404).json({ error: "Ubicación no encontrada" });
    }

    await punto.update({ pvNombre: pvNombre || punto.pvNombre, uId: uId || punto.uId });
    const actualizado = await PuntoDeVenta.findByPk(punto.pvId, {
      include: [{ model: Ubicacion, as: "ubicacion" }],
    });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/puntos-de-venta/:id - Eliminar
exports.eliminar = async (req, res) => {
  try {
    const punto = await PuntoDeVenta.findByPk(req.params.id);
    if (!punto) return res.status(404).json({ error: "Punto de venta no encontrado" });

    await punto.destroy();
    res.json({ mensaje: "Punto de venta eliminado exitosamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};