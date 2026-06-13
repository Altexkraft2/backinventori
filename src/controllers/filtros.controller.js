// src/controllers/filtros.controller.js
const { pool } = require('../config/database');

async function obtenerOpciones(req, res) {
    try {
        let sedeFilter = '';
        let params = [];
        
        if (req.usuario && req.usuario.sede_id) {
            sedeFilter = ' AND sede_id = ?';
            params.push(req.usuario.sede_id);
        }
        
        const [marcas] = await pool.query(`
            SELECT DISTINCT marca 
            FROM equipos
            WHERE marca IS NOT NULL AND marca != ''
            ${sedeFilter}
            ORDER BY marca
        `, params);
        
        const [clases] = await pool.query(`
            SELECT DISTINCT clase 
            FROM equipos
            WHERE clase IS NOT NULL AND clase != ''
            ${sedeFilter}
            ORDER BY clase
        `, params);
        
        const [estatus] = await pool.query(`
            SELECT DISTINCT estatus 
            FROM equipos
            WHERE estatus IN ('Por Desincorporar', 'Repuesto', 'Deposito', 'Por ubicar')
            ${sedeFilter}
            ORDER BY estatus
        `, params);
        
        const [localidades] = await pool.query(`
            SELECT DISTINCT localidad 
            FROM equipos
            WHERE localidad IS NOT NULL AND localidad != ''
            ${sedeFilter}
            ORDER BY localidad
        `, params);
        
        res.json({
            success: true,
            data: {
                marcas: marcas.map(m => m.marca),
                clases: clases.map(c => c.clase),
                estatus: estatus.map(e => e.estatus),
                localidades: localidades.map(l => l.localidad)
            }
        });
        
    } catch (error) {
        console.error('Error en obtenerOpciones:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

module.exports = { obtenerOpciones };