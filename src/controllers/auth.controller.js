// backend-inventario/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { generarToken } = require('../middleware/auth');
const { enviarEmailRecuperacion } = require('../config/email');

async function registrarActividad(usuario_id, accion, detalles, req) {
    try {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        await pool.query(
            `INSERT INTO logs_actividad (usuario_id, accion, detalles, ip, user_agent) 
             VALUES (?, ?, ?, ?, ?)`,
            [usuario_id, accion, detalles, ip, userAgent]
        );
    } catch (error) {
        console.error('Error registrando actividad:', error);
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email y contraseña son obligatorios' 
            });
        }
        
        const [users] = await pool.query(
            `SELECT * FROM usuarios WHERE email = ?`,
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
        }
        
        const usuario = users[0];
        
        if (!usuario.activo) {
            return res.status(401).json({ success: false, error: 'Cuenta desactivada' });
        }
        
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
        }
        
        await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [usuario.id]);
        await registrarActividad(usuario.id, 'LOGIN', 'Inicio de sesion exitoso', req);
        
        const token = generarToken(usuario);
        
        res.json({
            success: true,
            data: {
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function solicitarRecuperacion(req, res) {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email es obligatorio' });
        }
        
        const [users] = await pool.query('SELECT id, nombre FROM usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.json({ success: true, message: 'Si el email existe, recibiras instrucciones' });
        }
        
        const usuario = users[0];
        const tokenRecuperacion = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date();
        expiracion.setHours(expiracion.getHours() + 1);
        
        await pool.query(
            'UPDATE usuarios SET token_recuperacion = ?, token_recuperacion_expiracion = ? WHERE id = ?',
            [tokenRecuperacion, expiracion, usuario.id]
        );
        
        await enviarEmailRecuperacion(email, usuario.nombre, tokenRecuperacion);
        
        res.json({ success: true, message: 'Si el email existe, recibiras instrucciones' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function resetearPassword(req, res) {
    try {
        const { token, nueva_password } = req.body;
        
        if (!token || !nueva_password) {
            return res.status(400).json({ success: false, error: 'Token y nueva contraseña son obligatorios' });
        }
        
        if (nueva_password.length < 6) {
            return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' });
        }
        
        const [users] = await pool.query(
            `SELECT id FROM usuarios 
             WHERE token_recuperacion = ? AND token_recuperacion_expiracion > NOW()`,
            [token]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ success: false, error: 'Token invalido o expirado' });
        }
        
        const hashedPassword = await bcrypt.hash(nueva_password, 10);
        
        await pool.query(
            `UPDATE usuarios 
             SET password = ?, token_recuperacion = NULL, token_recuperacion_expiracion = NULL 
             WHERE id = ?`,
            [hashedPassword, users[0].id]
        );
        
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function obtenerPerfil(req, res) {
    res.json({ success: true, data: req.usuario });
}

async function cambiarPassword(req, res) {
    try {
        const { password_actual, nueva_password } = req.body;
        const usuario_id = req.usuario.id;
        
        const [users] = await pool.query('SELECT password FROM usuarios WHERE id = ?', [usuario_id]);
        const passwordValida = await bcrypt.compare(password_actual, users[0].password);
        
        if (!passwordValida) {
            return res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
        }
        
        if (nueva_password.length < 6) {
            return res.status(400).json({ success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }
        
        const hashedPassword = await bcrypt.hash(nueva_password, 10);
        await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, usuario_id]);
        
        await registrarActividad(usuario_id, 'CAMBIO_PASSWORD', 'Cambio de contraseña', req);
        
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function logout(req, res) {
    try {
        if (req.usuario) {
            await registrarActividad(req.usuario.id, 'LOGOUT', 'Cierre de sesion', req);
        }
        res.json({ success: true, message: 'Sesion cerrada correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    login,
    solicitarRecuperacion,
    resetearPassword,
    obtenerPerfil,
    cambiarPassword,
    logout
};