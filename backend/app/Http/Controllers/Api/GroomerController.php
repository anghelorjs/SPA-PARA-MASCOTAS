<?php
// app/Http/Controllers/Api/GroomerController.php

namespace App\Http\Controllers\Api;

use App\Models\Groomer;
use App\Models\Disponibilidad;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class GroomerController extends ApiController
{
    /**
     * Listar todos los groomers
     */
    public function index(Request $request)
    {
        $query = Groomer::with('user');
        
        if ($request->has('especialidad')) {
            $query->where('especialidad', 'like', "%{$request->especialidad}%");
        }
        
        $groomers = $query->paginate($request->get('per_page', 15));
        
        return $this->paginatedResponse($groomers, 'Groomers obtenidos correctamente');
    }

    /**
     * Mostrar un groomer específico
     */
    public function show($id)
    {
        $groomer = Groomer::with('user', 'disponibilidades', 'citas')->find($id);
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        return $this->successResponse($groomer, 'Groomer obtenido correctamente');
    }

    /**
     * Crear un nuevo groomer
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'especialidad' => 'nullable|string',
            'maxServiciosSimultaneos' => 'nullable|integer|min:1|max:5',
        ]);

        DB::beginTransaction();
        
        try {
            $user = User::create([
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'email' => $request->email,
                'passwordHash' => Hash::make($request->password ?? 'groomer123'),
                'telefono' => $request->telefono,
                'rol' => 'groomer',
                'activo' => true,
            ]);
            
            $groomer = Groomer::create([
                'idUsuario' => $user->idUsuario,
                'especialidad' => $request->especialidad,
                'maxServiciosSimultaneos' => $request->maxServiciosSimultaneos ?? 1,
            ]);
            
            DB::commit();
            
            return $this->successResponse(
                $groomer->load('user'), 
                'Groomer creado exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear el groomer: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar un groomer
     */
    public function update(Request $request, $id)
    {
        $groomer = Groomer::find($id);
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $request->validate([
            'especialidad' => 'nullable|string',
            'maxServiciosSimultaneos' => 'nullable|integer|min:1|max:5',
            'activo' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        
        try {
            if ($request->has('especialidad')) {
                $groomer->especialidad = $request->especialidad;
            }
            if ($request->has('maxServiciosSimultaneos')) {
                $groomer->maxServiciosSimultaneos = $request->maxServiciosSimultaneos;
            }
            if ($request->has('activo')) {
                $groomer->user->activo = $request->activo;
                $groomer->user->save();
            }
            $groomer->save();
            
            DB::commit();
            
            return $this->successResponse(
                $groomer->load('user'), 
                'Groomer actualizado correctamente'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar el groomer: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener disponibilidad de un groomer
     */
    public function disponibilidad($id)
    {
        $groomer = Groomer::find($id);
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $disponibilidad = $groomer->disponibilidades;
        
        return $this->successResponse($disponibilidad, 'Disponibilidad obtenida correctamente');
    }

    /**
     * Configurar disponibilidad de un groomer
     */
    public function setDisponibilidad(Request $request, $id)
    {
        $groomer = Groomer::find($id);
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $request->validate([
            'disponibilidades' => 'required|array',
            'disponibilidades.*.diaSemana' => 'required|integer|min:0|max:6',
            'disponibilidades.*.horaInicio' => 'required|date_format:H:i',
            'disponibilidades.*.horaFin' => 'required|date_format:H:i',
        ]);

        DB::beginTransaction();
        
        try {
            // Eliminar disponibilidades existentes (no bloqueos)
            $groomer->disponibilidades()->where('esBloqueo', false)->delete();
            
            // Crear nuevas disponibilidades
            foreach ($request->disponibilidades as $disp) {
                Disponibilidad::create([
                    'idGroomer' => $groomer->idGroomer,
                    'diaSemana' => $disp['diaSemana'],
                    'horaInicio' => $disp['horaInicio'],
                    'horaFin' => $disp['horaFin'],
                    'esBloqueo' => false,
                    'motivoBloqueo' => null,
                ]);
            }
            
            DB::commit();
            
            return $this->successResponse(
                $groomer->disponibilidades, 
                'Disponibilidad configurada correctamente'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al configurar disponibilidad: ' . $e->getMessage(), 500);
        }
    }
}