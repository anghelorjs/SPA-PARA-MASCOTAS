<?php
// app/Http/Controllers/Api/GoogleAuthController.php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Cliente;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends ApiController
{
    /**
     * Redirigir a Google para autenticación
     */
    public function redirectToGoogle()
    {
        $redirectUrl = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        return $this->successResponse(['url' => $redirectUrl], 'Redirigiendo a Google');
    }

    /**
     * Callback de Google después de autenticación
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Buscar usuario por google_id o email
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();
            
            if ($user) {
                // Si el usuario existe pero no tiene google_id (caso de email existente)
                if (!$user->google_id) {
                    $user->google_id = $googleUser->getId();
                    $user->save();
                }
            } else {
                // Crear nuevo usuario
                $nombrePartes = explode(' ', $googleUser->getName(), 2);
                $nombre = $nombrePartes[0];
                $apellido = $nombrePartes[1] ?? '';
                
                $user = User::create([
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'email' => $googleUser->getEmail(),
                    'passwordHash' => Hash::make(Str::random(24)),
                    'telefono' => null,
                    'rol' => 'cliente',
                    'activo' => true,
                    'email_verified_at' => now(),
                    'must_change_password' => false,
                    'google_id' => $googleUser->getId(),
                ]);
                
                // Crear perfil de cliente
                Cliente::create([
                    'idUsuario' => $user->idUsuario,
                    'direccion' => null,
                    'preferencias' => null,
                    'canalContacto' => 'whatsapp',
                ]);
            }
            
            // Generar token de acceso
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Registrar login exitoso
            \Log::info('Usuario autenticado con Google', ['user_id' => $user->idUsuario, 'email' => $user->email]);
            
            // Redirigir al frontend con el token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $redirectUrl = $frontendUrl . '/auth/google/callback?token=' . $token . '&user=' . urlencode(json_encode([
                'idUsuario' => $user->idUsuario,
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'rol' => $user->rol,
            ]));
            
            return redirect()->away($redirectUrl);
            
        } catch (\Exception $e) {
            \Log::error('Error en autenticación con Google: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away($frontendUrl . '/login?error=google_auth_failed');
        }
    }
}