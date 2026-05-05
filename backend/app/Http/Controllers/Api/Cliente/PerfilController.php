<?php
// app/Http/Controllers/Api/Cliente/PerfilController.php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use App\Models\Cliente;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class PerfilController extends ApiController
{
    /**
     * Obtener perfil del cliente autenticado
     */
    public function me()
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        // Notificaciones recientes
        $notificaciones = Notificacion::where('idCliente', $cliente->idCliente)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function($notificacion) {
                return [
                    'id' => $notificacion->idNotificacion,
                    'tipo' => $notificacion->tipo,
                    'mensaje' => $notificacion->mensaje,
                    'fecha' => $notificacion->created_at->format('d/m/Y H:i'),
                    'leida' => $notificacion->entregada
                ];
            });
        
        // Mascotas resumidas
        $mascotas = $cliente->mascotas->map(function($mascota) {
            return [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza
            ];
        });
        
        return $this->successResponse([
            'idUsuario' => $user->idUsuario,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'email' => $user->email,
            'telefono' => $user->telefono,
            'direccion' => $cliente->direccion,
            'canal_contacto' => $cliente->canalContacto,
            'mascotas' => $mascotas,
            'notificaciones' => $notificaciones
        ], 'Perfil obtenido correctamente');
    }
    
    /**
     * Actualizar datos personales del cliente
     */
    public function update(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $user->idUsuario . ',idUsuario', // ✅ Agregado
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'canal_contacto' => 'nullable|in:whatsapp,telegram,email,sms'
        ]);
        
        try {
            if ($request->has('nombre')) $user->nombre = $request->nombre;
            if ($request->has('apellido')) $user->apellido = $request->apellido;
            if ($request->has('email')) $user->email = $request->email; // ✅ Agregado
            if ($request->has('telefono')) $user->telefono = $request->telefono;
            $user->save();
            
            if ($request->has('direccion')) $cliente->direccion = $request->direccion;
            if ($request->has('canal_contacto')) $cliente->canalContacto = $request->canal_contacto;
            $cliente->save();
            
            return $this->successResponse([
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'email' => $user->email, // ✅ Incluido en la respuesta
                'telefono' => $user->telefono,
                'direccion' => $cliente->direccion,
                'canal_contacto' => $cliente->canalContacto
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
    
    /**
     * Marcar notificación como leída
     */
    public function marcarNotificacion($id)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $notificacion = Notificacion::where('idCliente', $cliente->idCliente)
            ->where('idNotificacion', $id)
            ->first();
        
        if (!$notificacion) {
            return $this->errorResponse('Notificación no encontrada', 404);
        }
        
        $notificacion->entregada = true;
        $notificacion->save();
        
        return $this->successResponse(null, 'Notificación marcada como leída');
    }
}