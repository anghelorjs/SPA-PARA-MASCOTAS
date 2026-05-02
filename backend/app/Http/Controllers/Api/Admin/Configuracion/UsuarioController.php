<?php
// app/Http/Controllers/Api/Admin/Configuracion/UsuarioController.php

namespace App\Http\Controllers\Api\Admin\Configuracion;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use App\Models\Administrador;
use App\Models\Recepcionista;
use App\Models\Groomer;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends ApiController
{
    /**
     * Listar usuarios del sistema
     */
    public function index(Request $request)
    {
        $query = User::with(['administrador', 'recepcionista', 'groomer', 'cliente']);
        
        // Filtro por rol
        if ($request->has('rol')) {
            $query->where('rol', $request->rol);
        }
        
        // Filtro por estado activo/inactivo
        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }
        
        // Búsqueda por nombre, email o teléfono
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
        
        // Agregar información del perfil según rol
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
            'password' => 'required|string|min:6'
        ]);
        
        DB::beginTransaction();
        
        try {
            $user = User::create([
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'email' => $request->email,
                'passwordHash' => Hash::make($request->password),
                'telefono' => $request->telefono,
                'rol' => $request->rol,
                'activo' => true
            ]);
            
            // Crear perfil según rol
            switch ($request->rol) {
                case 'administrador':
                    Administrador::create(['idUsuario' => $user->idUsuario]);
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
                    break;
            }
            
            DB::commit();
            
            return $this->successResponse($user, 'Usuario creado exitosamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear usuario: ' . $e->getMessage(), 500);
        }
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
            // Actualizar datos base
            if ($request->has('nombre')) $user->nombre = $request->nombre;
            if ($request->has('apellido')) $user->apellido = $request->apellido;
            if ($request->has('telefono')) $user->telefono = $request->telefono;
            if ($request->has('activo')) $user->activo = $request->activo;
            $user->save();
            
            // Actualizar perfil según rol
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
        
        // No permitir desactivar el propio usuario
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