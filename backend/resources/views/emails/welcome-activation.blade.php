<!-- resources/views/emails/welcome-activation.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bienvenido a Pet Spa</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
        .credentials { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
        .button:hover { background: #1d4ed8; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        .warning { color: #e74c3c; font-size: 12px; margin-top: 15px; }
        .note { font-size: 12px; color: #666; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 ¡Bienvenido a Pet Spa!</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{{ $user->nombre }} {{ $user->apellido }}</strong>,</p>
            <p>Se ha creado una cuenta para ti en el sistema de gestión <strong>Pet Spa</strong>.</p>
            
            <div class="credentials">
                <p><strong>Tus credenciales de acceso:</strong></p>
                <p>📧 <strong>Email:</strong> {{ $user->email }}</p>
                <p>🔑 <strong>Contraseña temporal:</strong> <code>{{ $plainPassword }}</code></p>
            </div>
            
            <p style="color: #e67e22;">⚠️ <strong>Importante:</strong> Esta es una contraseña temporal. Deberás cambiarla al iniciar sesión por primera vez.</p>
            
            <div style="text-align: center;">
                <a href="{{ $activationUrl }}" class="button">✅ Activar mi cuenta</a>
            </div>
            
            <p class="warning">🔒 Este enlace expirará en <strong>15 minutos</strong> por seguridad.</p>
            <p class="note">Si no solicitaste esta cuenta o no reconoces esta actividad, puedes ignorar este mensaje.</p>
        </div>
        <div class="footer">
            <p>Pet Spa - Sistema de Gestión</p>
            <p>© {{ date('Y') }} Todos los derechos reservados.</p>
            <p><small>Este es un mensaje automático, por favor no responder.</small></p>
        </div>
    </div>
</body>
</html>