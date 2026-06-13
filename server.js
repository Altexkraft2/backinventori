// server.js
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/database');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const equiposRoutes = require('./src/routes/equipos.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const filtrosRoutes = require('./src/routes/filtros.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ENDPOINTS PÚBLICOS
// ============================================

app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: '✅ API de Inventario funcionando',
        version: '2.0.0',
        fecha: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            equipos: '/api/equipos',
            dashboard: '/api/dashboard',
            filtros: '/api/filtros'
        }
    });
});

app.get('/test-db', async (req, res) => {
    try {
        const { pool } = require('./src/config/database');
        const [rows] = await pool.query('SELECT 1 + 1 as resultado');
        res.json({ 
            success: true, 
            message: 'Conexión a Base de Datos exitosa',
            resultado: rows[0].resultado 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// RUTAS DE LA API
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/filtros', filtrosRoutes);

// ============================================
// INICIAR EL SERVIDOR
// ============================================

async function startServer() {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.error('⚠️  No se pudo conectar a la base de datos');
        process.exit(1);
    }
    
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 SERVIDOR INICIADO CORRECTAMENTE');
        console.log('='.repeat(50));
        console.log(`📡 URL: http://localhost:${PORT}`);
        console.log('\n📋 ENDPOINTS DISPONIBLES:');
        console.log('-'.repeat(50));
        console.log('🏠 PÚBLICOS:');
        console.log(`   GET  /                                    - Información del API`);
        console.log(`   GET  /test-db                             - Probar conexión a BD`);
        console.log('\n🔐 AUTENTICACIÓN:');
        console.log(`   POST /api/auth/login                      - Iniciar sesión`);
        console.log(`   POST /api/auth/registrar                  - Registrar usuario`);
        console.log(`   GET  /api/auth/verificar-email            - Verificar email`);
        console.log(`   POST /api/auth/solicitar-recuperacion     - Recuperar contraseña`);
        console.log(`   POST /api/auth/resetear-password          - Resetear contraseña`);
        console.log(`   GET  /api/auth/perfil                     - Obtener perfil`);
        console.log(`   POST /api/auth/cambiar-password           - Cambiar contraseña`);
        console.log(`   POST /api/auth/logout                     - Cerrar sesión`);
        console.log('\n📊 DASHBOARD:');
        console.log(`   GET  /api/dashboard/estadisticas          - Conteos por estatus`);
        console.log(`   GET  /api/dashboard/por-marca             - Estadísticas por marca`);
        console.log(`   GET  /api/dashboard/por-clase             - Estadísticas por clase`);
        console.log(`   GET  /api/dashboard/resumen               - Resumen completo`);
        console.log('\n📦 EQUIPOS:');
        console.log(`   GET  /api/equipos                         - Listar equipos`);
        console.log(`   GET  /api/equipos/:serial                 - Ver un equipo`);
        console.log(`   POST /api/equipos                         - Crear equipo`);
        console.log(`   PUT  /api/equipos/:serial                 - Actualizar equipo`);
        console.log(`   PATCH/api/equipos/:serial/estatus         - Cambiar estatus`);
        console.log(`   DELETE /api/equipos/:serial               - Eliminar equipo`);
        console.log('\n🔍 FILTROS:');
        console.log(`   GET  /api/filtros/opciones                - Opciones para filtros`);
        console.log('='.repeat(50));
    });
}

startServer();