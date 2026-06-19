// backend-inventario/src/controllers/equipos.controller.js
const { pool } = require('../config/database');

async function listarEquipos(req, res) {
    try {
        const { 
            estatus, 
            marca, 
            clase, 
            busqueda, 
            limit = 50, 
            offset = 0 
        } = req.query;
        
        let query = 'SELECT * FROM equipos WHERE 1=1';
        let params = [];
        
        if (estatus) {
            query += ' AND estatus = ?';
            params.push(estatus);
        } else {
            query += ' AND estatus IN (?, ?, ?, ?)';
            params.push('Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar');
        }
        
        if (marca) {
            query += ' AND marca = ?';
            params.push(marca);
        }
        
        if (clase) {
            query += ' AND clase = ?';
            params.push(clase);
        }
        
        if (busqueda) {
            query += ' AND (serial LIKE ? OR marca LIKE ? OR modelo LIKE ? OR descripcion LIKE ?)';
            const searchTerm = `%${busqueda}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        query += ' ORDER BY fecha_actualizacion DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [rows] = await pool.query(query, params);
        
        let countQuery = 'SELECT COUNT(*) as total FROM equipos WHERE 1=1';
        let countParams = [];
        
        if (estatus) {
            countQuery += ' AND estatus = ?';
            countParams.push(estatus);
        } else {
            countQuery += ' AND estatus IN (?, ?, ?, ?)';
            countParams.push('Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar');
        }
        
        if (marca) {
            countQuery += ' AND marca = ?';
            countParams.push(marca);
        }
        
        if (clase) {
            countQuery += ' AND clase = ?';
            countParams.push(clase);
        }
        
        if (busqueda) {
            countQuery += ' AND (serial LIKE ? OR marca LIKE ? OR modelo LIKE ? OR descripcion LIKE ?)';
            const searchTerm = `%${busqueda}%`;
            countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        
        res.json({
            success: true,
            data: rows,
            pagination: {
                total: countResult[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Error al listar equipos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function obtenerEquipo(req, res) {
    try {
        const { serial } = req.params;
        const [rows] = await pool.query('SELECT * FROM equipos WHERE serial = ?', [serial]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: `No se encontró un equipo con serial: ${serial}` });
        }
        
        res.json({ success: true, data: rows[0] });
        
    } catch (error) {
        console.error('Error al obtener equipo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function crearEquipo(req, res) {
    try {
        const {
            serial,
            clase,
            codigo_inventario,
            estatus,
            marca,
            modelo,
            descripcion,
            pabi,
            observacion,
            ram,
            disco_duro,
            procesador,
            sistema_operativo
        } = req.body;
        
        if (!serial) {
            return res.status(400).json({ success: false, error: 'El campo "serial" es obligatorio' });
        }
        
        if (!estatus) {
            return res.status(400).json({ success: false, error: 'El campo "estatus" es obligatorio' });
        }
        
        const [existe] = await pool.query('SELECT serial FROM equipos WHERE serial = ?', [serial]);
        if (existe.length > 0) {
            return res.status(409).json({ success: false, error: `Ya existe un equipo con el serial: ${serial}` });
        }
        
        const query = `
            INSERT INTO equipos 
            (serial, clase, codigo_inventario, estatus, marca, modelo, descripcion, pabi, observacion,
             ram, disco_duro, procesador, sistema_operativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [
            serial, 
            clase, 
            codigo_inventario, 
            estatus, 
            marca, 
            modelo, 
            descripcion, 
            pabi, 
            observacion,
            ram || null, 
            disco_duro || null, 
            procesador || null, 
            sistema_operativo || null
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Equipo creado exitosamente',
            data: { id: result.insertId, serial }
        });
        
    } catch (error) {
        console.error('Error al crear equipo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function actualizarEquipo(req, res) {
    try {
        const { serial } = req.params;
        const {
            clase,
            codigo_inventario,
            estatus,
            marca,
            modelo,
            descripcion,
            pabi,
            observacion,
            ram,
            disco_duro,
            procesador,
            sistema_operativo
        } = req.body;
        
        const [existe] = await pool.query('SELECT serial FROM equipos WHERE serial = ?', [serial]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, error: `No existe un equipo con serial: ${serial}` });
        }
        
        const query = `
            UPDATE equipos SET
                clase = ?, 
                codigo_inventario = ?, 
                estatus = ?, 
                marca = ?, 
                modelo = ?,
                descripcion = ?, 
                pabi = ?, 
                observacion = ?,
                ram = ?, 
                disco_duro = ?, 
                procesador = ?, 
                sistema_operativo = ?
            WHERE serial = ?
        `;
        
        await pool.query(query, [
            clase, 
            codigo_inventario, 
            estatus, 
            marca, 
            modelo,
            descripcion, 
            pabi, 
            observacion,
            ram || null, 
            disco_duro || null, 
            procesador || null, 
            sistema_operativo || null,
            serial
        ]);
        
        res.json({ success: true, message: `Equipo ${serial} actualizado exitosamente` });
        
    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function cambiarEstatus(req, res) {
    try {
        const { serial } = req.params;
        const { estatus, observacion } = req.body;
        
        const estatusPermitidos = [
            'Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar',
            'Instalado', 'Desincorporado', 'Eliminado', 'Extraviado', 'Sin ubicar'
        ];
        
        if (!estatus) {
            return res.status(400).json({ success: false, error: 'El campo "estatus" es obligatorio' });
        }
        
        if (!estatusPermitidos.includes(estatus)) {
            return res.status(400).json({ success: false, error: `Estatus no válido` });
        }
        
        const [existe] = await pool.query('SELECT serial FROM equipos WHERE serial = ?', [serial]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, error: `No existe un equipo con serial: ${serial}` });
        }
        
        let query = 'UPDATE equipos SET estatus = ?';
        let params = [estatus];
        
        if (observacion) {
            query += ', observacion = CONCAT(observacion, ?, ?)';
            params.push('\n', `[${new Date().toISOString()}] Cambio de estatus a: ${estatus} - ${observacion}`);
        }
        
        query += ' WHERE serial = ?';
        params.push(serial);
        
        await pool.query(query, params);
        
        res.json({ success: true, message: `Estatus actualizado a "${estatus}" para el equipo ${serial}` });
        
    } catch (error) {
        console.error('Error al actualizar estatus:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function eliminarEquipo(req, res) {
    try {
        const { serial } = req.params;
        
        const [existe] = await pool.query('SELECT serial FROM equipos WHERE serial = ?', [serial]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, error: `No existe un equipo con serial: ${serial}` });
        }
        
        await pool.query('DELETE FROM equipos WHERE serial = ?', [serial]);
        
        res.json({ success: true, message: `Equipo ${serial} eliminado del inventario` });
        
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    listarEquipos,
    obtenerEquipo,
    crearEquipo,
    actualizarEquipo,
    cambiarEstatus,
    eliminarEquipo
};