<?php

namespace App\Http\Controllers\Api\Admin\Agenda;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Cliente;
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

        $fechaInicio = Carbon::parse($request->fecha_inicio)->startOfDay();
        $fechaFin = Carbon::parse($request->fecha_fin)->endOfDay();

        $query = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio', 'fichaGrooming']);
        
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        $citas = $query->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
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
                    'start' => $cita->fechaHoraInicio->format('Y-m-d\TH:i:s'),
                    'end' => $cita->fechaHoraFin->format('Y-m-d\TH:i:s'),
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
                        'cliente' => $cita->mascota->cliente->user->nombre . ' ' . $cita->mascota->cliente->user->apellido,
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
        
        $groomers = Groomer::with('user')
            ->whereHas('user', fn($q) => $q->where('activo', true))
            ->get()
            ->map(function($groomer) {
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
        $groomer = Groomer::find($request->idGroomer);
        $citaExistente = Cita::where('idGroomer', $request->idGroomer)
            ->where('idCita', '!=', $id)
            ->activas()
            ->solapadas($fechaInicio, $fechaFin)
            ->count() >= ($groomer->maxServiciosSimultaneos ?? 1);
        
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
            'idMascota' => 'required|exists:mascotas,idMascota',
            'idGroomer' => 'nullable|exists:groomers,idGroomer'
        ]);
        
        $fecha = Carbon::parse($request->fecha);
        $mascota = Mascota::find($request->idMascota);
        $servicio = Servicio::find($request->idServicio);
        
        // Si la mascota no tiene rango, usar duración base
        $idRango = $mascota->idRango;
        $duracion = $idRango 
            ? $servicio->getDuracionForRango($idRango) 
            : $servicio->duracionMinutos;
        
        $groomers = Groomer::with(['disponibilidades', 'user'])
            ->whereHas('user', fn($q) => $q->where('activo', true))
            ->when($request->filled('idGroomer'), fn($q) => $q->where('idGroomer', $request->idGroomer))
            ->get();
        $slots = [];
        
        foreach ($groomers as $groomer) {
            if ($groomer->disponibilidades->where('esBloqueo', false)->isEmpty()) {
                $groomer->crearDisponibilidadDefault();
                $groomer->load('disponibilidades');
            }

            $disponibilidad = $groomer->disponibilidades
                ->where('diaSemana', $fecha->dayOfWeek)
                ->where('esBloqueo', false)
                ->first();
            
            if ($disponibilidad) {
                $horaInicio = $fecha->copy()->setTimeFromTimeString(Carbon::parse($disponibilidad->horaInicio)->format('H:i:s'));
                $horaFin = $fecha->copy()->setTimeFromTimeString(Carbon::parse($disponibilidad->horaFin)->format('H:i:s'));
                $intervalo = 30; // minutos entre slots
                
                while ($horaInicio->copy()->addMinutes($duracion) <= $horaFin) {
                    $slotInicio = $horaInicio->copy();
                    $slotFin = $slotInicio->copy()->addMinutes($duracion);
                    
                    // Verificar si el groomer está disponible
                    $citasSolapadas = Cita::where('idGroomer', $groomer->idGroomer)
                        ->activas()
                        ->solapadas($slotInicio, $slotFin)
                        ->count();
                    
                    if ($citasSolapadas < $groomer->maxServiciosSimultaneos) {
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

    /**
     * Buscar clientes para el wizard de nueva cita del administrador.
     */
    public function buscarClientes(Request $request)
    {
        $request->validate(['search' => 'required|string|min:2']);

        $clientes = Cliente::with('user')
            ->whereHas('user', function ($q) use ($request) {
                $q->where('activo', true)
                    ->where(function ($q2) use ($request) {
                        $q2->where('nombre', 'like', "%{$request->search}%")
                            ->orWhere('apellido', 'like', "%{$request->search}%")
                            ->orWhere('telefono', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%");
                    });
            })
            ->limit(10)
            ->get()
            ->map(fn($cliente) => [
                'id' => $cliente->idCliente,
                'nombre' => $cliente->user->nombre . ' ' . $cliente->user->apellido,
                'telefono' => $cliente->user->telefono,
                'email' => $cliente->user->email,
                'direccion' => $cliente->direccion,
                'canal_contacto' => $cliente->canalContacto,
            ]);

        return $this->successResponse($clientes, 'Clientes encontrados');
    }

    /**
     * Mascotas del cliente para el wizard de nueva cita.
     */
    public function mascotasPorCliente($clienteId)
    {
        $cliente = Cliente::with('mascotas.rangoPeso')->find($clienteId);

        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }

        $mascotas = $cliente->mascotas->map(fn($mascota) => [
            'id' => $mascota->idMascota,
            'nombre' => $mascota->nombre,
            'especie' => $mascota->especie,
            'raza' => $mascota->raza,
            'peso_kg' => (float) $mascota->pesoKg,
            'rango_nombre' => $mascota->rangoPeso?->nombre,
            'temperamento' => $mascota->temperamento,
        ]);

        return $this->successResponse($mascotas, 'Mascotas obtenidas correctamente');
    }

    /**
     * Servicios activos con duración y precio ajustados por rango de peso.
     */
    public function serviciosConPrecios(Request $request)
    {
        $request->validate(['idMascota' => 'required|exists:mascotas,idMascota']);

        $mascota = Mascota::find($request->idMascota);
        $servicios = Servicio::with('rangosPeso')
            ->get()
            ->map(fn($servicio) => [
                'id' => $servicio->idServicio,
                'nombre' => $servicio->nombre,
                'duracion_minutos' => (int) $servicio->getDuracionForRango($mascota->idRango),
                'precio' => (float) $servicio->getPrecioForRango($mascota->idRango),
                'admite_doble_booking' => (bool) $servicio->admiteDobleBooking,
            ]);

        return $this->successResponse($servicios, 'Servicios obtenidos correctamente');
    }

    /**
     * Crear nueva cita desde el panel de administración.
     */
    public function crearCita(Request $request)
    {
        $request->validate([
            'idCliente' => 'required|exists:clientes,idCliente',
            'idMascota' => 'required|exists:mascotas,idMascota',
            'idServicio' => 'required|exists:servicios,idServicio',
            'idGroomer' => 'required|exists:groomers,idGroomer',
            'fechaHoraInicio' => 'required|date',
            'observaciones' => 'nullable|string',
        ]);

        $mascota = Mascota::find($request->idMascota);
        if ((int) $mascota->idCliente !== (int) $request->idCliente) {
            return $this->errorResponse('La mascota no pertenece al cliente seleccionado', 422);
        }

        $servicio = Servicio::find($request->idServicio);
        $fechaInicio = Carbon::parse($request->fechaHoraInicio);
        $duracion = $servicio->getDuracionForRango($mascota->idRango);
        $fechaFin = $fechaInicio->copy()->addMinutes($duracion);
        $groomer = Groomer::find($request->idGroomer);

        $ocupado = Cita::where('idGroomer', $request->idGroomer)
            ->activas()
            ->solapadas($fechaInicio, $fechaFin)
            ->count() >= ($groomer->maxServiciosSimultaneos ?? 1);

        if ($ocupado) {
            return $this->errorResponse('El horario seleccionado ya no está disponible', 400);
        }

        DB::beginTransaction();

        try {
            $cita = Cita::create([
                'idMascota' => $request->idMascota,
                'idGroomer' => $request->idGroomer,
                'idServicio' => $request->idServicio,
                'idRecepcionista' => null,
                'fechaHoraInicio' => $fechaInicio,
                'fechaHoraFin' => $fechaFin,
                'duracionCalculadaMin' => $duracion,
                'estado' => 'pendiente_confirmacion',
                'confirmacion_expira_at' => now()->addHours(24),
                'observaciones' => $request->observaciones,
            ]);

            Notificacion::create([
                'idCliente' => $request->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'pendiente_confirmacion',
                'canal' => $mascota->cliente->canalContacto ?? 'whatsapp',
                'mensaje' => "Tienes una cita pendiente de confirmación para {$mascota->nombre} el {$fechaInicio->format('d/m/Y H:i')}. Confirma dentro de 24 horas o será cancelada.",
                'fechaEnvio' => now(),
                'entregada' => false,
            ]);

            DB::commit();

            return $this->successResponse(
                $cita->load(['mascota.cliente.user', 'groomer.user', 'servicio']),
                'Cita creada exitosamente',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear cita: ' . $e->getMessage(), 500);
        }
    }
}
