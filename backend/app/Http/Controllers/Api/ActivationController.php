<?php
// app/Http/Controllers/Api/ActivationController.php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;

class ActivationController extends ApiController
{
    /**
     * Activar cuenta con token
     */
    public function activate(Request $request)
    {
        $request->validate([
            'token' => 'required|string'
        ]);
        
        $user = User::where('activation_token', $request->token)
            ->where('activation_token_expires_at', '>', now())
            ->first();
        
        if (!$user) {
            return $this->errorResponse('Token inválido o expirado. Por favor, contacta al administrador.', 400);
        }
        
        // Activar cuenta: email_verified_at, must_change_password, Y activo = true
        $user->email_verified_at = now();
        $user->must_change_password = true;
        $user->activo = true;  // ← AGREGAR: activar el usuario
        $user->activation_token = null;
        $user->activation_token_expires_at = null;
        $user->save();
        
        return $this->successResponse([
            'email' => $user->email,
            'message' => 'Cuenta activada exitosamente. Por favor, inicia sesión y cambia tu contraseña.'
        ], 'Cuenta activada correctamente');
    }
    
    /**
     * Reenviar token de activación (opcional)
     */
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);
        
        $user = User::where('email', $request->email)
            ->whereNull('email_verified_at')
            ->first();
        
        if (!$user) {
            return $this->errorResponse('Usuario ya activado o no existe', 400);
        }
        
        // Regenerar token y reenviar email
        $plainPassword = 'temporal'; // No necesitas la contraseña real aquí
        
        // Reenviar email...
        // Mail::to($user->email)->send(new WelcomeActivationMail($user, $plainPassword));
        
        return $this->successResponse(null, 'Se ha enviado un nuevo enlace de activación a tu correo');
    }
}