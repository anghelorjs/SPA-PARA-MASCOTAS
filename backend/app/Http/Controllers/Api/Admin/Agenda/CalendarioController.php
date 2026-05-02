<?php
// app/Http/Controllers/Api/Admin/Agenda/CalendarioController.php

namespace App\Http\Controllers\Api\Admin\Agenda;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Groomer;
use App\Models\Notificacion;
use App\Models\Mascota;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CalendarioController extends ApiController
{
    /**
     * Obtener citas para el calendario (vista diaria/semanal con columnas por groomer)
     */
    public function citas(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'groomer_id' => 'nullable|exists:groomers,idGroomer'
        ]);

        $query = Cita::with(['mascota', 'groomer.user', 'servicio', 'fichaGrooming']);
        
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        $citas = $query->whereBetween('fechaHoraInicio', [$request->fecha_inicio, $request->fecha_fin])
            ->orderBy('fechaHoraInicio')
            ->get()
            ->map(function($cita) {
                $estadosColores = [
                    'programada' => '#3b82f6',
                    'confirmada' => '#10b981',
                    'en_curso' => '#f59e0b',
                    'completada' => '#6b7280',
                    'cancelada' => '#ef4444',
                    'no_asistio' => '#8b5cf6'
                ];
                
                return [
                    'id' => $cita->idCita,
                    'title' => $cita->mascota->nombre . ' - ' . $cita->servicio->nombre,
                    'start' => $cita->fechaHoraInicio->toISOString(),
                    'end' => $cita->fechaHoraFin->toISOString(),
                    'backgroundColor' => $estadosColores[$cita->estado] ?? '#6b7280',
                    'borderColor' => $estadosColores[$cita->estado] ?? '#6b7280',
                    'groomer_id' => $cita->idGroomer,
                    'extendedProps' => [
                        'id' => $cita->idCita,
                        'estado' => $cita->estado,
                        'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
                        'mascota' => $cita->mascota->nombre,
                        'mascota_id' => $cita->idMascota,
                        'cliente_id' => $cita->mascota->idCliente,
                        'servicio' => $cita->servicio->nombre,
                        'servicio_id' => $cita->idServicio,
                        'duracion' => $cita->duracionCalculadaMin,
                        'observaciones' => $cita->observaciones,
                        'precio' => $cita->servicio->getPrecioForRango($cita->mascota->idRango),
                        'tiene_ficha' => $cita->fichaGrooming ? true : false,
                        'id_ficha' => $cita->fichaGrooming->idFicha ?? null
                    ]
                ];
            });
        
        $groomers = Groomer::with('user')->get()->map(function($groomer) {
            return [
                'id' => $groomer->idGroomer,
                'nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido
            ];
        });
        
        return $this->successResponse([
            'citas' => $citas,
            'groomers' => $groomers
        ], 'Citas obtenidas correctamente');
    }

    /**
     * Obtener detalle de una cita (para modal)
     */
    public function detalleCita($id)
    {
        $cita = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio', 'fichaGrooming'])
            ->find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        return $this->successResponse([
            'id' => $cita->idCita,
            'fecha' => $cita->fechaHoraInicio->format('Y-m-d'),
            'hora_inicio' => $cita->fechaHoraInicio->format('H:i'),
            'hora_fin' => $cita->fechaHoraFin->format('H:i'),
            'duracion' => $cita->duracionCalculadaMin,
            'mascota' => $cita->mascota->nombre,
            'mascota_id' => $cita->idMascota,
            'cliente' => $cita->mascota->cliente->user->nombre . ' ' . $cita->mascota->cliente->user->apellido,
            'cliente_id' => $cita->mascota->idCliente,
            'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
            'groomer_id' => $cita->idGroomer,
            'servicio' => $cita->servicio->nombre,
            'servicio_id' => $cita->idServicio,
            'estado' => $cita->estado,
            'observaciones' => $cita->observaciones,
            'precio' => $cita->servicio->getPrecioForRango($cita->mascota->idRango),
            'tiene_ficha' => $cita->fichaGrooming ? true : false,
            'id_ficha' => $cita->fichaGrooming->idFicha ?? null
        ], 'Detalle de cita obtenido correctamente');
    }

    /**
     * Confirmar cita
     */
    public function confirmar($id)
    {
        $cita = Cita::find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        $cita->estado = 'confirmada';
        $cita->save();
        
        Notificacion::create([
            'idCliente' => $cita->mascota->idCliente,
            'idCita' => $cita->idCita,
            'tipo' => 'confirmacion',
            'canal' => $cita->mascota->cliente->canalContacto ?? 'whatsapp',
            'mensaje' => "Tu cita ha sido confirmada para el {$cita->fechaHoraInicio->format('d/m/Y H:i')}",
            'fechaEnvio' => now(),
            'entregada' => false
        ]);
        
        return $this->successResponse($cita, 'Cita confirmada correctamente');
    }

    /**
     * Cancelar cita
     */
    public function cancelar($id)
    {
        $cita = Cita::find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        if (in_array($cita->estado, ['completada', 'cancelada', 'en_curso'])) {
            return $this->errorResponse('No se puede cancelar esta cita', 400);
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
            'entregada' => false
        ]);
        
        return $this->successResponse(null, 'Cita cancelada correctamente');
    }

    /**
     * Reprogramar cita (con selector de nuevo slot)
     */
    public function reprogramar(Request $request, $id)
    {
        $cita = Cita::find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        $request->validate([
            'fechaHoraInicio' => 'required|date|after:now',
            'idGroomer' => 'required|exists:groomers,idGroomer'
        ]);
        
        $fechaInicio = Carbon::parse($request->fechaHoraInicio);
        $duracion = $cita->duracionCalculadaMin;
        $fechaFin = $fechaInicio->copy()->addMinutes($duracion);
        
        // Verificar disponibilidad
        $citaExistente = Cita::where('idGroomer', $request->idGroomer)
            ->where('idCita', '!=', $id)
            ->where(function($q) use ($fechaInicio, $fechaFin) {
                $q->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
                  ->orWhereBetween('fechaHoraFin', [$fechaInicio, $fechaFin]);
            })
            ->whereNotIn('estado', ['cancelada', 'completada'])
            ->exists();
        
        if ($citaExistente) {
            return $this->errorResponse('El horario seleccionado no está disponible', 400);
        }
        
        DB::beginTransaction();
        
        try {
            $cita->update([
                'fechaHoraInicio' => $fechaInicio,
                'fechaHoraFin' => $fechaFin,
                'idGroomer' => $request->idGroomer
            ]);
            
            Notificacion::create([
                'idCliente' => $cita->mascota->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'reprogramacion',
                'canal' => $cita->mascota->cliente->canalContacto ?? 'whatsapp',
                'mensaje' => "Tu cita ha sido reprogramada para el {$fechaInicio->format('d/m/Y H:i')}",
                'fechaEnvio' => now(),
                'entregada' => false
            ]);
            
            DB::commit();
            
            return $this->successResponse($cita->fresh(), 'Cita reprogramada correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al reprogramar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener slots disponibles para reprogramación o nueva cita
     */
    public function slotsDisponibles(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'idServicio' => 'required|exists:servicios,idServicio',
            'idMascota' => 'required|exists:mascotas,idMascota'
        ]);
        
        $fecha = Carbon::parse($request->fecha);
        $mascota = Mascota::find($request->idMascota);
        $servicio = Servicio::find($request->idServicio);
        
        // Si la mascota no tiene rango, usar duración base
        $idRango = $mascota->idRango;
        $duracion = $idRango 
            ? $servicio->getDuracionForRango($idRango) 
            : $servicio->duracionMinutos;
        
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
                $intervalo = 30; // minutos entre slots
                
                while ($horaInicio->copy()->addMinutes($duracion) <= $horaFin) {
                    $slotInicio = $horaInicio->copy();
                    $slotFin = $slotInicio->copy()->addMinutes($duracion);
                    
                    // Verificar si el groomer está disponible
                    $citaExistente = Cita::where('idGroomer', $groomer->idGroomer)
                        ->whereDate('fechaHoraInicio', $fecha)
                        ->where(function($q) use ($slotInicio, $slotFin) {
                            $q->whereBetween('fechaHoraInicio', [$slotInicio, $slotFin])
                              ->orWhereBetween('fechaHoraFin', [$slotInicio, $slotFin]);
                        })
                        ->whereNotIn('estado', ['cancelada', 'completada'])
                        ->exists();
                    
                    if (!$citaExistente) {
                        $slots[] = [
                            'groomer_id' => $groomer->idGroomer,
                            'groomer_nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                            'hora_inicio' => $slotInicio->format('H:i'),
                            'hora_fin' => $slotFin->format('H:i')
                        ];
                    }
                    
                    $horaInicio->addMinutes($intervalo);
                }
            }
        }
        
        return $this->successResponse($slots, 'Slots disponibles obtenidos correctamente');
    }
}