<?php
// app/Http/Controllers/Api/ForgotPasswordController.php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Mail\PasswordResetMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Rules\StrongPassword;

class ForgotPasswordController extends ApiController
{
    /**
     * Enviar enlace de restablecimiento de contraseña
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);
        
        $user = User::where('email', $request->email)->first();
        
        // Generar token
        $token = Str::random(64);
        
        // Guardar token en la tabla password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => $token, 'created_at' => now()]
        );
        
        // Enviar email
        try {
            Mail::to($user->email)->send(new PasswordResetMail($user, $token));
            return $this->successResponse(null, 'Se ha enviado un enlace de restablecimiento a tu correo electrónico');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al enviar el correo: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Validar token y restablecer contraseña
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => ['required', 'string', new StrongPassword],
            'password_confirmation' => 'required|same:password'
        ]);
        
        // Verificar token
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();
        
        if (!$resetRecord) {
            return $this->errorResponse('Token inválido o expirado', 400);
        }
        
        // Verificar expiración (15 minutos)
        $createdAt = strtotime($resetRecord->created_at);
        $now = time();
        $diffMinutes = ($now - $createdAt) / 60;
        
        if ($diffMinutes > 15) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return $this->errorResponse('El enlace ha expirado. Por favor, solicita uno nuevo.', 400);
        }
        
        // Actualizar contraseña
        $user = User::where('email', $request->email)->first();
        $user->passwordHash = Hash::make($request->password);
        $user->must_change_password = false; // Ya está cambiando a una contraseña fuerte
        $user->save();
        
        // Eliminar token usado
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        
        return $this->successResponse(null, 'Contraseña restablecida correctamente. Ahora puedes iniciar sesión.');
    }
}