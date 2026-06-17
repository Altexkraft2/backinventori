// backend-inventario/src/config/email.js - Brevo (versión corregida)
const brevo = require('@getbrevo/brevo');

// Inicializar Brevo correctamente
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.ApiKeyKeys.API_KEY, process.env.BREVO_API_KEY);

const SENDER_EMAIL = process.env.EMAIL_FROM || 'tu_correo@gmail.com';
const SENDER_NAME = 'Sistema de Inventario';

async function enviarEmailVerificacion(email, nombre, token) {
    const urlVerificacion = `${process.env.FRONTEND_URL}/verificar-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Verifica tu cuenta - Sistema de Inventario';
    sendSmtpEmail.to = [{ email, name: nombre }];
    sendSmtpEmail.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    sendSmtpEmail.htmlContent = `
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
    `;

    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Email de verificación enviado a: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de verificación:', error.message);
        return false;
    }
}

async function enviarEmailRecuperacion(email, nombre, token) {
    const urlReset = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Recuperación de Contraseña - Sistema de Inventario';
    sendSmtpEmail.to = [{ email, name: nombre }];
    sendSmtpEmail.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    sendSmtpEmail.htmlContent = `
        <h2>Hola ${nombre}</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${urlReset}">Restablecer Contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
    `;

    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Email de recuperación enviado a: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de recuperación:', error.message);
        return false;
    }
}

async function enviarEmailBienvenida(email, nombre) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = '¡Bienvenido al Sistema de Inventario!';
    sendSmtpEmail.to = [{ email, name: nombre }];
    sendSmtpEmail.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    sendSmtpEmail.htmlContent = `
        <h2>¡Bienvenido ${nombre}!</h2>
        <p>Tu cuenta ha sido verificada exitosamente.</p>
        <p>Ahora puedes iniciar sesión en el Sistema de Inventario.</p>
    `;

    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
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