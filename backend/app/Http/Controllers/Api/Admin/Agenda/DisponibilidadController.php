<?php
// app/Http/Controllers/Api/Admin/Agenda/DisponibilidadController.php

namespace App\Http\Controllers\Api\Admin\Agenda;

use App\Http\Controllers\Api\ApiController;
use App\Models\Groomer;
use App\Models\Disponibilidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DisponibilidadController extends ApiController
{
    /**
     * Obtener disponibilidad de todos los groomers
     */
    public function index(Request $request)
    {
        $groomers = Groomer::with(['user', 'disponibilidades' => function($q) {
            $q->where('esBloqueo', false);
        }])->get();
        
        $bloqueos = Disponibilidad::where('esBloqueo', true)
            ->with('groomer.user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($bloqueo) {
                return [
                    'id' => $bloqueo->idDisponibilidad,
                    'groomer_id' => $bloqueo->idGroomer,
                    'groomer_nombre' => $bloqueo->groomer->user->nombre . ' ' . $bloqueo->groomer->user->apellido,
                    'fecha' => $bloqueo->motivoBloqueo ? $this->extraerFecha($bloqueo->motivoBloqueo) : null,
                    'motivo' => $bloqueo->motivoBloqueo,
                    'created_at' => $bloqueo->created_at->format('Y-m-d H:i')
                ];
            });
        
        $groomersData = $groomers->map(function($groomer) {
            return [
                'id' => $groomer->idGroomer,
                'nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                'especialidad' => $groomer->especialidad,
                'maxServiciosSimultaneos' => $groomer->maxServiciosSimultaneos,
                'disponibilidades' => $groomer->disponibilidades->map(function($disp) {
                    return [
                        'id' => $disp->idDisponibilidad,
                        'diaSemana' => $disp->diaSemana,
                        'diaNombre' => $this->getDiaNombre($disp->diaSemana),
                        'horaInicio' => $disp->horaInicio,
                        'horaFin' => $disp->horaFin
                    ];
                })
            ];
        });
        
        return $this->successResponse([
            'groomers' => $groomersData,
            'bloqueos' => $bloqueos
        ], 'Disponibilidad obtenida correctamente');
    }

    /**
     * Obtener disponibilidad de un groomer específico
     */
    public function show($id)
    {
        $groomer = Groomer::with(['user', 'disponibilidades' => function($q) {
            $q->where('esBloqueo', false);
        }])->find($id);
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $disponibilidades = $groomer->disponibilidades->map(function($disp) {
            return [
                'id' => $disp->idDisponibilidad,
                'diaSemana' => $disp->diaSemana,
                'diaNombre' => $this->getDiaNombre($disp->diaSemana),
                'horaInicio' => $disp->horaInicio,
                'horaFin' => $disp->horaFin
            ];
        });
        
        return $this->successResponse([
            'groomer' => [
                'id' => $groomer->idGroomer,
                'nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                'especialidad' => $groomer->especialidad,
                'maxServiciosSimultaneos' => $groomer->maxServiciosSimultaneos
            ],
            'disponibilidades' => $disponibilidades
        ], 'Disponibilidad del groomer obtenida correctamente');
    }

    /**
     * Configurar disponibilidad semanal de un groomer
     */
    public function store(Request $request, $id)
    {
        $groomer = Groomer::find($id);
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $request->validate([
            'disponibilidades' => 'required|array',
            'disponibilidades.*.diaSemana' => 'required|integer|min:0|max:6',
            'disponibilidades.*.horaInicio' => 'required|date_format:H:i',
            'disponibilidades.*.horaFin' => 'required|date_format:H:i|after:horaInicio'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Eliminar disponibilidades existentes (no bloqueos)
            $groomer->disponibilidades()->where('esBloqueo', false)->delete();
            
            foreach ($request->disponibilidades as $disp) {
                Disponibilidad::create([
                    'idGroomer' => $id,
                    'diaSemana' => $disp['diaSemana'],
                    'horaInicio' => $disp['horaInicio'],
                    'horaFin' => $disp['horaFin'],
                    'esBloqueo' => false,
                    'motivoBloqueo' => null
                ]);
            }
            
            DB::commit();
            
            return $this->successResponse(null, 'Disponibilidad configurada correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al configurar disponibilidad: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar un día específico de disponibilidad
     */
    public function update(Request $request, $id)
    {
        $disponibilidad = Disponibilidad::where('idDisponibilidad', $id)
            ->where('esBloqueo', false)
            ->first();
        
        if (!$disponibilidad) {
            return $this->errorResponse('Disponibilidad no encontrada', 404);
        }
        
        $request->validate([
            'horaInicio' => 'required|date_format:H:i',
            'horaFin' => 'required|date_format:H:i|after:horaInicio'
        ]);
        
        $disponibilidad->update([
            'horaInicio' => $request->horaInicio,
            'horaFin' => $request->horaFin
        ]);
        
        return $this->successResponse(null, 'Disponibilidad actualizada correctamente');
    }

    /**
     * Eliminar un día de disponibilidad
     */
    public function destroy($id)
    {
        $disponibilidad = Disponibilidad::where('idDisponibilidad', $id)
            ->where('esBloqueo', false)
            ->first();
        
        if (!$disponibilidad) {
            return $this->errorResponse('Disponibilidad no encontrada', 404);
        }
        
        $disponibilidad->delete();
        
        return $this->successResponse(null, 'Disponibilidad eliminada correctamente');
    }

    /**
     * Registrar bloqueo (feriado, ausencia, mantenimiento)
     */
    public function registrarBloqueo(Request $request)
    {
        $request->validate([
            'idGroomer' => 'required|exists:groomers,idGroomer',
            'fecha_desde' => 'required|date|after:now',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'motivoBloqueo' => 'required|string|max:255'
        ]);
        
        $fechaDesde = Carbon::parse($request->fecha_desde);
        $fechaHasta = $request->fecha_hasta ? Carbon::parse($request->fecha_hasta) : $fechaDesde;
        
        DB::beginTransaction();
        
        try {
            $fechaActual = $fechaDesde->copy();
            while ($fechaActual <= $fechaHasta) {
                Disponibilidad::create([
                    'idGroomer' => $request->idGroomer,
                    'diaSemana' => $fechaActual->dayOfWeek,
                    'horaInicio' => '00:00:00',
                    'horaFin' => '23:59:59',
                    'esBloqueo' => true,
                    'motivoBloqueo' => $request->motivoBloqueo . ' - Fecha: ' . $fechaActual->format('Y-m-d')
                ]);
                $fechaActual->addDay();
            }
            
            DB::commit();
            
            return $this->successResponse(null, 'Bloqueo(s) registrado(s) correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al registrar bloqueo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar bloqueo
     */
    public function eliminarBloqueo($id)
    {
        $bloqueo = Disponibilidad::where('idDisponibilidad', $id)
            ->where('esBloqueo', true)
            ->first();
        
        if (!$bloqueo) {
            return $this->errorResponse('Bloqueo no encontrado', 404);
        }
        
        $bloqueo->delete();
        
        return $this->successResponse(null, 'Bloqueo eliminado correctamente');
    }

    /**
     * Obtener días de la semana para selector
     */
    public function diasSemana()
    {
        $dias = [
            ['id' => 0, 'nombre' => 'Lunes'],
            ['id' => 1, 'nombre' => 'Martes'],
            ['id' => 2, 'nombre' => 'Miércoles'],
            ['id' => 3, 'nombre' => 'Jueves'],
            ['id' => 4, 'nombre' => 'Viernes'],
            ['id' => 5, 'nombre' => 'Sábado'],
            ['id' => 6, 'nombre' => 'Domingo']
        ];
        
        return $this->successResponse($dias, 'Días de semana obtenidos correctamente');
    }

    /**
     * Extraer fecha del motivo de bloqueo
     */
    private function extraerFecha($motivo)
    {
        if (preg_match('/Fecha: (\d{4}-\d{2}-\d{2})/', $motivo, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Obtener nombre del día
     */
    private function getDiaNombre($dia)
    {
        $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        return $dias[$dia] ?? 'Desconocido';
    }
}