const express = require("express");
const router = express.Router();
const puntoDeVentaController = require("../controllers/puntoDeVentaController");

// RUTAS
router.get("/", puntoDeVentaController.listarTodos);
router.get("/ubicacion/:uId", puntoDeVentaController.buscarPorUbicacion); // ← AHORA EXISTE
router.get("/:id", puntoDeVentaController.buscarPorId);
router.post("/", puntoDeVentaController.crear);
router.put("/:id", puntoDeVentaController.actualizar);
router.delete("/:id", puntoDeVentaController.eliminar);

module.exports = router;
