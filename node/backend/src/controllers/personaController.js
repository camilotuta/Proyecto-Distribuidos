const { Persona } = require('../models');

// GET /api/personas - Listar todas
exports.listarTodas = async (req, res) => {
    try {
        const personas = await Persona.findAll({
            order: [['pId', 'ASC']]
        });
        res.json(personas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/personas/:id - Buscar por ID
exports.buscarPorId = async (req, res) => {
    try {
        const persona = await Persona.findByPk(req.params.id);
        if (!persona) {
            return res.status(404).json({ error: 'Persona no encontrada' });
        }
        res.json(persona);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/personas - Crear nueva
exports.crear = async (req, res) => {
    try {
        // Validar email único
        const existente = await Persona.findOne({ 
            where: { pEmail: req.body.pEmail } 
        });
        
        if (existente) {
            return res.status(400).json({ 
                error: 'El email ya está registrado' 
            });
        }

        const persona = await Persona.create(req.body);
        res.status(201).json(persona);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PUT /api/personas/:id - Actualizar
exports.actualizar = async (req, res) => {
    try {
        const persona = await Persona.findByPk(req.params.id);
        
        if (!persona) {
            return res.status(404).json({ error: 'Persona no encontrada' });
        }

        await persona.update(req.body);
        res.json(persona);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE /api/personas/:id - Eliminar
exports.eliminar = async (req, res) => {
    try {
        const persona = await Persona.findByPk(req.params.id);
        
        if (!persona) {
            return res.status(404).json({ error: 'Persona no encontrada' });
        }

        await persona.destroy();
        res.json({ mensaje: 'Persona eliminada exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET /api/personas/email/:email - Buscar por email
exports.buscarPorEmail = async (req, res) => {
    try {
        const persona = await Persona.findOne({ 
            where: { pEmail: req.params.email } 
        });
        
        if (!persona) {
            return res.status(404).json({ error: 'Persona no encontrada' });
        }
        
        res.json(persona);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};