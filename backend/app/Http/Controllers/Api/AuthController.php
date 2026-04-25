<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends ApiController
{
    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->passwordHash)) {
            return $this->errorResponse('Credenciales incorrectas', 401);
        }

        if (!$user->activo) {
            return $this->errorResponse('Usuario desactivado', 403);
        }

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
            'password' => 'required|string|min:6',
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
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Sesión cerrada exitosamente');
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        // Cargar el perfil según el rol
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
     * Cambiar contraseña
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->passwordHash)) {
            return $this->errorResponse('Contraseña actual incorrecta', 401);
        }

        $user->passwordHash = Hash::make($request->new_password);
        $user->save();

        return $this->successResponse(null, 'Contraseña actualizada correctamente');
    }
}