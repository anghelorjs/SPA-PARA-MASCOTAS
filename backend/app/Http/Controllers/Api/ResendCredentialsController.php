<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Mail\WelcomeActivationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ResendCredentialsController extends ApiController
{
    /**
     * Reenviar credenciales a un usuario (recepcionista/groomer)
     */
    public function resend(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,idUsuario',
        ]);

        $user = User::find($request->user_id);

        // Verificar que el usuario no esté ya activado
        if ($user->email_verified_at) {
            return $this->errorResponse('Este usuario ya activó su cuenta. Puede iniciar sesión normalmente.', 400);
        }

        // Verificar que sea recepcionista o groomer
        if (!in_array($user->rol, ['recepcionista', 'groomer'])) {
            return $this->errorResponse('Solo se pueden reenviar credenciales para recepcionistas y groomers.', 400);
        }

        // Generar nueva contraseña y nuevo token
        $newPassword = $this->generateRandomPassword();
        $user->passwordHash = bcrypt($newPassword);
        $user->activation_token = null;
        $user->activation_token_expires_at = null;
        $user->save();

        // Generar nuevo token de activación
        $token = $user->generateActivationToken();

        try {
            Mail::to($user->email)->send(new WelcomeActivationMail($user, $newPassword));
            
            return $this->successResponse(null, 'Se han reenviado las credenciales al correo del usuario.');
        } catch (\Exception $e) {
            Log::error('Error al reenviar credenciales: ' . $e->getMessage());
            return $this->errorResponse('Error al enviar el correo. Inténtalo nuevamente.', 500);
        }
    }

    /**
     * Generar contraseña aleatoria
     */
    private function generateRandomPassword($length = 10)
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        return substr(str_shuffle($chars), 0, $length);
    }
}