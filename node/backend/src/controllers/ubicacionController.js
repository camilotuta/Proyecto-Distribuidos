const { Ubicacion } = require('../models');

// GET /api/ubicaciones - Listar todas
exports.listarTodas = async (req, res) => {
    try {
        const ubicaciones = await Ubicacion.findAll({
            order: [['uId', 'ASC']]
        });
        res.json(ubicaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/ubicaciones/:id - Buscar por ID
exports.buscarPorId = async (req, res) => {
    try {
        const ubicacion = await Ubicacion.findByPk(req.params.id);
        if (!ubicacion) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }
        res.json(ubicacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/ubicaciones - Crear nueva
exports.crear = async (req, res) => {
    try {
        // Opcional: Agregar validaciones si hay campos únicos, e.g., dirección única
        // const existente = await Ubicacion.findOne({ where: { uDireccion: req.body.uDireccion } });
        // if (existente) return res.status(400).json({ error: 'La dirección ya está registrada' });

        const ubicacion = await Ubicacion.create(req.body);
        res.status(201).json(ubicacion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PUT /api/ubicaciones/:id - Actualizar
exports.actualizar = async (req, res) => {
    try {
        const ubicacion = await Ubicacion.findByPk(req.params.id);
        
        if (!ubicacion) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }

        await ubicacion.update(req.body);
        res.json(ubicacion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE /api/ubicaciones/:id - Eliminar
exports.eliminar = async (req, res) => {
    try {
        const ubicacion = await Ubicacion.findByPk(req.params.id);
        
        if (!ubicacion) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }

        await ubicacion.destroy();
        res.json({ mensaje: 'Ubicación eliminada exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};