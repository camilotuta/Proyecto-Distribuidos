const { Venta, VentaDetalle, Persona, PuntoDeVenta, Ubicacion, Producto, sequelize } = require('../models');

// GET /api/ventas - Listar todas
exports.listarTodas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [
                {
                    model: Persona,
                    as: 'persona',
                    attributes: ['pId', 'pNombre', 'pApellido', 'pEmail']
                },
                {
                    model: PuntoDeVenta,
                    as: 'puntoDeVenta',
                    attributes: ['pvId', 'pvNombre'],
                    include: [{
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['uId', 'uNombre']
                    }]
                },
                {
                    model: VentaDetalle,
                    as: 'detalles',
                    include: [{
                        model: Producto,
                        as: 'producto',
                        attributes: ['pId', 'pNombre', 'pPrecio']
                    }]
                }
            ],
            order: [['vFecha', 'DESC']]
        });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/ventas/:id - Buscar por ID
exports.buscarPorId = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id, {
            include: [
                {
                    model: Persona,
                    as: 'persona'
                },
                {
                    model: PuntoDeVenta,
                    as: 'puntoDeVenta',
                    include: [{
                        model: Ubicacion,
                        as: 'ubicacion'
                    }]
                },
                {
                    model: VentaDetalle,
                    as: 'detalles',
                    include: [{
                        model: Producto,
                        as: 'producto'
                    }]
                }
            ]
        });
        
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        res.json(venta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/ventas - Crear nueva venta
exports.crear = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { pId, pvId, detalles } = req.body;
        
        // Validar existencia de persona
        const persona = await Persona.findByPk(pId, { transaction: t });
        if (!persona) {
            await t.rollback();
            return res.status(404).json({ error: 'Persona no encontrada' });
        }
        
        // Validar existencia de punto de venta
        const puntoVenta = await PuntoDeVenta.findByPk(pvId, { transaction: t });
        if (!puntoVenta) {
            await t.rollback();
            return res.status(404).json({ error: 'Punto de venta no encontrado' });
        }
        
        // Validar que tenga detalles
        if (!detalles || detalles.length === 0) {
            await t.rollback();
            return res.status(400).json({ 
                error: 'La venta debe tener al menos un detalle' 
            });
        }
        
        // Crear la venta
        const venta = await Venta.create({
            pId: pId,
            pvId: pvId,
            vFecha: new Date()
        }, { transaction: t });
        
        // Procesar cada detalle
        for (const detalle of detalles) {
            // Buscar el producto
            const producto = await Producto.findByPk(detalle.pId, { transaction: t });
            
            if (!producto) {
                await t.rollback();
                return res.status(404).json({ 
                    error: `Producto no encontrado: ${detalle.pId}` 
                });
            }
            
            // Verificar stock
            if (producto.pStock < detalle.vdCantidad) {
                await t.rollback();
                return res.status(400).json({ 
                    error: `Stock insuficiente para ${producto.pNombre}. Disponible: ${producto.pStock}, Solicitado: ${detalle.vdCantidad}` 
                });
            }
            
            // Crear detalle de venta
            await VentaDetalle.create({
                vId: venta.vId,
                pId: detalle.pId,
                vdCantidad: detalle.vdCantidad,
                vdPrecioUnitario: detalle.vdPrecioUnitario || producto.pPrecio
            }, { transaction: t });
            
            // Actualizar stock
            producto.pStock -= detalle.vdCantidad;
            await producto.save({ transaction: t });
        }
        
        await t.commit();
        
        // Devolver la venta completa
        const ventaCompleta = await Venta.findByPk(venta.vId, {
            include: [
                {
                    model: Persona,
                    as: 'persona'
                },
                {
                    model: PuntoDeVenta,
                    as: 'puntoDeVenta',
                    include: [{
                        model: Ubicacion,
                        as: 'ubicacion'
                    }]
                },
                {
                    model: VentaDetalle,
                    as: 'detalles',
                    include: [{
                        model: Producto,
                        as: 'producto'
                    }]
                }
            ]
        });
        
        res.status(201).json(ventaCompleta);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
};

// GET /api/ventas/persona/:personaId - Ventas por persona
exports.buscarPorPersona = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            where: { pId: req.params.personaId },
            include: [
                {
                    model: Persona,
                    as: 'persona',
                    attributes: ['pId', 'pNombre', 'pApellido', 'pEmail']
                },
                {
                    model: PuntoDeVenta,
                    as: 'puntoDeVenta',
                    attributes: ['pvId', 'pvNombre'],
                    include: [{
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['uId', 'uNombre']
                    }]
                },
                {
                    model: VentaDetalle,
                    as: 'detalles',
                    include: [{
                        model: Producto,
                        as: 'producto',
                        attributes: ['pId', 'pNombre', 'pPrecio']
                    }]
                }
            ],
            order: [['vFecha', 'DESC']]
        });
        
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/ventas/persona/:personaId/detalles - Ventas con detalles simplificados
exports.obtenerConDetalles = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            where: { pId: req.params.personaId },
            include: [
                {
                    model: Persona,
                    as: 'persona',
                    attributes: ['pId', 'pNombre', 'pApellido', 'pEmail']
                },
                {
                    model: PuntoDeVenta,
                    as: 'puntoDeVenta',
                    attributes: ['pvId', 'pvNombre'],
                    include: [{
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['uId', 'uNombre']
                    }]
                }
            ],
            order: [['vFecha', 'DESC']]
        });
        
        // Formatear respuesta
        const resultado = ventas.map(venta => ({
            ventaId: venta.vId,
            fecha: venta.vFecha,
            personaNombre: `${venta.persona.pNombre} ${venta.persona.pApellido}`,
            personaEmail: venta.persona.pEmail,
            puntoVenta: venta.puntoDeVenta.pvNombre,
            ubicacion: venta.puntoDeVenta.ubicacion.uNombre
        }));
        
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};