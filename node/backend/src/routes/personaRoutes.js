const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');

router.get('/', personaController.listarTodas);
router.get('/:id', personaController.buscarPorId);
router.post('/', personaController.crear);
router.put('/:id', personaController.actualizar);
router.delete('/:id', personaController.eliminar);
router.get('/email/:email', personaController.buscarPorEmail);

module.exports = router;