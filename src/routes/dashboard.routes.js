// src/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    obtenerEstadisticas,
    obtenerPorMarca,
    obtenerPorClase,
    obtenerResumen
} = require('../controllers/dashboard.controller');

// Verificar que todas las funciones existen
console.log('✅ Cargando rutas de dashboard:');
console.log('   obtenerEstadisticas:', typeof obtenerEstadisticas);
console.log('   obtenerPorMarca:', typeof obtenerPorMarca);
console.log('   obtenerPorClase:', typeof obtenerPorClase);
console.log('   obtenerResumen:', typeof obtenerResumen);

router.use(authMiddleware);

router.get('/estadisticas', obtenerEstadisticas);
router.get('/por-marca', obtenerPorMarca);
router.get('/por-clase', obtenerPorClase);
router.get('/resumen', obtenerResumen);

module.exports = router;