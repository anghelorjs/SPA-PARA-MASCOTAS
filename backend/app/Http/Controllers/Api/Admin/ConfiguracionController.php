<?php
// app/Http/Controllers/Api/Admin/ConfiguracionController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use App\Models\Administrador;
use App\Models\Recepcionista;
use App\Models\Groomer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ConfiguracionController extends ApiController
{
    // ==================== DATOS DEL NEGOCIO ====================
    
    /**
     * Obtener datos del negocio
     */
    public function datosNegocio()
    {
        // Estos datos podrían venir de una tabla 'configuraciones' o de archivo
        $datosNegocio = [
            'nombre_negocio' => config('app.name', 'SPA para Mascotas'),
            'logo' => config('app.logo', null),
            'telefono' => config('app.phone', '+591 12345678'),
            'direccion' => config('app.address', 'Av. Principal 123, La Paz'),
            'email_contacto' => config('app.email', 'contacto@spamascotas.com'),
            'redes_sociales' => [
                'facebook' => config('app.facebook', 'https://facebook.com/spamascotas'),
                'instagram' => config('app.instagram', 'https://instagram.com/spamascotas'),
                'whatsapp' => config('app.whatsapp', 'https://wa.me/59171234567')
            ],
            'horario_atencion' => [
                'lunes_viernes' => '09:00 - 18:00',
                'sabado' => '09:00 - 13:00',
                'domingo' => 'Cerrado'
            ]
        ];
        
        return $this->successResponse($datosNegocio, 'Datos del negocio obtenidos correctamente');
    }
    
    /**
     * Actualizar datos del negocio
     */
    public function updateDatosNegocio(Request $request)
    {
        $request->validate([
            'nombre_negocio' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'email_contacto' => 'nullable|email',
            'facebook' => 'nullable|url',
            'instagram' => 'nullable|url',
            'whatsapp' => 'nullable|url',
            'horario_apertura' => 'nullable|string',
            'horario_cierre' => 'nullable|string'
        ]);
        
        // Aquí guardarías en una tabla de configuraciones o archivo .env
        // Por ahora simulamos la actualización
        
        return $this->successResponse($request->all(), 'Datos del negocio actualizados correctamente');
    }
    
    /**
     * Subir logo del negocio
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);
        
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            return $this->successResponse(['logo_url' => asset('storage/' . $path)], 'Logo subido correctamente');
        }
        
        return $this->errorResponse('No se recibió ningún archivo', 400);
    }

    // ==================== GESTIÓN DE USUARIOS ====================
    
    /**
     * Listar usuarios del sistema
     */
    public function usuarios(Request $request)
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
                  ->orWhere('email', 'like', "%{$search}%");
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
    public function usuarioShow($id)
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
    public function usuarioStore(Request $request)
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
                    // Los clientes ya tienen otro endpoint específico
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
    public function usuarioUpdate(Request $request, $id)
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
            'turno' => 'nullable|in:matutino,vespertino,completo' // para recepcionista
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
    public function usuarioResetPassword(Request $request, $id)
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
    public function usuarioDestroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return $this->errorResponse('Usuario no encontrado', 404);
        }
        
        // No permitir eliminar el propio usuario
        if (Auth::user()->idUsuario === $user->idUsuario) {
            return $this->errorResponse('No puedes desactivar tu propio usuario', 400);
        }
        
        $user->activo = false;
        $user->save();
        
        return $this->successResponse(null, 'Usuario desactivado correctamente');
    }
}