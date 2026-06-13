// backend-inventario/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { generarToken } = require('../middleware/auth');
const { enviarEmailVerificacion, enviarEmailRecuperacion, enviarEmailBienvenida } = require('../config/email');

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
            `SELECT u.*, s.nombre as sede_nombre 
             FROM usuarios u 
             LEFT JOIN sedes s ON u.sede_id = s.id 
             WHERE u.email = ?`,
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
        }
        
        const usuario = users[0];
        
        if (!usuario.activo) {
            return res.status(401).json({ success: false, error: 'Cuenta desactivada' });
        }
        
        if (!usuario.email_verificado) {
            return res.status(401).json({ success: false, error: 'Verifica tu email antes de iniciar sesión' });
        }
        
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
        }
        
        await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [usuario.id]);
        await registrarActividad(usuario.id, 'LOGIN', 'Inicio de sesión exitoso', req);
        
        const token = generarToken(usuario);
        
        res.json({
            success: true,
            data: {
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    sede_id: usuario.sede_id,
                    sede_nombre: usuario.sede_nombre
                }
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function registrar(req, res) {
    try {
        const { nombre, email, password, sede_id } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, error: 'Nombre, email y contraseña son obligatorios' });
        }
        
        const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existentes.length > 0) {
            return res.status(409).json({ success: false, error: 'Ya existe un usuario con este email' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const tokenVerificacion = crypto.randomBytes(32).toString('hex');
        
        await pool.query(
            `INSERT INTO usuarios (nombre, email, password, sede_id, token_verificacion, rol) 
             VALUES (?, ?, ?, ?, ?, 'tecnico')`,
            [nombre, email, hashedPassword, sede_id || null, tokenVerificacion]
        );
        
        await enviarEmailVerificacion(email, nombre, tokenVerificacion);
        
        res.status(201).json({
            success: true,
            message: 'Usuario registrado. Revisa tu email para verificar tu cuenta.'
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function verificarEmail(req, res) {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({ success: false, error: 'Token no proporcionado' });
        }
        
        const [users] = await pool.query(
            'SELECT id, nombre, email FROM usuarios WHERE token_verificacion = ?',
            [token]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'Token inválido o expirado' });
        }
        
        const usuario = users[0];
        
        await pool.query(
            'UPDATE usuarios SET email_verificado = 1, token_verificacion = NULL WHERE id = ?',
            [usuario.id]
        );
        
        await enviarEmailBienvenida(usuario.email, usuario.nombre);
        
        res.json({ success: true, message: 'Email verificado correctamente' });
        
    } catch (error) {
        console.error('Error verificando email:', error);
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
            return res.json({ success: true, message: 'Si el email existe, recibirás instrucciones' });
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
        
        res.json({ success: true, message: 'Si el email existe, recibirás instrucciones' });
        
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
            return res.status(400).json({ success: false, error: 'Token inválido o expirado' });
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
            await registrarActividad(req.usuario.id, 'LOGOUT', 'Cierre de sesión', req);
        }
        res.json({ success: true, message: 'Sesión cerrada correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function obtenerSedes(req, res) {
    try {
        const [sedes] = await pool.query(`
            SELECT id, nombre, direccion, telefono 
            FROM sedes 
            WHERE estado = '1' 
            ORDER BY nombre
        `);
        
        res.json({
            success: true,
            data: sedes
        });
    } catch (error) {
        console.error('Error al obtener sedes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function crearSede(req, res) {
    try {
        const { nombre, direccion, telefono } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ success: false, error: 'El nombre de la sede es obligatorio' });
        }
        
        const [existe] = await pool.query('SELECT id FROM sedes WHERE nombre = ?', [nombre]);
        if (existe.length > 0) {
            return res.status(409).json({ success: false, error: 'Ya existe una sede con ese nombre' });
        }
        
        const [result] = await pool.query(
            `INSERT INTO sedes (nombre, direccion, telefono) VALUES (?, ?, ?)`,
            [nombre, direccion || '', telefono || '']
        );
        
        res.status(201).json({
            success: true,
            message: 'Sede creada correctamente',
            data: { id: result.insertId, nombre }
        });
    } catch (error) {
        console.error('Error al crear sede:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
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
};