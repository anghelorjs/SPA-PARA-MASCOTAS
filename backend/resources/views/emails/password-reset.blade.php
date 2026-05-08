<!-- resources/views/emails/password-reset.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Restablecer Contraseña</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #1d4ed8; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        .warning { color: #e74c3c; font-size: 12px; margin-top: 15px; }
        .note { font-size: 12px; color: #666; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 Restablecer Contraseña</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{{ $user->nombre }} {{ $user->apellido }}</strong>,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Pet Spa</strong>.</p>
            
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="button">Restablecer Contraseña</a>
            </div>
            
            <p class="warning">🔒 Este enlace expirará en <strong>15 minutos</strong> por seguridad.</p>
            <p class="note">Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña no cambiará hasta que accedas al enlace y crees una nueva.</p>
        </div>
        <div class="footer">
            <p>Pet Spa - Sistema de Gestión</p>
            <p>© {{ date('Y') }} Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>