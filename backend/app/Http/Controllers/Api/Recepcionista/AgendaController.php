<?php

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
     * FIX: se usa ->toDateTimeLocalString() o ->format() para NO incluir offset UTC
     * así FullCalendar interpreta la hora como local y no hace conversión de zona horaria
     */
    public function citas(Request $request)
    {
        $request->validate([
            'fecha'      => 'required|date',
            'groomer_id' => 'nullable|exists:groomers,idGroomer'
        ]);

        $fecha       = Carbon::parse($request->fecha);
        $fechaInicio = $fecha->copy()->startOfDay();
        $fechaFin    = $fecha->copy()->endOfDay();

        $query = Cita::with(['mascota', 'groomer.user', 'servicio', 'fichaGrooming'])
            ->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin]);

        if ($request->filled('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }

        $citas = $query->orderBy('fechaHoraInicio')->get();

        $groomers = Groomer::with('user')->get()->map(fn($g) => [
            'id'     => $g->idGroomer,
            'nombre' => $g->user->nombre . ' ' . $g->user->apellido,
        ]);

        $estadosColores = [
            'programada' => '#3b82f6',
            'confirmada' => '#10b981',
            'en_curso'   => '#f59e0b',
            'completada' => '#6b7280',
            'cancelada'  => '#ef4444',
        ];

        $citasFormateadas = $citas->map(function ($cita) use ($estadosColores) {
            return [
                'id'              => $cita->idCita,
                'title'           => $cita->mascota->nombre . ' - ' . $cita->servicio->nombre,
                // FIX: formato SIN timezone offset → 'Y-m-d\TH:i:s'
                // FullCalendar lo trata como hora local y NO convierte a UTC
                'start'           => $cita->fechaHoraInicio->format('Y-m-d\TH:i:s'),
                'end'             => $cita->fechaHoraFin->format('Y-m-d\TH:i:s'),
                'backgroundColor' => $estadosColores[$cita->estado] ?? '#6b7280',
                'borderColor'     => $estadosColores[$cita->estado] ?? '#6b7280',
                'groomer_id'      => $cita->idGroomer,
                'extendedProps'   => [
                    'estado'     => $cita->estado,
                    'mascota'    => $cita->mascota->nombre,
                    'servicio'   => $cita->servicio->nombre,
                    'tiene_ficha'=> (bool) $cita->fichaGrooming,
                ],
            ];
        });

        return $this->successResponse([
            'citas'    => $citasFormateadas,
            'groomers' => $groomers,
        ], 'Citas obtenidas correctamente');
    }

    /**
     * Detalle de una cita (para el modal en el calendario)
     * Antes vivía en DashboardController – se mueve aquí para consistencia
     */
    public function detalleCita($id)
    {
        $cita = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio', 'fichaGrooming'])
            ->find($id);

        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }

        return $this->successResponse([
            'id'           => $cita->idCita,
            'mascota'      => $cita->mascota->nombre,
            'cliente'      => $cita->mascota->cliente->user->nombre . ' ' . $cita->mascota->cliente->user->apellido,
            'cliente_id'   => $cita->mascota->cliente->idCliente,
            'groomer'      => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
            'groomer_id'   => $cita->idGroomer,
            'servicio'     => $cita->servicio->nombre,
            'servicio_id'  => $cita->idServicio,
            // FIX: mismo formato sin offset para consistencia en el modal
            'hora_inicio'  => $cita->fechaHoraInicio->format('d/m/Y H:i'),
            'hora_fin'     => $cita->fechaHoraFin->format('H:i'),
            'duracion'     => $cita->duracionCalculadaMin,
            'estado'       => $cita->estado,
            // FIX: cast a float para que JSON lo serialice como número, no string
            'precio'       => (float) $cita->servicio->getPrecioForRango($cita->mascota->idRango),
            'observaciones'=> $cita->observaciones,
            'tiene_ficha'  => (bool) $cita->fichaGrooming,
            'id_ficha'     => $cita->fichaGrooming->idFicha ?? null,
        ], 'Detalle de cita obtenido correctamente');
    }

    /**
     * Obtener slots libres para una fecha
     */
    public function slotsLibres(Request $request)
    {
        $request->validate([
            'fecha'      => 'required|date',
            'idServicio' => 'required|exists:servicios,idServicio',
            'idMascota'  => 'required|exists:mascotas,idMascota',
        ]);

        $fecha   = Carbon::parse($request->fecha);
        $mascota = Mascota::find($request->idMascota);
        $servicio = Servicio::find($request->idServicio);
        $duracion = $servicio->getDuracionForRango($mascota->idRango);

        $groomers = Groomer::with('disponibilidades')->get();
        $slots    = [];

        foreach ($groomers as $groomer) {
            $disponibilidad = $groomer->disponibilidades
                ->where('diaSemana', $fecha->dayOfWeek)
                ->where('esBloqueo', false)
                ->first();

            if (!$disponibilidad) continue;

            $horaInicio = Carbon::parse($disponibilidad->horaInicio);
            $horaFin    = Carbon::parse($disponibilidad->horaFin);

            while ($horaInicio->copy()->addMinutes($duracion) <= $horaFin) {
                $slotInicio = $horaInicio->copy();
                $slotFin    = $slotInicio->copy()->addMinutes($duracion);

                $ocupado = Cita::where('idGroomer', $groomer->idGroomer)
                    ->whereDate('fechaHoraInicio', $fecha)
                    ->where(function ($q) use ($slotInicio, $slotFin) {
                        $q->where(function ($q2) use ($slotInicio, $slotFin) {
                            // cita empieza dentro del slot
                            $q2->where('fechaHoraInicio', '>=', $slotInicio)
                               ->where('fechaHoraInicio', '<',  $slotFin);
                        })->orWhere(function ($q2) use ($slotInicio, $slotFin) {
                            // cita termina dentro del slot
                            $q2->where('fechaHoraFin', '>', $slotInicio)
                               ->where('fechaHoraFin', '<=', $slotFin);
                        })->orWhere(function ($q2) use ($slotInicio, $slotFin) {
                            // cita envuelve el slot
                            $q2->where('fechaHoraInicio', '<=', $slotInicio)
                               ->where('fechaHoraFin', '>=', $slotFin);
                        });
                    })
                    ->whereNotIn('estado', ['cancelada', 'completada'])
                    ->exists();

                if (!$ocupado) {
                    $slots[] = [
                        'groomer_id'     => $groomer->idGroomer,
                        'groomer_nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                        'hora_inicio'    => $slotInicio->format('H:i'),
                        'hora_fin'       => $slotFin->format('H:i'),
                    ];
                }

                $horaInicio->addMinutes(30);
            }
        }

        return $this->successResponse($slots, 'Slots disponibles obtenidos correctamente');
    }

    /**
     * Buscar clientes (paso 1 del wizard)
     */
    public function buscarClientes(Request $request)
    {
        $request->validate(['search' => 'required|string|min:2']);

        $clientes = Cliente::with('user')
            ->whereHas('user', function ($q) use ($request) {
                $q->where('nombre',   'like', "%{$request->search}%")
                  ->orWhere('apellido', 'like', "%{$request->search}%")
                  ->orWhere('telefono', 'like', "%{$request->search}%")
                  ->orWhere('email',    'like', "%{$request->search}%");
            })
            ->limit(10)
            ->get()
            ->map(fn($c) => [
                'id'            => $c->idCliente,
                'nombre'        => $c->user->nombre . ' ' . $c->user->apellido,
                'telefono'      => $c->user->telefono,
                'email'         => $c->user->email,
                'direccion'     => $c->direccion,
                'canal_contacto'=> $c->canalContacto,
            ]);

        return $this->successResponse($clientes, 'Clientes encontrados');
    }

    /**
     * Mascotas de un cliente (paso 2)
     */
    public function mascotasPorCliente($clienteId)
    {
        $cliente = Cliente::find($clienteId);
        if (!$cliente) return $this->errorResponse('Cliente no encontrado', 404);

        $mascotas = $cliente->mascotas->map(fn($m) => [
            'id'          => $m->idMascota,
            'nombre'      => $m->nombre,
            'especie'     => $m->especie,
            'raza'        => $m->raza,
            'peso_kg'     => $m->pesoKg,
            'rango_nombre'=> $m->rangoPeso?->nombre,
            'temperamento'=> $m->temperamento,
        ]);

        return $this->successResponse($mascotas, 'Mascotas obtenidas correctamente');
    }

    /**
     * Servicios activos con precios ajustados por rango (paso 3)
     * FIX: se castea precio y duracion a tipos nativos para evitar strings en JSON
     */
    public function serviciosConPrecios(Request $request)
    {
        $request->validate(['idMascota' => 'required|exists:mascotas,idMascota']);

        $mascota  = Mascota::find($request->idMascota);
        $servicios = Servicio::with('rangosPeso')->get();

        $resultado = $servicios->map(fn($s) => [
            'id'                  => $s->idServicio,
            'nombre'              => $s->nombre,
            // FIX: cast a int/float para que JSON los serialice como número
            'duracion_minutos'    => (int)   $s->getDuracionForRango($mascota->idRango),
            'precio'              => (float) $s->getPrecioForRango($mascota->idRango),
            'admite_doble_booking'=> (bool)  $s->admiteDobleBooking,
        ]);

        return $this->successResponse($resultado, 'Servicios obtenidos correctamente');
    }

    /**
     * Crear nueva cita
     */
    public function crearCita(Request $request)
    {
        $request->validate([
            'idCliente'      => 'required|exists:clientes,idCliente',
            'idMascota'      => 'required|exists:mascotas,idMascota',
            'idServicio'     => 'required|exists:servicios,idServicio',
            'idGroomer'      => 'required|exists:groomers,idGroomer',
            'fechaHoraInicio'=> 'required|date',
            'observaciones'  => 'nullable|string',
        ]);

        $mascota     = Mascota::find($request->idMascota);
        $servicio    = Servicio::find($request->idServicio);
        $fechaInicio = Carbon::parse($request->fechaHoraInicio);
        $duracion    = $servicio->getDuracionForRango($mascota->idRango);
        $fechaFin    = $fechaInicio->copy()->addMinutes($duracion);

        $ocupado = Cita::where('idGroomer', $request->idGroomer)
            ->where(function ($q) use ($fechaInicio, $fechaFin) {
                $q->where(function ($q2) use ($fechaInicio, $fechaFin) {
                    $q2->where('fechaHoraInicio', '>=', $fechaInicio)
                    ->where('fechaHoraInicio', '<',  $fechaFin);
                })->orWhere(function ($q2) use ($fechaInicio, $fechaFin) {
                    $q2->where('fechaHoraFin', '>', $fechaInicio)
                    ->where('fechaHoraFin', '<=', $fechaFin);
                })->orWhere(function ($q2) use ($fechaInicio, $fechaFin) {
                    $q2->where('fechaHoraInicio', '<=', $fechaInicio)
                    ->where('fechaHoraFin', '>=', $fechaFin);
                });
            })
            ->whereNotIn('estado', ['cancelada', 'completada'])
            ->exists();

        if ($ocupado) {
            return $this->errorResponse('El horario seleccionado ya no está disponible', 400);
        }

        DB::beginTransaction();
        try {
            $recepcionista = Auth::user()->recepcionista;
            if (!$recepcionista) {
                return $this->errorResponse('Usuario no es recepcionista', 403);
            }

            // ✅ CORREGIDO: Añadir confirmacion_expira_at
            $cita = Cita::create([
                'idMascota'          => $request->idMascota,
                'idGroomer'          => $request->idGroomer,
                'idServicio'         => $request->idServicio,
                'idRecepcionista'    => $recepcionista->idRecepcionista,
                'fechaHoraInicio'    => $fechaInicio,
                'fechaHoraFin'       => $fechaFin,
                'duracionCalculadaMin'=> $duracion,
                'estado'             => 'pendiente_confirmacion', // ← NUEVO ESTADO
                'confirmacion_expira_at' => Carbon::now()->addHours(24), // ← NUEVO
                'observaciones'      => $request->observaciones,
            ]);

            // ✅ CORREGIDO: Tipo de notificación
            Notificacion::create([
                'idCliente'  => $request->idCliente,
                'idCita'     => $cita->idCita,
                'tipo'       => 'pendiente_confirmacion', // ← NUEVO TIPO
                'canal'      => $mascota->cliente->canalContacto ?? 'whatsapp',
                'mensaje'    => "Tienes una cita pendiente de confirmación para {$mascota->nombre} el {$fechaInicio->format('d/m/Y H:i')}. Confirma dentro de 24 horas o será cancelada.",
                'fechaEnvio' => now(),
                'entregada'  => false,
            ]);

            DB::commit();
            return $this->successResponse(
                $cita->load(['mascota', 'groomer.user', 'servicio']),
                'Cita creada exitosamente',
                201
            );
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
        if (!$cita) return $this->errorResponse('Cita no encontrada', 404);

        $cita->estado = 'confirmada';
        $cita->save();

        Notificacion::create([
            'idCliente'  => $cita->mascota->idCliente,
            'idCita'     => $cita->idCita,
            'tipo'       => 'confirmacion',
            'canal'      => $cita->mascota->cliente->canalContacto ?? 'whatsapp',
            'mensaje'    => "Tu cita ha sido confirmada para el {$cita->fechaHoraInicio->format('d/m/Y H:i')}",
            'fechaEnvio' => now(),
            'entregada'  => false,
        ]);

        return $this->successResponse($cita, 'Cita confirmada correctamente');
    }

    /**
     * Cancelar cita
     */
    public function cancelarCita($id)
    {
        $cita = Cita::find($id);
        if (!$cita) return $this->errorResponse('Cita no encontrada', 404);

        if (in_array($cita->estado, ['completada', 'cancelada', 'en_curso'])) {
            return $this->errorResponse('No se puede cancelar esta cita', 400);
        }

        $cita->estado = 'cancelada';
        $cita->save();

        Notificacion::create([
            'idCliente'  => $cita->mascota->idCliente,
            'idCita'     => $cita->idCita,
            'tipo'       => 'cancelacion',
            'canal'      => $cita->mascota->cliente->canalContacto ?? 'whatsapp',
            'mensaje'    => "Tu cita para {$cita->mascota->nombre} ha sido cancelada",
            'fechaEnvio' => now(),
            'entregada'  => false,
        ]);

        return $this->successResponse(null, 'Cita cancelada correctamente');
    }

    /**
     * Reprogramar cita
     */
    public function reprogramarCita(Request $request, $id)
    {
        $cita = Cita::find($id);
        if (!$cita) return $this->errorResponse('Cita no encontrada', 404);

        $request->validate([
            'fechaHoraInicio' => 'required|date',
            'idGroomer'       => 'required|exists:groomers,idGroomer',
        ]);

        $fechaInicio = Carbon::parse($request->fechaHoraInicio);
        $duracion    = $cita->duracionCalculadaMin;
        $fechaFin    = $fechaInicio->copy()->addMinutes($duracion);

        $ocupado = Cita::where('idGroomer', $request->idGroomer)
            ->where('idCita', '!=', $id)
            ->where(function ($q) use ($fechaInicio, $fechaFin) {
                $q->where(function ($q2) use ($fechaInicio, $fechaFin) {
                    $q2->where('fechaHoraInicio', '>=', $fechaInicio)
                       ->where('fechaHoraInicio', '<',  $fechaFin);
                })->orWhere(function ($q2) use ($fechaInicio, $fechaFin) {
                    $q2->where('fechaHoraFin', '>', $fechaInicio)
                       ->where('fechaHoraFin', '<=', $fechaFin);
                })->orWhere(function ($q2) use ($fechaInicio, $fechaFin) {
                    $q2->where('fechaHoraInicio', '<=', $fechaInicio)
                       ->where('fechaHoraFin', '>=', $fechaFin);
                });
            })
            ->whereNotIn('estado', ['cancelada', 'completada'])
            ->exists();

        if ($ocupado) {
            return $this->errorResponse('El horario seleccionado no está disponible', 400);
        }

        $cita->update([
            'fechaHoraInicio' => $fechaInicio,
            'fechaHoraFin'    => $fechaFin,
            'idGroomer'       => $request->idGroomer,
        ]);

        Notificacion::create([
            'idCliente'  => $cita->mascota->idCliente,
            'idCita'     => $cita->idCita,
            'tipo'       => 'reprogramacion',
            'canal'      => $cita->mascota->cliente->canalContacto ?? 'whatsapp',
            'mensaje'    => "Tu cita ha sido reprogramada para el {$fechaInicio->format('d/m/Y H:i')}",
            'fechaEnvio' => now(),
            'entregada'  => false,
        ]);

        return $this->successResponse(
            $cita->load(['mascota', 'groomer.user', 'servicio']),
            'Cita reprogramada correctamente'
        );
    }
}