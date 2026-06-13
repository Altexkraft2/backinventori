// src/routes/equipos.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
    listarEquipos,
    obtenerEquipo,
    crearEquipo,
    actualizarEquipo,
    cambiarEstatus,
    eliminarEquipo
} = require('../controllers/equipos.controller');

// Verificar que todas las funciones existen
console.log('✅ Cargando rutas de equipos:');
console.log('   listarEquipos:', typeof listarEquipos);
console.log('   obtenerEquipo:', typeof obtenerEquipo);
console.log('   crearEquipo:', typeof crearEquipo);
console.log('   actualizarEquipo:', typeof actualizarEquipo);
console.log('   cambiarEstatus:', typeof cambiarEstatus);
console.log('   eliminarEquipo:', typeof eliminarEquipo);

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', listarEquipos);
router.get('/:serial', obtenerEquipo);
router.post('/', crearEquipo);
router.put('/:serial', actualizarEquipo);
router.patch('/:serial/estatus', cambiarEstatus);
router.delete('/:serial', roleMiddleware(['admin']), eliminarEquipo);

module.exports = router;