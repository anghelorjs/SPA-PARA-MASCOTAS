<?php
// app/Http/Controllers/Api/Cliente/CitaController.php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Mascota;
use App\Models\Groomer;
use App\Models\Servicio;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CitaController extends ApiController
{
    /**
     * Listar citas del cliente (próximas, pasadas, canceladas)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $tipo = $request->get('tipo', 'proximas');
        
        $query = Cita::with(['mascota', 'groomer.user', 'servicio'])
            ->whereHas('mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            });
        
        switch ($tipo) {
            case 'proximas':
                $query->whereIn('estado', ['programada', 'confirmada'])
                      ->where('fechaHoraInicio', '>=', now());
                break;
            case 'pasadas':
                $query->whereIn('estado', ['completada', 'en_curso', 'no_asistio'])
                      ->orWhere(function($q) {
                          $q->whereIn('estado', ['programada', 'confirmada'])
                            ->where('fechaHoraInicio', '<', now());
                      });
                break;
            case 'canceladas':
                $query->where('estado', 'cancelada');
                break;
        }
        
        $citas = $query->orderBy('fechaHoraInicio', 'desc')
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
                
                $precio = $cita->servicio->getPrecioForRango($cita->mascota->idRango);
                
                return [
                    'id' => $cita->idCita,
                    'fecha' => $cita->fechaHoraInicio->format('d/m/Y'),
                    'hora_inicio' => $cita->fechaHoraInicio->format('H:i'),
                    'hora_fin' => $cita->fechaHoraFin->format('H:i'),
                    'duracion' => $cita->duracionCalculadaMin,
                    'servicio' => $cita->servicio->nombre,
                    'servicio_id' => $cita->idServicio,
                    'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
                    'mascota' => $cita->mascota->nombre,
                    'mascota_id' => $cita->idMascota,
                    'precio' => $precio,
                    'estado' => $cita->estado,
                    'estado_color' => $estadosColores[$cita->estado] ?? '#6b7280',
                    'puede_cancelar' => in_array($cita->estado, ['programada', 'confirmada']) && 
                                       now()->diffInHours($cita->fechaHoraInicio) >= 2
                ];
            });
        
        return $this->successResponse($citas, 'Citas obtenidas correctamente');
    }
    
    /**
     * Ver detalle de una cita
     */
    public function show($id)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $cita = Cita::with(['mascota', 'groomer.user', 'servicio'])
            ->whereHas('mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })
            ->find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        $precio = $cita->servicio->getPrecioForRango($cita->mascota->idRango);
        $canalNotificacion = $cliente->canalContacto ?? 'No definido';
        
        return $this->successResponse([
            'id' => $cita->idCita,
            'fecha' => $cita->fechaHoraInicio->format('d/m/Y'),
            'hora_inicio' => $cita->fechaHoraInicio->format('H:i'),
            'hora_fin' => $cita->fechaHoraFin->format('H:i'),
            'duracion' => $cita->duracionCalculadaMin,
            'servicio' => $cita->servicio->nombre,
            'servicio_id' => $cita->idServicio,
            'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
            'groomer_id' => $cita->idGroomer,
            'mascota' => [
                'id' => $cita->mascota->idMascota,
                'nombre' => $cita->mascota->nombre,
                'especie' => $cita->mascota->especie,
                'raza' => $cita->mascota->raza,
                'peso_kg' => $cita->mascota->pesoKg,
                'rango_nombre' => $cita->mascota->rangoPeso ? $cita->mascota->rangoPeso->nombre : null,
                'temperamento' => $cita->mascota->temperamento,
                'alergias' => $cita->mascota->alergias,
                'restricciones' => $cita->mascota->restricciones
            ],
            'precio' => $precio,
            'estado' => $cita->estado,
            'observaciones' => $cita->observaciones,
            'canal_notificacion' => $canalNotificacion
        ], 'Detalle de cita obtenido correctamente');
    }
    
    /**
     * Obtener mascotas del cliente (para paso 1 de agendado)
     */
    public function getMascotas()
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $mascotas = $cliente->mascotas->map(function($mascota) {
            $rangoNombre = $mascota->rangoPeso ? $mascota->rangoPeso->nombre : 'No asignado';
            
            return [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza,
                'tamanio' => $mascota->tamanio,
                'peso_kg' => $mascota->pesoKg,
                'rango_nombre' => $rangoNombre,
                'rango_id' => $mascota->idRango,
                'temperamento' => $mascota->temperamento
            ];
        });
        
        return $this->successResponse($mascotas, 'Mascotas obtenidas correctamente');
    }
    
    /**
     * Obtener servicios con precios ajustados (para paso 2 de agendado)
     */
    public function getServicios(Request $request)
    {
        $request->validate([
            'idMascota' => 'required|exists:mascotas,idMascota'
        ]);
        
        $mascota = Mascota::find($request->idMascota);
        $servicios = Servicio::all();
        
        $serviciosFormateados = $servicios->map(function($servicio) use ($mascota) {
            return [
                'id' => $servicio->idServicio,
                'nombre' => $servicio->nombre,
                'duracion_minutos' => $servicio->getDuracionForRango($mascota->idRango),
                'precio' => $servicio->getPrecioForRango($mascota->idRango),
                'descripcion' => $servicio->descripcion ?? null
            ];
        });
        
        return $this->successResponse($serviciosFormateados, 'Servicios obtenidos correctamente');
    }
    
    /**
     * Obtener slots disponibles (para paso 3 de agendado)
     */
    public function getSlots(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date|after:today',
            'idServicio' => 'required|exists:servicios,idServicio',
            'idMascota' => 'required|exists:mascotas,idMascota'
        ]);
        
        $fecha = Carbon::parse($request->fecha);
        $mascota = Mascota::find($request->idMascota);
        $servicio = Servicio::find($request->idServicio);
        
        $duracion = $servicio->getDuracionForRango($mascota->idRango);
        
        $groomers = Groomer::with(['user', 'disponibilidades'])->get();
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
                            'id_groomer' => $groomer->idGroomer,
                            'groomer_nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                            'hora_inicio' => $slotInicio->format('H:i'),
                            'hora_fin' => $slotFin->format('H:i')
                        ];
                    }
                    
                    $horaInicio->addMinutes(30);
                }
            }
        }
        
        return $this->successResponse($slots, 'Slots disponibles obtenidos correctamente');
    }
    
    /**
     * Crear nueva cita (paso 4 de agendado)
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $request->validate([
            'idMascota' => 'required|exists:mascotas,idMascota',
            'idServicio' => 'required|exists:servicios,idServicio',
            'idGroomer' => 'required|exists:groomers,idGroomer',
            'fecha' => 'required|date|after:today',
            'hora_inicio' => 'required|date_format:H:i'
        ]);
        
        $mascota = Mascota::where('idCliente', $cliente->idCliente)->find($request->idMascota);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $servicio = Servicio::find($request->idServicio);
        $fechaHoraInicio = Carbon::parse($request->fecha . ' ' . $request->hora_inicio);
        $duracion = $servicio->getDuracionForRango($mascota->idRango);
        $fechaHoraFin = $fechaHoraInicio->copy()->addMinutes($duracion);
        
        // Verificar que el slot esté libre
        $citaExistente = Cita::where('idGroomer', $request->idGroomer)
            ->where(function($q) use ($fechaHoraInicio, $fechaHoraFin) {
                $q->whereBetween('fechaHoraInicio', [$fechaHoraInicio, $fechaHoraFin])
                  ->orWhereBetween('fechaHoraFin', [$fechaHoraInicio, $fechaHoraFin]);
            })
            ->whereNotIn('estado', ['cancelada', 'completada'])
            ->exists();
        
        if ($citaExistente) {
            return $this->errorResponse('El horario seleccionado ya no está disponible', 400);
        }
        
        DB::beginTransaction();
        
        try {
            $cita = Cita::create([
                'idMascota' => $request->idMascota,
                'idGroomer' => $request->idGroomer,
                'idServicio' => $request->idServicio,
                'idRecepcionista' => null, // Autoagendada por cliente
                'fechaHoraInicio' => $fechaHoraInicio,
                'fechaHoraFin' => $fechaHoraFin,
                'duracionCalculadaMin' => $duracion,
                'estado' => 'programada',
                'observaciones' => $request->observaciones ?? null
            ]);
            
            // Crear notificación de confirmación
            Notificacion::create([
                'idCliente' => $cliente->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'confirmacion',
                'canal' => $cliente->canalContacto ?? 'whatsapp',
                'mensaje' => "Cita agendada para {$mascota->nombre} el {$fechaHoraInicio->format('d/m/Y H:i')}",
                'fechaEnvio' => now(),
                'entregada' => false
            ]);
            
            DB::commit();
            
            return $this->successResponse([
                'id' => $cita->idCita,
                'fecha' => $cita->fechaHoraInicio->format('d/m/Y'),
                'hora' => $cita->fechaHoraInicio->format('H:i')
            ], 'Cita creada exitosamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear cita: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Cancelar cita (cliente)
     */
    public function cancel($id)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $cita = Cita::with(['mascota'])
            ->whereHas('mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })
            ->find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        if (!in_array($cita->estado, ['programada', 'confirmada'])) {
            return $this->errorResponse('No se puede cancelar esta cita', 400);
        }
        
        // Verificar anticipación mínima de 2 horas
        if (now()->diffInHours($cita->fechaHoraInicio) < 2) {
            return $this->errorResponse('Solo se puede cancelar con al menos 2 horas de anticipación', 400);
        }
        
        $cita->estado = 'cancelada';
        $cita->save();
        
        Notificacion::create([
            'idCliente' => $cliente->idCliente,
            'idCita' => $cita->idCita,
            'tipo' => 'cancelacion',
            'canal' => $cliente->canalContacto ?? 'whatsapp',
            'mensaje' => "Tu cita para {$cita->mascota->nombre} ha sido cancelada",
            'fechaEnvio' => now(),
            'entregada' => false
        ]);
        
        return $this->successResponse(null, 'Cita cancelada correctamente');
    }
}