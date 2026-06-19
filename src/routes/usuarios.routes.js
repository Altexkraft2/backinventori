// backend-inventario/src/routes/usuarios.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    resetearPassword,
    eliminarUsuario
} = require('../controllers/usuarios.controller');

// Todas las rutas requieren autenticación y rol admin
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/', listarUsuarios);
router.get('/:id', obtenerUsuario);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.patch('/:id/reset-password', resetearPassword);
router.delete('/:id', eliminarUsuario);

module.exports = router;