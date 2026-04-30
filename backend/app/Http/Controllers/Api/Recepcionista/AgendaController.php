<?php
// app/Http/Controllers/Api/Recepcionista/AgendaController.php

namespace App\Http\Controllers\Api\Recepcionista;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Groomer;
use App\Models\Servicio;
use App\Models\Cliente;
use App\Models\Mascota;
use App\Models\RangoPeso;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AgendaController extends ApiController
{
    /**
     * Obtener citas para el calendario
     */
    public function citas(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'groomer_id' => 'nullable|exists:groomers,idGroomer'
        ]);

        $fecha = Carbon::parse($request->fecha);
        $fechaInicio = $fecha->copy()->startOfDay();
        $fechaFin = $fecha->copy()->endOfDay();

        $query = Cita::with(['mascota', 'groomer.user', 'servicio', 'fichaGrooming'])
            ->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin]);
        
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        $citas = $query->orderBy('fechaHoraInicio')->get();
        
        // Obtener groomers
        $groomers = Groomer::with('user')->get()->map(function($groomer) {
            return [
                'id' => $groomer->idGroomer,
                'nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido
            ];
        });
        
        // Formatear citas para el calendario
        $citasFormateadas = $citas->map(function($cita) {
            $estadosColores = [
                'programada' => '#3b82f6',
                'confirmada' => '#10b981',
                'en_curso' => '#f59e0b',
                'completada' => '#6b7280',
                'cancelada' => '#ef4444'
            ];
            
            return [
                'id' => $cita->idCita,
                'title' => $cita->mascota->nombre . ' - ' . $cita->servicio->nombre,
                'start' => $cita->fechaHoraInicio->toISOString(),
                'end' => $cita->fechaHoraFin->toISOString(),
                'backgroundColor' => $estadosColores[$cita->estado] ?? '#6b7280',
                'groomer_id' => $cita->idGroomer,
                'extendedProps' => [
                    'estado' => $cita->estado,
                    'mascota' => $cita->mascota->nombre,
                    'servicio' => $cita->servicio->nombre,
                    'tiene_ficha' => $cita->fichaGrooming ? true : false
                ]
            ];
        });
        
        return $this->successResponse([
            'citas' => $citasFormateadas,
            'groomers' => $groomers
        ], 'Citas obtenidas correctamente');
    }

    /**
     * Obtener slots libres para una fecha
     */
    public function slotsLibres(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'idServicio' => 'required|exists:servicios,idServicio',
            'idMascota' => 'required|exists:mascotas,idMascota'
        ]);
        
        $fecha = Carbon::parse($request->fecha);
        $mascota = Mascota::find($request->idMascota);
        $servicio = Servicio::find($request->idServicio);
        
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
                    
                    $horaInicio->addMinutes(30);
                }
            }
        }
        
        return $this->successResponse($slots, 'Slots disponibles obtenidos correctamente');
    }

    /**
     * Buscar clientes (para paso 1)
     */
    public function buscarClientes(Request $request)
    {
        $request->validate([
            'search' => 'required|string|min:2'
        ]);
        
        $clientes = Cliente::with('user')
            ->whereHas('user', function($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->search}%")
                  ->orWhere('apellido', 'like', "%{$request->search}%")
                  ->orWhere('telefono', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            })
            ->limit(10)
            ->get()
            ->map(function($cliente) {
                return [
                    'id' => $cliente->idCliente,
                    'nombre' => $cliente->user->nombre . ' ' . $cliente->user->apellido,
                    'telefono' => $cliente->user->telefono,
                    'email' => $cliente->user->email,
                    'direccion' => $cliente->direccion,
                    'canal_contacto' => $cliente->canalContacto
                ];
            });
        
        return $this->successResponse($clientes, 'Clientes encontrados');
    }

    /**
     * Obtener mascotas de un cliente
     */
    public function mascotasPorCliente($clienteId)
    {
        $cliente = Cliente::find($clienteId);
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $mascotas = $cliente->mascotas->map(function($mascota) {
            return [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza,
                'peso_kg' => $mascota->pesoKg,
                'rango_nombre' => $mascota->rangoPeso ? $mascota->rangoPeso->nombre : null,
                'temperamento' => $mascota->temperamento
            ];
        });
        
        return $this->successResponse($mascotas, 'Mascotas obtenidas correctamente');
    }

    /**
     * Obtener servicios activos con precios ajustados por rango
     */
    public function serviciosConPrecios(Request $request)
    {
        $request->validate([
            'idMascota' => 'required|exists:mascotas,idMascota'
        ]);
        
        $mascota = Mascota::find($request->idMascota);
        $servicios = Servicio::with('rangosPeso')->get();
        
        $serviciosFormateados = $servicios->map(function($servicio) use ($mascota) {
            return [
                'id' => $servicio->idServicio,
                'nombre' => $servicio->nombre,
                'duracion_minutos' => $servicio->getDuracionForRango($mascota->idRango),
                'precio' => $servicio->getPrecioForRango($mascota->idRango),
                'admite_doble_booking' => $servicio->admiteDobleBooking
            ];
        });
        
        return $this->successResponse($serviciosFormateados, 'Servicios obtenidos correctamente');
    }

    /**
     * Crear nueva cita (paso a paso)
     */
    public function crearCita(Request $request)
    {
        $request->validate([
            'idCliente' => 'required|exists:clientes,idCliente',
            'idMascota' => 'required|exists:mascotas,idMascota',
            'idServicio' => 'required|exists:servicios,idServicio',
            'idGroomer' => 'required|exists:groomers,idGroomer',
            'fechaHoraInicio' => 'required|date',
            'observaciones' => 'nullable|string'
        ]);
        
        $mascota = Mascota::find($request->idMascota);
        $servicio = Servicio::find($request->idServicio);
        $fechaInicio = Carbon::parse($request->fechaHoraInicio);
        $duracion = $servicio->getDuracionForRango($mascota->idRango);
        $fechaFin = $fechaInicio->copy()->addMinutes($duracion);
        
        // Verificar que el slot esté libre
        $citaExistente = Cita::where('idGroomer', $request->idGroomer)
            ->where(function($q) use ($fechaInicio, $fechaFin) {
                $q->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
                ->orWhereBetween('fechaHoraFin', [$fechaInicio, $fechaFin]);
            })
            ->whereNotIn('estado', ['cancelada', 'completada'])
            ->exists();
        
        if ($citaExistente) {
            return $this->errorResponse('El horario seleccionado ya no está disponible', 400);
        }
        
        DB::beginTransaction();
        
        try {
            // ✅ CORREGIDO: auth()->user()->recepcionista
            $recepcionista = Auth::user()->recepcionista;
            
            if (!$recepcionista) {
                return $this->errorResponse('Usuario no es recepcionista', 403);
            }
            
            $cita = Cita::create([
                'idMascota' => $request->idMascota,
                'idGroomer' => $request->idGroomer,
                'idServicio' => $request->idServicio,
                'idRecepcionista' => $recepcionista->idRecepcionista,
                'fechaHoraInicio' => $fechaInicio,
                'fechaHoraFin' => $fechaFin,
                'duracionCalculadaMin' => $duracion,
                'estado' => 'programada',
                'observaciones' => $request->observaciones
            ]);
            
            // Crear notificación
            Notificacion::create([
                'idCliente' => $request->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'confirmacion',
                'canal' => $mascota->cliente->canalContacto ?? 'whatsapp',
                'mensaje' => "Cita agendada para {$mascota->nombre} el {$fechaInicio->format('d/m/Y H:i')}",
                'fechaEnvio' => now(),
                'entregada' => false
            ]);
            
            DB::commit();
            
            return $this->successResponse($cita->load(['mascota', 'groomer.user', 'servicio']), 'Cita creada exitosamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear cita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Confirmar cita
     */
    public function confirmarCita($id)
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
    public function cancelarCita($id)
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
     * Reprogramar cita
     */
    public function reprogramarCita(Request $request, $id)
    {
        $cita = Cita::find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        $request->validate([
            'fechaHoraInicio' => 'required|date',
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
        
        return $this->successResponse($cita->load(['mascota', 'groomer.user', 'servicio']), 'Cita reprogramada correctamente');
    }
}