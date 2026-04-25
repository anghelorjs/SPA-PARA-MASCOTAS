<?php
// app/Http/Controllers/Api/Admin/PerfilController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Reporte;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class PerfilController extends ApiController
{
    /**
     * Obtener perfil del administrador autenticado
     */
    public function me()
    {
        $user = Auth::user();
        
        $admin = $user->administrador;
        
        // Historial de reportes generados por este admin
        $reportes = Reporte::where('idAdministrador', $admin->idAdministrador)
            ->orderBy('generadoEn', 'desc')
            ->limit(10)
            ->get()
            ->map(function($reporte) {
                return [
                    'idReporte' => $reporte->idReporte,
                    'tipoReporte' => $reporte->tipoReporte,
                    'fechaGenerado' => $reporte->generadoEn->format('Y-m-d H:i'),
                    'fechaDesde' => $reporte->fechaDesde->format('Y-m-d'),
                    'fechaHasta' => $reporte->fechaHasta->format('Y-m-d')
                ];
            });
        
        return $this->successResponse([
            'idUsuario' => $user->idUsuario,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'email' => $user->email,
            'telefono' => $user->telefono,
            'rol' => $user->rol,
            'activo' => $user->activo,
            'creadoEn' => $user->creadoEn,
            'ultimos_reportes' => $reportes
        ], 'Perfil obtenido correctamente');
    }
    
    /**
     * Actualizar datos personales
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'sometimes|email|unique:users,email,' . $user->idUsuario . ',idUsuario'
        ]);
        
        try {
            $updateData = [];
            if ($request->has('nombre')) $updateData['nombre'] = $request->nombre;
            if ($request->has('apellido')) $updateData['apellido'] = $request->apellido;
            if ($request->has('telefono')) $updateData['telefono'] = $request->telefono;
            if ($request->has('email')) $updateData['email'] = $request->email;
            
            User::where('idUsuario', $user->idUsuario)->update($updateData);
            $user = User::find($user->idUsuario);
            
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
        $user = Auth::user();
        
        $request->validate([
            'password_actual' => 'required|string',
            'password_nuevo' => 'required|string|min:6|confirmed'
        ]);
        
        if (!Hash::check($request->password_actual, $user->passwordHash)) {
            return $this->errorResponse('La contraseña actual es incorrecta', 401);
        }
        
        $user->passwordHash = Hash::make($request->password_nuevo);
        User::where('idUsuario', $user->idUsuario)->update(['passwordHash' => $user->passwordHash]);
        
        return $this->successResponse(null, 'Contraseña actualizada correctamente');
    }
    
    /**
     * Historial de reportes generados por el admin
     */
    public function historialReportes(Request $request)
    {
        $admin = Auth::user()->administrador;
        
        $query = Reporte::where('idAdministrador', $admin->idAdministrador);
        
        if ($request->has('tipoReporte')) {
            $query->where('tipoReporte', $request->tipoReporte);
        }
        
        $reportes = $query->orderBy('generadoEn', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return $this->successResponse($reportes, 'Historial de reportes obtenido correctamente');
    }
}