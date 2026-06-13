// src/config/email.js - Modo Desarrollo (solo consola)
require('dotenv').config();

async function enviarEmailVerificacion(email, nombre, token) {
    const urlVerificacion = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verificar-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    console.log('\n' + '='.repeat(70));
    console.log('📧 SIMULACIÓN DE EMAIL - MODO DESARROLLO');
    console.log('='.repeat(70));
    console.log(`   👤 Para: ${email}`);
    console.log(`   🏷️  Nombre: ${nombre}`);
    console.log(`   📝 Asunto: Verifica tu cuenta - Sistema de Inventario`);
    console.log(`   🔗 Link de verificación:`);
    console.log(`   ${urlVerificacion}`);
    console.log('='.repeat(70) + '\n');
    
    // Retorna true simulando éxito
    return true;
}

async function enviarEmailRecuperacion(email, nombre, token) {
    const urlReset = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    console.log('\n' + '='.repeat(70));
    console.log('📧 SIMULACIÓN DE EMAIL - MODO DESARROLLO');
    console.log('='.repeat(70));
    console.log(`   👤 Para: ${email}`);
    console.log(`   🏷️  Nombre: ${nombre}`);
    console.log(`   📝 Asunto: Recuperación de Contraseña - Sistema de Inventario`);
    console.log(`   🔗 Link de recuperación:`);
    console.log(`   ${urlReset}`);
    console.log('='.repeat(70) + '\n');
    
    return true;
}

async function enviarEmailBienvenida(email, nombre) {
    console.log('\n' + '='.repeat(70));
    console.log('📧 SIMULACIÓN DE EMAIL - MODO DESARROLLO');
    console.log('='.repeat(70));
    console.log(`   👤 Para: ${email}`);
    console.log(`   🏷️  Nombre: ${nombre}`);
    console.log(`   📝 Asunto: ¡Bienvenido al Sistema de Inventario!`);
    console.log(`   ✅ Mensaje: Tu cuenta ha sido verificada exitosamente`);
    console.log('='.repeat(70) + '\n');
    
    return true;
}

module.exports = {
    enviarEmailVerificacion,
    enviarEmailRecuperacion,
    enviarEmailBienvenida
};