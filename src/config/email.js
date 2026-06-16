// backend-inventario/src/config/email.js
const { Resend } = require('resend');

// Inicializar Resend con tu API Key
const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarEmailVerificacion(email, nombre, token) {
    const urlVerificacion = `${process.env.FRONTEND_URL}/verificar-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Verifica tu cuenta - Sistema de Inventario',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px; }
                        .button { 
                            display: inline-block; 
                            padding: 12px 24px; 
                            background: #3b82f6; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 6px;
                            margin: 20px 0;
                        }
                        .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Sistema de Inventario</h2>
                        </div>
                        <div class="content">
                            <h3>¡Hola ${nombre}!</h3>
                            <p>Gracias por registrarte en el Sistema de Inventario.</p>
                            <p>Para activar tu cuenta, haz clic en el siguiente botón:</p>
                            <div style="text-align: center;">
                                <a href="${urlVerificacion}" class="button">Verificar mi cuenta</a>
                            </div>
                            <p>O copia y pega este enlace en tu navegador:</p>
                            <p style="background: #e2e8f0; padding: 10px; border-radius: 5px; word-break: break-all;">${urlVerificacion}</p>
                            <p><strong>⚠️ Este enlace expirará en 24 horas.</strong></p>
                            <p>Si no solicitaste este registro, puedes ignorar este mensaje.</p>
                        </div>
                        <div class="footer">
                            <p>Sistema de Inventario - Control de Activos Tecnológicos</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('❌ Error enviando email de verificación:', error);
            return false;
        }

        console.log(`✅ Email de verificación enviado a: ${email}`);
        console.log(`   ID: ${data?.id}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de verificación:', error.message);
        return false;
    }
}

async function enviarEmailRecuperacion(email, nombre, token) {
    const urlReset = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Recuperación de Contraseña - Sistema de Inventario',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px; }
                        .button { 
                            display: inline-block; 
                            padding: 12px 24px; 
                            background: #ef4444; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 6px;
                            margin: 20px 0;
                        }
                        .warning { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 15px 0; }
                        .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; }
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
                            <p>O copia y pega este enlace en tu navegador:</p>
                            <p style="background: #e2e8f0; padding: 10px; border-radius: 5px; word-break: break-all;">${urlReset}</p>
                            <div class="warning">
                                <strong>⚠️ Importante:</strong>
                                <ul style="margin: 10px 0 0 20px;">
                                    <li>Este enlace expirará en <strong>1 hora</strong></li>
                                    <li>Si no solicitaste este cambio, ignora este mensaje</li>
                                    <li>Tu contraseña no cambiará hasta que hagas clic en el enlace</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Sistema de Inventario - Control de Activos Tecnológicos</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('❌ Error enviando email de recuperación:', error);
            return false;
        }

        console.log(`✅ Email de recuperación enviado a: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de recuperación:', error.message);
        return false;
    }
}

async function enviarEmailBienvenida(email, nombre) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: '¡Bienvenido al Sistema de Inventario!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px; }
                        .features { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>¡Bienvenido al Sistema!</h2>
                        </div>
                        <div class="content">
                            <h3>¡Hola ${nombre}!</h3>
                            <p>Tu cuenta ha sido <strong>verificada exitosamente</strong>.</p>
                            <p>Ahora puedes acceder al <strong>Sistema de Inventario</strong> con tu email y contraseña.</p>
                            <div class="features">
                                <h4>Desde el sistema podrás:</h4>
                                <ul>
                                    <li>✅ Gestionar equipos de tu sede</li>
                                    <li>✅ Consultar inventario en tiempo real</li>
                                    <li>✅ Exportar reportes a Excel</li>
                                    <li>✅ Realizar seguimiento de equipos</li>
                                </ul>
                            </div>
                            <p>Si tienes alguna duda, contacta al administrador del sistema.</p>
                        </div>
                        <div class="footer">
                            <p>Sistema de Inventario - Control de Activos Tecnológicos</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('❌ Error enviando email de bienvenida:', error);
            return false;
        }

        console.log(`✅ Email de bienvenida enviado a: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de bienvenida:', error.message);
        return false;
    }
}

module.exports = {
    enviarEmailVerificacion,
    enviarEmailRecuperacion,
    enviarEmailBienvenida
};