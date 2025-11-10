const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.get('/', ventaController.listarTodas);
router.get('/persona/:personaId/detalles', ventaController.obtenerConDetalles);
router.get('/persona/:personaId', ventaController.buscarPorPersona);
router.get('/:id', ventaController.buscarPorId);
router.post('/', ventaController.crear);

module.exports = router;