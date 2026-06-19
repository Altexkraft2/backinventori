// backend-inventario/src/controllers/usuarios.controller.js
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function listarUsuarios(req, res) {
    try {
        const [rows] = await pool.query(`
            SELECT id, nombre, email, rol, activo, ultimo_login, fecha_registro 
            FROM usuarios 
            ORDER BY id
        `);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error listando usuarios:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function obtenerUsuario(req, res) {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT id, nombre, email, rol, activo, ultimo_login, fecha_registro 
            FROM usuarios 
            WHERE id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function crearUsuario(req, res) {
    try {
        const { nombre, email, password, rol } = req.body;
        
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ success: false, error: 'No tienes permisos para crear usuarios' });
        }
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, error: 'Nombre, email y contraseña son obligatorios' });
        }
        
        const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(409).json({ success: false, error: 'Ya existe un usuario con este email' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            `INSERT INTO usuarios (nombre, email, password, rol, activo) 
             VALUES (?, ?, ?, ?, 1)`,
            [nombre, email, hashedPassword, rol || 'tecnico']
        );
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: { id: result.insertId, nombre, email }
        });
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function actualizarUsuario(req, res) {
    try {
        const { id } = req.params;
        const { nombre, email, rol, activo } = req.body;
        
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ success: false, error: 'No tienes permisos para actualizar usuarios' });
        }
        
        if (id == 1) {
            return res.status(403).json({ success: false, error: 'No puedes modificar al administrador principal' });
        }
        
        const [existe] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        
        await pool.query(
            `UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?`,
            [nombre, email, rol, activo, id]
        );
        
        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function resetearPassword(req, res) {
    try {
        const { id } = req.params;
        const { nueva_password } = req.body;
        
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ success: false, error: 'No tienes permisos para restablecer contraseñas' });
        }
        
        if (id == 1) {
            return res.status(403).json({ success: false, error: 'No puedes restablecer la contraseña del administrador principal' });
        }
        
        if (!nueva_password || nueva_password.length < 6) {
            return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' });
        }
        
        const [existe] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        
        const hashedPassword = await bcrypt.hash(nueva_password, 10);
        
        await pool.query(
            `UPDATE usuarios SET password = ? WHERE id = ?`,
            [hashedPassword, id]
        );
        
        res.json({ success: true, message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        console.error('Error restableciendo contraseña:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function eliminarUsuario(req, res) {
    try {
        const { id } = req.params;
        
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ success: false, error: 'No tienes permisos para eliminar usuarios' });
        }
        
        if (id == 1) {
            return res.status(403).json({ success: false, error: 'No puedes eliminar al administrador principal' });
        }
        
        if (id == req.usuario.id) {
            return res.status(403).json({ success: false, error: 'No puedes eliminar tu propia cuenta' });
        }
        
        const [existe] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        
        await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
        
        res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    resetearPassword,
    eliminarUsuario
};