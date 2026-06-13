// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

function generarToken(usuario) {
    return jwt.sign(
        { 
            id: usuario.id, 
            email: usuario.email, 
            rol: usuario.rol,
            sede_id: usuario.sede_id,
            nombre: usuario.nombre
        }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
    );
}

function verificarToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verificarToken(token);
    
    if (!decoded) {
        return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
    }
    
    const [users] = await pool.query(
        'SELECT id, nombre, email, rol, sede_id, activo FROM usuarios WHERE id = ?',
        [decoded.id]
    );
    
    if (users.length === 0 || users[0].activo === 0) {
        return res.status(401).json({ success: false, error: 'Usuario no encontrado o inactivo' });
    }
    
    req.usuario = users[0];
    next();
}

function roleMiddleware(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ success: false, error: 'Acceso denegado' });
        }
        next();
    };
}

module.exports = { authMiddleware, roleMiddleware, generarToken, verificarToken };