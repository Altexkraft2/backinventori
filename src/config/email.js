// backend-inventario/src/config/email.js
const nodemailer = require('nodemailer');

// Configuración para Outlook/Hotmail
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // IMPORTANTE: false para puerto 587 (STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
});

// Verificar conexión
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error de conexión con Outlook:', error.message);
        console.log('   Verifica EMAIL_USER y EMAIL_PASS en variables de entorno');
        console.log('   Asegúrate de que IMAP esté activado en Outlook');
    } else {
        console.log('✅ Servidor de email configurado correctamente');
        console.log(`   📧 Enviando emails desde: ${process.env.EMAIL_USER}`);
    }
});

// Función para enviar email de verificación
async function enviarEmailVerificacion(email, nombre, token) {
    const urlVerificacion = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verificar-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
        from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifica tu cuenta - Sistema de Inventario',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f8fafc; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 24px; 
                        background: #3b82f6; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 6px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Sistema de Inventario</h2>
                    </div>
                    <div class="content">
                        <h3>¡Hola ${nombre}!</h3>
                        <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el botón:</p>
                        <div style="text-align: center;">
                            <a href="${urlVerificacion}" class="button">Verificar mi cuenta</a>
                        </div>
                        <p>O copia este enlace: ${urlVerificacion}</p>
                        <p>Este enlace expirará en 24 horas.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de verificación enviado a: ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando email a ${email}:`, error.message);
        return false;
    }
}

async function enviarEmailRecuperacion(email, nombre, token) {
    const urlReset = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    const mailOptions = {
        from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Recuperación de Contraseña - Sistema de Inventario',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f8fafc; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 24px; 
                        background: #ef4444; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 6px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Recuperación de Contraseña</h2>
                    </div>
                    <div class="content">
                        <h3>Hola ${nombre},</h3>
                        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                        <div style="text-align: center;">
                            <a href="${urlReset}" class="button">Restablecer Contraseña</a>
                        </div>
                        <p>Este enlace expirará en 1 hora.</p>
                        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de recuperación enviado a: ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando email a ${email}:`, error.message);
        return false;
    }
}

async function enviarEmailBienvenida(email, nombre) {
    const mailOptions = {
        from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '¡Bienvenido al Sistema de Inventario!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f8fafc; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>¡Bienvenido!</h2>
                    </div>
                    <div class="content">
                        <h3>¡Hola ${nombre}!</h3>
                        <p>Tu cuenta ha sido verificada exitosamente.</p>
                        <p>Ahora puedes iniciar sesión en el Sistema de Inventario.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de bienvenida enviado a: ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando email a ${email}:`, error.message);
        return false;
    }
}

module.exports = {
    enviarEmailVerificacion,
    enviarEmailRecuperacion,
    enviarEmailBienvenida
};