<?php
// app/Http/Controllers/Api/CitaController.php

namespace App\Http\Controllers\Api;

use App\Models\Cita;
use App\Models\Mascota;
use App\Models\Groomer;
use App\Models\Servicio;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CitaController extends ApiController
{
    /**
     * Listar citas
     */
    public function index(Request $request)
    {
        $query = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio', 'recepcionista.user']);
        
        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        if ($request->has('cliente_id')) {
            $query->whereHas('mascota', function($q) use ($request) {
                $q->where('idCliente', $request->cliente_id);
            });
        }
        
        if ($request->has('fecha_desde')) {
            $query->whereDate('fechaHoraInicio', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fechaHoraInicio', '<=', $request->fecha_hasta);
        }
        
        $citas = $query->orderBy('fechaHoraInicio', 'asc')
                       ->paginate($request->get('per_page', 15));
        
        return $this->paginatedResponse($citas, 'Citas obtenidas correctamente');
    }

    /**
     * Mostrar una cita específica
     */
    public function show($id)
    {
        $cita = Cita::with([
            'mascota.cliente.user', 
            'groomer.user', 
            'servicio.rangosPeso',
            'recepcionista.user',
            'fichaGrooming'
        ])->find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        return $this->successResponse($cita, 'Cita obtenida correctamente');
    }

    /**
     * Crear una nueva cita
     */
    public function store(Request $request)
    {
        $request->validate([
            'idMascota' => 'required|exists:mascotas,idMascota',
            'idServicio' => 'required|exists:servicios,idServicio',
            'fechaHoraInicio' => 'required|date|after:now',
            'observaciones' => 'nullable|string',
        ]);

        $mascota = Mascota::find($request->idMascota);
        $servicio = Servicio::find($request->idServicio);
        
        // Calcular duración según el rango de peso de la mascota
        $duracion = $servicio->getDuracionForRango($mascota->idRango);
        $fechaInicio = Carbon::parse($request->fechaHoraInicio);
        $fechaFin = (clone $fechaInicio)->addMinutes($duracion);
        
        // Buscar un groomer disponible
        $groomerDisponible = $this->findAvailableGroomer($fechaInicio, $fechaFin, $servicio);
        
        if (!$groomerDisponible) {
            return $this->errorResponse('No hay groomers disponibles en ese horario', 400);
        }

        DB::beginTransaction();
        
        try {
            $cita = Cita::create([
                'idMascota' => $request->idMascota,
                'idGroomer' => $groomerDisponible->idGroomer,
                'idServicio' => $request->idServicio,
                'idRecepcionista' => Auth::user()->recepcionista->idRecepcionista ?? null,
                'fechaHoraInicio' => $fechaInicio,
                'fechaHoraFin' => $fechaFin,
                'duracionCalculadaMin' => $duracion,
                'estado' => 'programada',
                'observaciones' => $request->observaciones,
            ]);
            
            // Crear notificación
            Notificacion::create([
                'idCliente' => $mascota->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'confirmacion',
                'canal' => $mascota->cliente->canalContacto ?? 'whatsapp',
                'mensaje' => "Cita agendada para {$mascota->nombre} el {$fechaInicio->format('d/m/Y H:i')}",
                'fechaEnvio' => now(),
                'entregada' => false,
            ]);
            
            DB::commit();
            
            return $this->successResponse(
                $cita->load(['mascota', 'groomer.user', 'servicio']), 
                'Cita creada exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear la cita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar una cita
     */
    public function update(Request $request, $id)
    {
        $cita = Cita::find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        $request->validate([
            'fechaHoraInicio' => 'sometimes|date|after:now',
            'estado' => 'sometimes|in:programada,confirmada,cancelada',
            'observaciones' => 'nullable|string',
        ]);

        DB::beginTransaction();
        
        try {
            if ($request->has('estado')) {
                $cita->estado = $request->estado;
                
                // Si se cancela, notificar
                if ($request->estado === 'cancelada') {
                    Notificacion::create([
                        'idCliente' => $cita->mascota->idCliente,
                        'idCita' => $cita->idCita,
                        'tipo' => 'cancelacion',
                        'canal' => $cita->mascota->cliente->canalContacto ?? 'whatsapp',
                        'mensaje' => "Tu cita ha sido cancelada",
                        'fechaEnvio' => now(),
                        'entregada' => false,
                    ]);
                }
            }
            
            if ($request->has('fechaHoraInicio')) {
                $fechaInicio = Carbon::parse($request->fechaHoraInicio);
                $duracion = $cita->duracionCalculadaMin;
                $fechaFin = (clone $fechaInicio)->addMinutes($duracion);
                
                $cita->fechaHoraInicio = $fechaInicio;
                $cita->fechaHoraFin = $fechaFin;
            }
            
            if ($request->has('observaciones')) {
                $cita->observaciones = $request->observaciones;
            }
            
            $cita->save();
            
            DB::commit();
            
            return $this->successResponse(
                $cita->fresh(['mascota', 'groomer.user', 'servicio']), 
                'Cita actualizada correctamente'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar la cita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancelar una cita
     */
    public function cancel($id)
    {
        $cita = Cita::find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        if (in_array($cita->estado, ['completada', 'cancelada'])) {
            return $this->errorResponse('No se puede cancelar una cita ya ' . $cita->estado, 400);
        }
        
        $cita->estado = 'cancelada';
        $cita->save();
        
        Notificacion::create([
            'idCliente' => $cita->mascota->idCliente,
            'idCita' => $cita->idCita,
            'tipo' => 'cancelacion',
            'canal' => $cita->mascota->cliente->canalContacto ?? 'whatsapp',
            'mensaje' => "Tu cita para {$cita->mascota->nombre} ha sido cancelada",
            'fechaEnvio' => now(),
            'entregada' => false,
        ]);
        
        return $this->successResponse(null, 'Cita cancelada correctamente');
    }

    /**
     * Obtener slots disponibles
     */
    public function slotsDisponibles(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'idServicio' => 'required|exists:servicios,idServicio',
            'idMascota' => 'required|exists:mascotas,idMascota',
        ]);
        
        $mascota = Mascota::find($request->idMascota);
        $servicio = Servicio::find($request->idServicio);
        $fecha = Carbon::parse($request->fecha);
        
        $duracion = $servicio->getDuracionForRango($mascota->idRango);
        $groomers = Groomer::with('disponibilidades')->get();
        
        $slots = [];
        
        foreach ($groomers as $groomer) {
            $disponibilidad = $groomer->disponibilidades
                ->where('diaSemana', $fecha->dayOfWeek)
                ->where('esBloqueo', false)
                ->first();
            
            if ($disponibilidad) {
                $horaInicio = Carbon::parse($disponibilidad->horaInicio);
                $horaFin = Carbon::parse($disponibilidad->horaFin);
                
                while ($horaInicio->copy()->addMinutes($duracion) <= $horaFin) {
                    $slotInicio = $horaInicio->copy();
                    $slotFin = $slotInicio->copy()->addMinutes($duracion);
                    
                    // Verificar si el groomer está disponible en ese horario
                    if ($groomer->isAvailable($fecha->copy()->setTimeFrom($slotInicio), $duracion)) {
                        $slots[] = [
                            'groomer_id' => $groomer->idGroomer,
                            'groomer_nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                            'hora_inicio' => $slotInicio->format('H:i'),
                            'hora_fin' => $slotFin->format('H:i'),
                        ];
                    }
                    
                    $horaInicio->addMinutes(30);
                }
            }
        }
        
        return $this->successResponse($slots, 'Slots disponibles obtenidos correctamente');
    }

    /**
     * Buscar groomer disponible
     */
    private function findAvailableGroomer($fechaInicio, $fechaFin, $servicio)
    {
        $groomers = Groomer::all();
        
        foreach ($groomers as $groomer) {
            $disponibilidad = $groomer->disponibilidades
                ->where('diaSemana', $fechaInicio->dayOfWeek)
                ->where('horaInicio', '<=', $fechaInicio->format('H:i:s'))
                ->where('horaFin', '>=', $fechaFin->format('H:i:s'))
                ->where('esBloqueo', false)
                ->first();
            
            if ($disponibilidad && $groomer->isAvailable($fechaInicio, $servicio->duracionMinutos)) {
                return $groomer;
            }
        }
        
        return null;
    }
}