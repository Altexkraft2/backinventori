// src/controllers/dashboard.controller.js
const { pool } = require('../config/database');

async function obtenerEstadisticas(req, res) {
    try {
        const estatusPermitidos = ['Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar'];
        
        let query = `
            SELECT 
                estatus,
                COUNT(*) as total
            FROM equipos
            WHERE estatus IN (?, ?, ?, ?)
        `;
        let params = [...estatusPermitidos];
        
        if (req.usuario && req.usuario.sede_id) {
            query += ' AND sede_id = ?';
            params.push(req.usuario.sede_id);
        }
        
        query += ` GROUP BY estatus ORDER BY 
            CASE estatus
                WHEN 'Por Desincorporar' THEN 1
                WHEN 'Repuesto' THEN 2
                WHEN 'Deposito' THEN 3
                WHEN 'Por ubicar' THEN 4
            END`;
        
        const [results] = await pool.query(query, params);
        
        const estadisticas = {};
        estatusPermitidos.forEach(estado => {
            const found = results.find(r => r.estatus === estado);
            estadisticas[estado] = found ? found.total : 0;
        });
        
        const totalGeneral = Object.values(estadisticas).reduce((a, b) => a + b, 0);
        
        res.json({
            success: true,
            data: {
                por_estatus: estadisticas,
                total_general: totalGeneral,
                ultima_actualizacion: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error en dashboard:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function obtenerPorMarca(req, res) {
    try {
        let query = `
            SELECT 
                marca,
                estatus,
                COUNT(*) as total
            FROM equipos
            WHERE estatus IN ('Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar')
        `;
        let params = [];
        
        if (req.usuario && req.usuario.sede_id) {
            query += ' AND sede_id = ?';
            params.push(req.usuario.sede_id);
        }
        
        query += ' GROUP BY marca, estatus ORDER BY marca, total DESC';
        
        const [results] = await pool.query(query, params);
        
        const porMarca = {};
        results.forEach(item => {
            if (!porMarca[item.marca]) {
                porMarca[item.marca] = { total: 0, por_estatus: {} };
            }
            porMarca[item.marca].total += item.total;
            porMarca[item.marca].por_estatus[item.estatus] = item.total;
        });
        
        res.json({ success: true, data: porMarca });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function obtenerPorClase(req, res) {
    try {
        let query = `
            SELECT 
                clase,
                estatus,
                COUNT(*) as total
            FROM equipos
            WHERE estatus IN ('Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar')
        `;
        let params = [];
        
        if (req.usuario && req.usuario.sede_id) {
            query += ' AND sede_id = ?';
            params.push(req.usuario.sede_id);
        }
        
        query += ' GROUP BY clase, estatus ORDER BY clase, total DESC';
        
        const [results] = await pool.query(query, params);
        
        const porClase = {};
        results.forEach(item => {
            if (!porClase[item.clase]) {
                porClase[item.clase] = { total: 0, por_estatus: {} };
            }
            porClase[item.clase].total += item.total;
            porClase[item.clase].por_estatus[item.estatus] = item.total;
        });
        
        res.json({ success: true, data: porClase });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function obtenerResumen(req, res) {
    try {
        let sedeFilter = '';
        let params = [];
        
        if (req.usuario && req.usuario.sede_id) {
            sedeFilter = ' WHERE sede_id = ?';
            params.push(req.usuario.sede_id);
        }
        
        const [porEstatus] = await pool.query(`
            SELECT estatus, COUNT(*) as total
            FROM equipos${sedeFilter}
            GROUP BY estatus ORDER BY total DESC
        `, params);
        
        const [topMarcas] = await pool.query(`
            SELECT marca, COUNT(*) as total
            FROM equipos${sedeFilter}
            WHERE marca IS NOT NULL AND marca != ''
            GROUP BY marca ORDER BY total DESC LIMIT 10
        `, params);
        
        const [topClases] = await pool.query(`
            SELECT clase, COUNT(*) as total
            FROM equipos${sedeFilter}
            WHERE clase IS NOT NULL AND clase != ''
            GROUP BY clase ORDER BY total DESC LIMIT 10
        `, params);
        
        const [totalGeneral] = await pool.query(`SELECT COUNT(*) as total FROM equipos${sedeFilter}`, params);
        
        res.json({
            success: true,
            data: {
                total_general: totalGeneral[0].total,
                por_estatus: porEstatus,
                top_marcas: topMarcas,
                top_clases: topClases,
                ultima_actualizacion: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    obtenerEstadisticas,
    obtenerPorMarca,
    obtenerPorClase,
    obtenerResumen
};