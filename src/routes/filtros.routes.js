// src/routes/filtros.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { obtenerOpciones } = require('../controllers/filtros.controller');

// Verificar que la función existe
console.log('✅ Cargando rutas de filtros:');
console.log('   obtenerOpciones:', typeof obtenerOpciones);

router.get('/opciones', authMiddleware, obtenerOpciones);

module.exports = router;