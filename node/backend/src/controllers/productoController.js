const { Producto, VentaDetalle } = require('../models');
const { sequelize, Sequelize } = require('../models');  // Añadí Sequelize para Op

// GET /api/productos - Listar todos
exports.listarTodos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            order: [['pId', 'ASC']]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/productos/:id - Buscar por ID
exports.buscarPorId = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/productos - Crear nuevo
exports.crear = async (req, res) => {
    try {
        // Validaciones (buenas, pero el DB ya las tiene; esto es para feedback temprano)
        if (req.body.pPrecio < 0) {
            return res.status(400).json({ 
                error: 'El precio no puede ser negativo' 
            });
        }
        if (req.body.pStock < 0) {
            return res.status(400).json({ 
                error: 'El stock no puede ser negativo' 
            });
        }

        const producto = await Producto.create(req.body);
        res.status(201).json(producto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PUT /api/productos/:id - Actualizar
exports.actualizar = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await producto.update(req.body);
        res.json(producto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE /api/productos/:id - Eliminar
exports.eliminar = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await producto.destroy();
        res.json({ mensaje: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET /api/productos/stock-bajo/:cantidad - Stock bajo
exports.buscarStockBajo = async (req, res) => {
    try {
        const cantidad = parseInt(req.params.cantidad);
        if (isNaN(cantidad)) {
            return res.status(400).json({ error: 'Cantidad inválida' });
        }
        const productos = await Producto.findAll({
            where: {
                pStock: {
                    [Sequelize.Op.lt]: cantidad  // Usamos Sequelize.Op
                }
            },
            order: [['pStock', 'ASC']]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/productos/cantidad-vendida - Cantidad vendida por producto
exports.obtenerCantidadVendida = async (req, res) => {
    try {
        const [resultados] = await sequelize.query(`
            SELECT 
                p.p_id as "productoId",
                p.p_nombre as "nombreProducto",
                COALESCE(SUM(vd.vd_cantidad), 0) as "cantidadVendida"
            FROM producto p
            LEFT JOIN venta_detalle vd ON p.p_id = vd.p_id
            GROUP BY p.p_id, p.p_nombre
            ORDER BY "cantidadVendida" DESC
        `);
        
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};