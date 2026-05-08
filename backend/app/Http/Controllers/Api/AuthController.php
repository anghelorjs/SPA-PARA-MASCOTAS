<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Rules\StrongPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\CaptchaController;
use Carbon\Carbon;

class AuthController extends ApiController
{
    private function validateCaptcha($captchaId, $captchaInput)
    {
        $captchaController = new CaptchaController();
        return $captchaController->validateCaptcha($captchaId, $captchaInput);
    }
    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'captcha_id' => 'required|string',
            'captcha' => 'required|string',
        ]);

        // Validar captcha
        if (!$this->validateCaptcha($request->captcha_id, $request->captcha)) {
            return $this->errorResponse('Código captcha inválido', 422);
        }

        $user = User::where('email', $request->email)->first();

        // Verificar si el usuario existe y está bloqueado
        if ($user && $user->locked_until && Carbon::parse($user->locked_until)->isFuture()) {
            $minutesRemaining = ceil(Carbon::now()->diffInMinutes($user->locked_until));
            return $this->errorResponse("Demasiados intentos fallidos. Cuenta bloqueada por {$minutesRemaining} minutos.", 403);
        }

        // Si existía bloqueo expirado, reiniciar intentos
        if ($user && $user->locked_until && Carbon::parse($user->locked_until)->isPast()) {
            $user->login_attempts = 0;
            $user->locked_until = null;
            $user->save();
        }

        // Verificar credenciales
        if (!$user || !Hash::check($request->password, $user->passwordHash)) {
            // Incrementar intentos fallidos
            if ($user) {
                $user->login_attempts++;
                $remainingAttempts = 5 - $user->login_attempts;
                $user->save();
                
                // Si llega a 5 intentos, bloquear por 15 minutos
                if ($user->login_attempts >= 5) {
                    $user->locked_until = Carbon::now()->addMinutes(15);
                    $user->login_attempts = 0;
                    $user->save();
                    return $this->errorResponse(
                        'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.', 
                        403
                    );
                }
                
                // Devolver intentos restantes
                return $this->errorResponse(
                    "Credenciales incorrectas. Te quedan {$remainingAttempts} intentos antes de que la cuenta se bloquee.", 
                    401
                );
            }
            return $this->errorResponse('Credenciales incorrectas', 401);
        }

        // Verificar si el usuario está activo
        if (!$user->activo) {
            if (!$user->email_verified_at && in_array($user->rol, ['recepcionista', 'groomer'])) {
                return $this->errorResponse(
                    'Tu cuenta no está activada. Revisa tu correo electrónico para activarla.', 
                    403
                );
            }
            return $this->errorResponse('Usuario desactivado. Contacta al administrador.', 403);
        }

        // Verificar si el email está verificado (para recepcionistas/groomers)
        if (!$user->email_verified_at && in_array($user->rol, ['recepcionista', 'groomer'])) {
            return $this->errorResponse(
                'Debes activar tu cuenta primero. Revisa tu correo.', 
                403
            );
        }

        // Login exitoso - reiniciar contador de intentos
        $user->login_attempts = 0;
        $user->locked_until = null;
        $user->save();

        if (!$user->activo) {
            return $this->errorResponse('Usuario desactivado', 403);
        }

        // Verificar si el email está verificado (para recepcionistas/groomers)
        if (!$user->email_verified_at && in_array($user->rol, ['recepcionista', 'groomer'])) {
            return $this->errorResponse('Debes activar tu cuenta primero. Revisa tu correo.', 403);
        }

        // Determinar si debe cambiar contraseña
        $mustChangePassword = $user->must_change_password && $user->rol !== 'administrador';

        // Crear token de acceso (usando Laravel Sanctum)
        $token = $user->createToken('auth_token')->plainTextToken;

        // Cargar el perfil según el rol
        $perfil = null;
        switch ($user->rol) {
            case 'cliente':
                $perfil = $user->cliente;
                break;
            case 'groomer':
                $perfil = $user->groomer;
                break;
            case 'recepcionista':
                $perfil = $user->recepcionista;
                break;
            case 'administrador':
                $perfil = $user->administrador;
                break;
        }

        return $this->successResponse([
            'user' => $user,
            'perfil' => $perfil,
            'token' => $token,
            'token_type' => 'Bearer',
            'must_change_password' => $mustChangePassword,
        ], 'Login exitoso');
    }

    /**
     * Registro de nuevo cliente
     */
    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', new StrongPassword],
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'email' => $request->email,
                'passwordHash' => Hash::make($request->password),
                'telefono' => $request->telefono,
                'rol' => 'cliente',
                'activo' => true,
                'email_verified_at' => now(), // Cliente se activa automáticamente
                'must_change_password' => false,
            ]);

            $cliente = \App\Models\Cliente::create([
                'idUsuario' => $user->idUsuario,
                'direccion' => $request->direccion,
                'preferencias' => null,
                'canalContacto' => 'whatsapp',
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            return $this->successResponse([
                'user' => $user,
                'cliente' => $cliente,
                'token' => $token,
                'token_type' => 'Bearer',
            ], 'Registro exitoso', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al registrar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('No autenticado', 401);
            }
            
            $user->currentAccessToken()->delete();
            
            return $this->successResponse(null, 'Sesión cerrada exitosamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al cerrar sesión: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        switch ($user->rol) {
            case 'cliente':
                $user->load('cliente.mascotas');
                break;
            case 'groomer':
                $user->load('groomer');
                break;
            case 'recepcionista':
                $user->load('recepcionista');
                break;
            case 'administrador':
                $user->load('administrador');
                break;
        }

        return $this->successResponse($user, 'Usuario obtenido correctamente');
    }

    /**
     * Cambiar contraseña (normal, para usuarios ya autenticados)
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', new StrongPassword],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->passwordHash)) {
            return $this->errorResponse('Contraseña actual incorrecta', 401);
        }

        $user->passwordHash = Hash::make($request->new_password);
        $user->save();

        return $this->successResponse(null, 'Contraseña actualizada correctamente');
    }

    /**
     * Cambio de contraseña OBLIGATORIO (para primer inicio)
     */
    public function forceChangePassword(Request $request)
    {
        $request->validate([
            'new_password' => ['required', 'string', new StrongPassword],
        ]);

        $user = $request->user();

        if (!$user->must_change_password) {
            return $this->errorResponse('No es necesario cambiar la contraseña', 400);
        }

        $user->passwordHash = Hash::make($request->new_password);
        $user->must_change_password = false;
        $user->save();

        // Regenerar token para mantener sesión
        $user->tokens()->delete();
        $newToken = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'token' => $newToken,
            'token_type' => 'Bearer',
        ], 'Contraseña actualizada exitosamente');
    }

    
}