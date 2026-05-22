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
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Factura;
use App\Models\Pago;
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

        return $this->successResponse($this->formatearDetalleCita($cita), 'Detalle de cita obtenido correctamente');

    }

    /**
     * Registrar el cobro de una cita completada y reflejarlo como venta de servicio.
     */
    public function registrarPago(Request $request, $id)
    {
        $request->validate([
            'medio_pago' => 'required|in:efectivo,qr,transferencia',
        ]);

        DB::beginTransaction();

        try {
            $cita = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio', 'fichaGrooming'])
                ->lockForUpdate()
                ->find($id);

            if (!$cita) {
                DB::rollBack();
                return $this->errorResponse('Cita no encontrada', 404);
            }

            if ($cita->estado !== 'completada') {
                DB::rollBack();
                return $this->errorResponse('Solo se puede cobrar una cita completada', 400);
            }

            if ($cita->pagado) {
                DB::rollBack();
                return $this->errorResponse('Esta cita ya fue cobrada', 409);
            }

            $recepcionista = Auth::user()->recepcionista;
            if (!$recepcionista) {
                DB::rollBack();
                return $this->errorResponse('Usuario no es recepcionista', 403);
            }

            $precio = (float) $cita->servicio->getPrecioForRango($cita->mascota->idRango);
            $ahora = now();

            $venta = Venta::create([
                'idCliente' => $cita->mascota->idCliente,
                'idRecepcionista' => $recepcionista->idRecepcionista,
                'fecha' => $ahora,
                'total' => $precio,
                'medioPago' => $request->medio_pago,
                'estado' => 'pagado',
            ]);

            DetalleVenta::create([
                'idVenta' => $venta->idVenta,
                'idVariante' => null,
                'tipo' => 'servicio',
                'descripcion' => $cita->servicio->nombre,
                'cantidad' => 1,
                'precioUnitario' => $precio,
                'subtotal' => $precio,
            ]);

            $factura = Factura::create([
                'idVenta' => $venta->idVenta,
                'numeroFactura' => 'FAC-' . str_pad($venta->idVenta, 8, '0', STR_PAD_LEFT),
                'fechaEmision' => $ahora,
                'montoTotal' => $precio,
                'estado' => 'emitida',
            ]);

            Pago::create([
                'idFactura' => $factura->idFactura,
                'monto' => $precio,
                'metodo' => $request->medio_pago,
                'fechaPago' => $ahora,
                'referencia' => 'SERV-' . $cita->idCita . '-' . uniqid(),
            ]);

            $cita->update([
                'pagado' => true,
                'pago_metodo' => $request->medio_pago,
                'pago_fecha' => $ahora,
            ]);

            DB::commit();

            $cita->refresh()->load(['mascota.cliente.user', 'groomer.user', 'servicio', 'fichaGrooming']);

            return $this->successResponse([
                'cita' => $this->formatearDetalleCita($cita),
                'venta_id' => $venta->idVenta,
                'factura_id' => $factura->idFactura,
            ], 'Pago registrado correctamente', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al registrar pago: ' . $e->getMessage(), 500);
        }
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
            if ($groomer->disponibilidades->where('esBloqueo', false)->isEmpty()) {
                $groomer->crearDisponibilidadDefault();
                $groomer->load('disponibilidades');
            }

            $disponibilidad = $groomer->disponibilidades
                ->where('diaSemana', $fecha->dayOfWeek)
                ->where('esBloqueo', false)
                ->first();

            if (!$disponibilidad) continue;

            $horaInicio = $fecha->copy()->setTimeFromTimeString(Carbon::parse($disponibilidad->horaInicio)->format('H:i:s'));
            $horaFin    = $fecha->copy()->setTimeFromTimeString(Carbon::parse($disponibilidad->horaFin)->format('H:i:s'));

            while ($horaInicio->copy()->addMinutes($duracion) <= $horaFin) {
                $slotInicio = $horaInicio->copy();
                $slotFin    = $slotInicio->copy()->addMinutes($duracion);

                $citasSolapadas = Cita::where('idGroomer', $groomer->idGroomer)
                    ->activas()
                    ->solapadas($slotInicio, $slotFin)
                    ->count();

                if ($citasSolapadas < $groomer->maxServiciosSimultaneos) {
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

        $groomer = Groomer::find($request->idGroomer);
        $ocupado = Cita::where('idGroomer', $request->idGroomer)
            ->where('idCita', '!=', $id)
            ->activas()
            ->solapadas($fechaInicio, $fechaFin)
            ->count() >= ($groomer->maxServiciosSimultaneos ?? 1);

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

    private function formatearDetalleCita(Cita $cita): array
    {
        return [
            'id'           => $cita->idCita,
            'mascota'      => $cita->mascota->nombre,
            'cliente'      => $cita->mascota->cliente->user->nombre . ' ' . $cita->mascota->cliente->user->apellido,
            'cliente_id'   => $cita->mascota->cliente->idCliente,
            'groomer'      => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
            'groomer_id'   => $cita->idGroomer,
            'servicio'     => $cita->servicio->nombre,
            'servicio_id'  => $cita->idServicio,
            'hora_inicio'  => $cita->fechaHoraInicio->format('d/m/Y H:i'),
            'hora_fin'     => $cita->fechaHoraFin->format('H:i'),
            'duracion'     => $cita->duracionCalculadaMin,
            'estado'       => $cita->estado,
            'precio'       => (float) $cita->servicio->getPrecioForRango($cita->mascota->idRango),
            'pagado'       => (bool) $cita->pagado,
            'pago_metodo'  => $cita->pago_metodo,
            'pago_fecha'   => $cita->pago_fecha?->format('d/m/Y H:i'),
            'observaciones'=> $cita->observaciones,
            'tiene_ficha'  => (bool) $cita->fichaGrooming,
            'id_ficha'     => $cita->fichaGrooming->idFicha ?? null,
        ];
    }
}
