// backend-inventario/src/config/email.js - Usando Fetch Nativo (Node 22)

const API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.EMAIL_FROM || 'tu_correo@gmail.com';
const SENDER_NAME = 'Sistema de Inventario';
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Función base para enviar correos a la API de Brevo mediante HTTP
 */
async function sendBrevoEmail(subject, toEmail, toName, htmlContent) {
    try {
        const response = await fetch(BREVO_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': API_KEY
            },
            body: JSON.stringify({
                sender: { email: SENDER_EMAIL, name: SENDER_NAME },
                to: [{ email: toEmail, name: toName }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Error desde la API de Brevo:', JSON.stringify(data, null, 2));
            return false;
        }

        console.log(`✅ Email enviado a: ${toEmail}`);
        console.log(`   ID: ${data.messageId}`);
        return true;

    } catch (error) {
        console.error('❌ Error de conexión enviando email:', error.message);
        return false;
    }
}

// --- Funciones específicas ---

async function enviarEmailVerificacion(email, nombre, token) {
    const urlVerificacion = `${process.env.FRONTEND_URL}/verificar-email?token=${token}&email=${encodeURIComponent(email)}`;
    const subject = 'Verifica tu cuenta - Sistema de Inventario';
    
    const htmlContent = `
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
                    <p>O copia este enlace: <br> ${urlVerificacion}</p>
                    <p>Este enlace expirará en 24 horas.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendBrevoEmail(subject, email, nombre, htmlContent);
}

async function enviarEmailRecuperacion(email, nombre, token) {
    const urlReset = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = 'Recuperación de Contraseña - Sistema de Inventario';
    
    const htmlContent = `
        <h2>Hola ${nombre}</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${urlReset}">Restablecer Contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
    `;

    return await sendBrevoEmail(subject, email, nombre, htmlContent);
}

async function enviarEmailBienvenida(email, nombre) {
    const subject = '¡Bienvenido al Sistema de Inventario!';
    
    const htmlContent = `
        <h2>¡Bienvenido ${nombre}!</h2>
        <p>Tu cuenta ha sido verificada exitosamente.</p>
        <p>Ahora puedes iniciar sesión en el Sistema de Inventario.</p>
    `;

    return await sendBrevoEmail(subject, email, nombre, htmlContent);
}

module.exports = {
    enviarEmailVerificacion,
    enviarEmailRecuperacion,
    enviarEmailBienvenida
};