<?php
// app/Http/Controllers/Api/Admin/Configuracion/UsuarioController.php

namespace App\Http\Controllers\Api\Admin\Configuracion;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use App\Models\Administrador;
use App\Models\Recepcionista;
use App\Models\Groomer;
use App\Models\Cliente;
use App\Mail\WelcomeActivationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;


class UsuarioController extends ApiController
{
    /**
     * Listar usuarios del sistema
     */
    public function index(Request $request)
    {
        $query = User::with(['administrador', 'recepcionista', 'groomer', 'cliente']);
        
        if ($request->has('rol')) {
            $query->where('rol', $request->rol);
        }
        
        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%");
            });
        }
        
        $usuarios = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));
        
        $usuarios->getCollection()->transform(function($user) {
            $user->perfil_datos = null;
            
            switch ($user->rol) {
                case 'administrador':
                    $user->perfil_datos = $user->administrador;
                    break;
                case 'recepcionista':
                    $user->perfil_datos = $user->recepcionista;
                    break;
                case 'groomer':
                    $user->perfil_datos = $user->groomer;
                    break;
                case 'cliente':
                    $user->perfil_datos = $user->cliente;
                    break;
            }
            
            return $user;
        });
        
        return $this->successResponse($usuarios, 'Usuarios obtenidos correctamente');
    }
    
    /**
     * Ver detalle de usuario
     */
    public function show($id)
    {
        $user = User::with(['administrador', 'recepcionista', 'groomer', 'cliente'])->find($id);
        
        if (!$user) {
            return $this->errorResponse('Usuario no encontrado', 404);
        }
        
        return $this->successResponse($user, 'Usuario obtenido correctamente');
    }
    
    /**
     * Crear usuario
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'rol' => 'required|in:administrador,recepcionista,groomer,cliente',
            'password' => 'nullable|string|min:6',
            'turno' => 'nullable|in:matutino,vespertino,completo',
            'especialidad' => 'nullable|string|max:100',
            'maxServiciosSimultaneos' => 'nullable|integer|min:1|max:5',
            'direccion' => 'nullable|string',
            'canalContacto' => 'nullable|in:whatsapp,telegram,email,sms',
        ]);
        
        DB::beginTransaction();
        
        try {
            // ✅ Generar contraseña aleatoria si no viene en la petición
            $plainPassword = $request->password ?? $this->generateRandomPassword();
            
            $user = User::create([
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'email' => $request->email,
                'passwordHash' => Hash::make($plainPassword),
                'telefono' => $request->telefono,
                'rol' => $request->rol,
                'activo' => false,
                'email_verified_at' => null,
                'must_change_password' => true,
            ]);
            
            // Crear perfil según rol
            switch ($request->rol) {
                case 'administrador':
                    Administrador::create(['idUsuario' => $user->idUsuario]);
                    $user->email_verified_at = now();
                    $user->must_change_password = false;
                    $user->save();
                    break;
                case 'recepcionista':
                    Recepcionista::create([
                        'idUsuario' => $user->idUsuario,
                        'turno' => $request->turno ?? 'matutino'
                    ]);
                    break;
                case 'groomer':
                    Groomer::create([
                        'idUsuario' => $user->idUsuario,
                        'especialidad' => $request->especialidad,
                        'maxServiciosSimultaneos' => $request->maxServiciosSimultaneos ?? 1
                    ]);
                    break;
                case 'cliente':
                    Cliente::create([
                        'idUsuario' => $user->idUsuario,
                        'direccion' => $request->direccion ?? null,
                        'preferencias' => null,
                        'canalContacto' => $request->canalContacto ?? 'whatsapp'
                    ]);
                    $user->activo = true;
                    $user->email_verified_at = now();
                    $user->must_change_password = false;
                    $user->save();
                    break;
            }
            
            DB::commit();

            $activationMailFailed = false;
            if (in_array($request->rol, ['recepcionista', 'groomer'], true)) {
                try {
                    Mail::to($user->email)->send(new WelcomeActivationMail($user, $plainPassword));
                } catch (\Throwable $mailException) {
                    $activationMailFailed = true;
                    try {
                        Log::warning('No se pudo enviar el correo de activacion del usuario.', [
                            'idUsuario' => $user->idUsuario,
                            'email' => $user->email,
                            'error' => $mailException->getMessage(),
                        ]);
                    } catch (\Throwable) {
                        // Evita que un problema de logging convierta el alta en un 500.
                    }
                }
            }
            
            $message = $request->rol === 'recepcionista' || $request->rol === 'groomer' 
                ? 'Usuario creado exitosamente. Se ha enviado un email de activación.' 
                : 'Usuario creado exitosamente.';
            
            if ($activationMailFailed) {
                $message = 'Usuario creado exitosamente, pero no se pudo enviar el email de activacion. Puedes reenviarlo o restablecer la contrasena.';
            }

            return $this->successResponse($user, $message, 201);
            
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear usuario: ' . $e->getMessage(), 500);
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
    
    /**
     * Actualizar usuario
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return $this->errorResponse('Usuario no encontrado', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'activo' => 'sometimes|boolean',
            'rol' => 'sometimes|in:administrador,recepcionista,groomer,cliente',
            'especialidad' => 'nullable|string', // para groomer
            'maxServiciosSimultaneos' => 'nullable|integer|min:1|max:5', // para groomer
            'turno' => 'nullable|in:matutino,vespertino,completo', // para recepcionista
            'direccion' => 'nullable|string', // para cliente
            'canalContacto' => 'nullable|in:whatsapp,telegram,email,sms' // para cliente
        ]);
        
        DB::beginTransaction();
        
        try {
            if ($request->has('nombre')) $user->nombre = $request->nombre;
            if ($request->has('apellido')) $user->apellido = $request->apellido;
            if ($request->has('telefono')) $user->telefono = $request->telefono;
            if ($request->has('activo')) $user->activo = $request->activo;
            $user->save();
            
            if ($user->rol === 'groomer' && $user->groomer) {
                if ($request->has('especialidad')) $user->groomer->especialidad = $request->especialidad;
                if ($request->has('maxServiciosSimultaneos')) $user->groomer->maxServiciosSimultaneos = $request->maxServiciosSimultaneos;
                $user->groomer->save();
            }
            
            if ($user->rol === 'recepcionista' && $user->recepcionista) {
                if ($request->has('turno')) $user->recepcionista->turno = $request->turno;
                $user->recepcionista->save();
            }
            
            if ($user->rol === 'cliente' && $user->cliente) {
                if ($request->has('direccion')) $user->cliente->direccion = $request->direccion;
                if ($request->has('canalContacto')) $user->cliente->canalContacto = $request->canalContacto;
                $user->cliente->save();
            }
            
            DB::commit();
            
            return $this->successResponse($user, 'Usuario actualizado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar usuario: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Resetear contraseña de usuario
     */
    public function resetPassword(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return $this->errorResponse('Usuario no encontrado', 404);
        }
        
        $request->validate([
            'new_password' => 'required|string|min:6'
        ]);
        
        $user->passwordHash = Hash::make($request->new_password);
        $user->save();
        
        return $this->successResponse(null, 'Contraseña restablecida correctamente');
    }
    
    /**
     * Eliminar usuario (desactivar)
     */
    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return $this->errorResponse('Usuario no encontrado', 404);
        }
        
        if (Auth::user()->idUsuario === $user->idUsuario) {
            return $this->errorResponse('No puedes desactivar tu propio usuario', 400);
        }
        
        $user->activo = false;
        $user->save();
        
        return $this->successResponse(null, 'Usuario desactivado correctamente');
    }
    
    /**
     * Obtener roles disponibles para selector
     */
    public function roles()
    {
        $roles = [
            ['id' => 'administrador', 'nombre' => 'Administrador'],
            ['id' => 'recepcionista', 'nombre' => 'Recepcionista'],
            ['id' => 'groomer', 'nombre' => 'Groomer'],
            ['id' => 'cliente', 'nombre' => 'Cliente']
        ];
        
        return $this->successResponse($roles, 'Roles obtenidos correctamente');
    }
}
