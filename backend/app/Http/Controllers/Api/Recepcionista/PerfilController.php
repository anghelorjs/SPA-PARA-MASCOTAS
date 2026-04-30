<?php
// app/Http/Controllers/Api/Recepcionista/PerfilController.php

namespace App\Http\Controllers\Api\Recepcionista;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class PerfilController extends ApiController
{
    /**
     * Obtener perfil del recepcionista autenticado
     */
    public function me()
    {
        $user = Auth::user();
        $recepcionista = $user->recepcionista;
        
        // Cantidad de citas gestionadas hoy
        $citasGestionadasHoy = Cita::where('idRecepcionista', $recepcionista->idRecepcionista)
            ->whereDate('created_at', now())
            ->count();
        
        // Turno formateado para mostrar
        $turnos = [
            'matutino' => 'Matutino (09:00 - 13:00)',
            'vespertino' => 'Vespertino (14:00 - 18:00)',
            'completo' => 'Completo (09:00 - 18:00)'
        ];
        
        return $this->successResponse([
            'idUsuario' => $user->idUsuario,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'email' => $user->email,
            'telefono' => $user->telefono,
            'rol' => $user->rol,
            'turno' => $recepcionista->turno,
            'turno_descripcion' => $turnos[$recepcionista->turno] ?? 'No asignado',
            'citas_gestionadas_hoy' => $citasGestionadasHoy
        ], 'Perfil obtenido correctamente');
    }

    /**
     * Actualizar datos personales
     */
    public function update(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'sometimes|email|unique:users,email,' . $user->idUsuario . ',idUsuario'
        ]);
        
        try {
            if ($request->has('nombre')) $user->nombre = $request->nombre;
            if ($request->has('apellido')) $user->apellido = $request->apellido;
            if ($request->has('telefono')) $user->telefono = $request->telefono;
            if ($request->has('email')) $user->email = $request->email;
            $user->save();
            
            $user->refresh();
            
            return $this->successResponse([
                'idUsuario' => $user->idUsuario,
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'telefono' => $user->telefono
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
     * Obtener resumen del día para el recepcionista
     */
    public function resumenDia()
    {
        $recepcionistaId = Auth::user()->recepcionista->idRecepcionista;
        $fecha = now()->toDateString();
        
        $citasCreadasHoy = Cita::where('idRecepcionista', $recepcionistaId)
            ->whereDate('created_at', $fecha)
            ->count();
        
        $citasConfirmadasHoy = Cita::where('idRecepcionista', $recepcionistaId)
            ->whereDate('updated_at', $fecha)
            ->where('estado', 'confirmada')
            ->count();
        
        $citasCanceladasHoy = Cita::where('idRecepcionista', $recepcionistaId)
            ->whereDate('updated_at', $fecha)
            ->where('estado', 'cancelada')
            ->count();
        
        return $this->successResponse([
            'fecha' => $fecha,
            'citas_creadas' => $citasCreadasHoy,
            'citas_confirmadas' => $citasConfirmadasHoy,
            'citas_canceladas' => $citasCanceladasHoy,
            'total_gestionadas' => $citasCreadasHoy + $citasConfirmadasHoy + $citasCanceladasHoy
        ], 'Resumen del día obtenido correctamente');
    }
}