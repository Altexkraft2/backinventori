// backend-inventario/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    login,
    registrar,
    verificarEmail,
    solicitarRecuperacion,
    resetearPassword,
    obtenerPerfil,
    cambiarPassword,
    logout,
    obtenerSedes,
    crearSede
} = require('../controllers/auth.controller');

// Rutas públicas
router.post('/login', login);
router.post('/registrar', registrar);
router.get('/verificar-email', verificarEmail);
router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.post('/resetear-password', resetearPassword);

// Rutas para sedes (públicas para registro)
router.get('/sedes', obtenerSedes);
router.post('/sedes', crearSede);

// Rutas protegidas
router.get('/perfil', authMiddleware, obtenerPerfil);
router.post('/cambiar-password', authMiddleware, cambiarPassword);
router.post('/logout', authMiddleware, logout);

module.exports = router;