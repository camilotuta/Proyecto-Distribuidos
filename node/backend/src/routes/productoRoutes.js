const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.listarTodos);
router.get('/cantidad-vendida', productoController.obtenerCantidadVendida);
router.get('/stock-bajo/:cantidad', productoController.buscarStockBajo);
router.get('/:id', productoController.buscarPorId);
router.post('/', productoController.crear);
router.put('/:id', productoController.actualizar);
router.delete('/:id', productoController.eliminar);

module.exports = router;