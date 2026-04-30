<?php
// app/Http/Controllers/Api/Groomer/PerfilController.php

namespace App\Http\Controllers\Api\Groomer;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class PerfilController extends ApiController
{
    /**
     * Obtener perfil del groomer autenticado
     */
    public function me()
    {
        $user = Auth::user();
        $groomer = $user->groomer;
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        return $this->successResponse([
            'idUsuario' => $user->idUsuario,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'email' => $user->email,
            'telefono' => $user->telefono,
            'rol' => $user->rol,
            'especialidad' => $groomer->especialidad,
            'max_servicios_simultaneos' => $groomer->maxServiciosSimultaneos
        ], 'Perfil obtenido correctamente');
    }

    /**
     * Actualizar datos personales (solo teléfono puede editar el groomer)
     */
    public function update(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $groomer = $user->groomer;
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $request->validate([
            'telefono' => 'nullable|string|max:20'
            // Nombre, apellido, email, especialidad, max_servicios no son editables por el groomer
        ]);
        
        try {
            if ($request->has('telefono')) {
                $user->telefono = $request->telefono;
                $user->save();
            }
            
            return $this->successResponse([
                'idUsuario' => $user->idUsuario,
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'especialidad' => $groomer->especialidad,
                'max_servicios_simultaneos' => $groomer->maxServiciosSimultaneos
            ], 'Perfil actualizado correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar perfil: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cambiar contraseña
     */
    public function updatePassword(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        $request->validate([
            'password_actual' => 'required|string',
            'password_nuevo' => 'required|string|min:6|confirmed'
        ]);
        
        if (!Hash::check($request->password_actual, $user->passwordHash)) {
            return $this->errorResponse('La contraseña actual es incorrecta', 401);
        }
        
        $user->passwordHash = Hash::make($request->password_nuevo);
        $user->save();
        
        return $this->successResponse(null, 'Contraseña actualizada correctamente');
    }
}