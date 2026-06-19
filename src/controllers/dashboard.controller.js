// backend-inventario/src/controllers/dashboard.controller.js
const { pool } = require('../config/database');

async function obtenerEstadisticas(req, res) {
    try {
        const estatusPermitidos = ['Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar'];
        
        const query = `
            SELECT 
                estatus,
                COUNT(*) as total
            FROM equipos
            WHERE estatus IN (?, ?, ?, ?)
            GROUP BY estatus
            ORDER BY 
                CASE estatus
                    WHEN 'Por Desincorporar' THEN 1
                    WHEN 'Repuesto' THEN 2
                    WHEN 'Deposito' THEN 3
                    WHEN 'Por ubicar' THEN 4
                END
        `;
        
        const [results] = await pool.query(query, estatusPermitidos);
        
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
        const query = `
            SELECT 
                marca,
                estatus,
                COUNT(*) as total
            FROM equipos
            WHERE estatus IN ('Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar')
            GROUP BY marca, estatus
            ORDER BY marca, total DESC
        `;
        
        const [results] = await pool.query(query);
        
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
        const query = `
            SELECT 
                clase,
                estatus,
                COUNT(*) as total
            FROM equipos
            WHERE estatus IN ('Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar')
            GROUP BY clase, estatus
            ORDER BY clase, total DESC
        `;
        
        const [results] = await pool.query(query);
        
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
        const [porEstatus] = await pool.query(`
            SELECT estatus, COUNT(*) as total
            FROM equipos
            GROUP BY estatus ORDER BY total DESC
        `);
        
        const [topMarcas] = await pool.query(`
            SELECT marca, COUNT(*) as total
            FROM equipos
            WHERE marca IS NOT NULL AND marca != ''
            GROUP BY marca ORDER BY total DESC LIMIT 10
        `);
        
        const [topClases] = await pool.query(`
            SELECT clase, COUNT(*) as total
            FROM equipos
            WHERE clase IS NOT NULL AND clase != ''
            GROUP BY clase ORDER BY total DESC LIMIT 10
        `);
        
        const [totalGeneral] = await pool.query('SELECT COUNT(*) as total FROM equipos');
        
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