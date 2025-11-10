const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacionController');

router.get('/', ubicacionController.listarTodas);
router.get('/:id', ubicacionController.buscarPorId);
router.post('/', ubicacionController.crear);
router.put('/:id', ubicacionController.actualizar);
router.delete('/:id', ubicacionController.eliminar);

module.exports = router;