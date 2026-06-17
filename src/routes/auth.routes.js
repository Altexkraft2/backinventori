// backend-inventario/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    login,
    solicitarRecuperacion,
    resetearPassword,
    obtenerPerfil,
    cambiarPassword,
    logout
} = require('../controllers/auth.controller');

// Rutas publicas
router.post('/login', login);
router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.post('/resetear-password', resetearPassword);

// Rutas protegidas
router.get('/perfil', authMiddleware, obtenerPerfil);
router.post('/cambiar-password', authMiddleware, cambiarPassword);
router.post('/logout', authMiddleware, logout);

module.exports = router;