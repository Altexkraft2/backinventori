// backend-inventario/src/controllers/filtros.controller.js
const { pool } = require('../config/database');

async function obtenerOpciones(req, res) {
    try {
        const [marcas] = await pool.query(`
            SELECT DISTINCT marca 
            FROM equipos 
            WHERE marca IS NOT NULL AND marca != ''
            ORDER BY marca
        `);
        
        const [clases] = await pool.query(`
            SELECT DISTINCT clase 
            FROM equipos 
            WHERE clase IS NOT NULL AND clase != ''
            ORDER BY clase
        `);
        
        const [estatus] = await pool.query(`
            SELECT DISTINCT estatus 
            FROM equipos 
            WHERE estatus IN ('Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar')
            ORDER BY estatus
        `);
        
        res.json({
            success: true,
            data: {
                marcas: marcas.map(m => m.marca),
                clases: clases.map(c => c.clase),
                estatus: estatus.map(e => e.estatus)
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { obtenerOpciones };