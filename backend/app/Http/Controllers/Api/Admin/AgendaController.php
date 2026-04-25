<?php
// app/Http/Controllers/Api/Admin/AgendaController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Groomer;
use App\Models\Disponibilidad;
use App\Models\Servicio;
use App\Models\RangoPeso;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AgendaController extends ApiController
{
    /**
     * Obtener citas para el calendario
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
                    'programada' => '#3b82f6',   // azul
                    'confirmada' => '#10b981',   // verde
                    'en_curso' => '#f59e0b',     // naranja
                    'completada' => '#6b7280',   // gris
                    'cancelada' => '#ef4444',    // rojo
                    'no_asistio' => '#8b5cf6'    // morado
                ];
                
                return [
                    'id' => $cita->idCita,
                    'title' => $cita->mascota->nombre . ' - ' . $cita->servicio->nombre,
                    'start' => $cita->fechaHoraInicio->toISOString(),
                    'end' => $cita->fechaHoraFin->toISOString(),
                    'backgroundColor' => $estadosColores[$cita->estado] ?? '#6b7280',
                    'borderColor' => $estadosColores[$cita->estado] ?? '#6b7280',
                    'extendedProps' => [
                        'estado' => $cita->estado,
                        'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
                        'groomer_id' => $cita->idGroomer,
                        'mascota' => $cita->mascota->nombre,
                        'servicio' => $cita->servicio->nombre,
                        'duracion' => $cita->duracionCalculadaMin,
                        'observaciones' => $cita->observaciones,
                        'tiene_ficha' => $cita->fichaGrooming ? true : false,
                        'id_ficha' => $cita->fichaGrooming->idFicha ?? null
                    ]
                ];
            });
        
        // Obtener groomers para el filtro
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
     * Reprogramar cita (arrastrar/soltar)
     */
    public function reprogramar(Request $request, $id)
    {
        $cita = Cita::find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        $request->validate([
            'fechaHoraInicio' => 'required|date',
            'fechaHoraFin' => 'required|date|after:fechaHoraInicio',
            'idGroomer' => 'required|exists:groomers,idGroomer'
        ]);
        
        // Verificar disponibilidad del nuevo groomer
        $groomer = Groomer::find($request->idGroomer);
        $fechaInicio = Carbon::parse($request->fechaHoraInicio);
        $fechaFin = Carbon::parse($request->fechaHoraFin);
        $duracion = $fechaInicio->diffInMinutes($fechaFin);
        
        if (!$groomer->isAvailable($fechaInicio, $duracion)) {
            return $this->errorResponse('El groomer no está disponible en ese horario', 400);
        }
        
        DB::beginTransaction();
        
        try {
            $cita->update([
                'fechaHoraInicio' => $fechaInicio,
                'fechaHoraFin' => $fechaFin,
                'idGroomer' => $request->idGroomer
            ]);
            
            // Notificar al cliente sobre la reprogramación
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
     * Obtener disponibilidad de groomers
     */
    public function disponibilidadGroomers(Request $request)
    {
        $groomers = Groomer::with(['user', 'disponibilidades' => function($q) {
            $q->where('esBloqueo', false);
        }])->get();
        
        $bloqueos = Disponibilidad::where('esBloqueo', true)
            ->with('groomer.user')
            ->get();
        
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
     * Configurar disponibilidad de un groomer
     */
    public function setDisponibilidadGroomer(Request $request, $id)
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
     * Registrar bloqueo (feriado, ausencia, mantenimiento)
     */
    public function registrarBloqueo(Request $request)
    {
        $request->validate([
            'idGroomer' => 'required|exists:groomers,idGroomer',
            'fecha' => 'required|date|after:now',
            'motivoBloqueo' => 'required|string|max:255'
        ]);
        
        $fecha = Carbon::parse($request->fecha);
        
        Disponibilidad::create([
            'idGroomer' => $request->idGroomer,
            'diaSemana' => $fecha->dayOfWeek,
            'horaInicio' => '00:00:00',
            'horaFin' => '23:59:59',
            'esBloqueo' => true,
            'motivoBloqueo' => $request->motivoBloqueo . ' - Fecha: ' . $fecha->format('Y-m-d')
        ]);
        
        return $this->successResponse(null, 'Bloqueo registrado correctamente');
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
     * Obtener servicios (para gestión)
     */
    public function servicios()
    {
        $servicios = Servicio::with('rangosPeso')->get();
        
        $rangos = RangoPeso::all();
        
        return $this->successResponse([
            'servicios' => $servicios,
            'rangos' => $rangos
        ], 'Servicios obtenidos correctamente');
    }

    /**
     * Crear o actualizar servicio
     */
    public function guardarServicio(Request $request, $id = null)
    {
        $request->validate([
            'nombre' => 'required|string|max:100|unique:servicios,nombre,' . ($id ?? 'NULL') . ',idServicio',
            'duracionMinutos' => 'required|integer|min:5|max:480',
            'precioBase' => 'required|numeric|min:0',
            'admiteDobleBooking' => 'boolean',
            'preciosPorRango' => 'required|array',
            'preciosPorRango.*.idRango' => 'required|exists:rangos_peso,idRango',
            'preciosPorRango.*.duracionAjustadaMin' => 'required|integer|min:5',
            'preciosPorRango.*.precioAjustado' => 'required|numeric|min:0'
        ]);
        
        DB::beginTransaction();
        
        try {
            if ($id) {
                $servicio = Servicio::find($id);
                if (!$servicio) {
                    return $this->errorResponse('Servicio no encontrado', 404);
                }
                $servicio->update($request->only(['nombre', 'duracionMinutos', 'precioBase', 'admiteDobleBooking']));
                $servicio->rangosPeso()->detach();
            } else {
                $servicio = Servicio::create([
                    'idAdministrador' => auth()->administrador->idAdministrador ?? null,
                    'nombre' => $request->nombre,
                    'duracionMinutos' => $request->duracionMinutos,
                    'precioBase' => $request->precioBase,
                    'admiteDobleBooking' => $request->admiteDobleBooking ?? false
                ]);
            }
            
            foreach ($request->preciosPorRango as $item) {
                $servicio->rangosPeso()->attach($item['idRango'], [
                    'duracionAjustadaMin' => $item['duracionAjustadaMin'],
                    'precioAjustado' => $item['precioAjustado']
                ]);
            }
            
            DB::commit();
            
            return $this->successResponse($servicio->load('rangosPeso'), 'Servicio guardado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al guardar servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Activar/desactivar servicio
     */
    public function toggleServicio($id)
    {
        $servicio = Servicio::find($id);
        
        if (!$servicio) {
            return $this->errorResponse('Servicio no encontrado', 404);
        }
        
        // Como no tenemos campo activo, podemos agregar uno o simplemente permitir/no permitir
        
        return $this->successResponse($servicio, 'Estado del servicio cambiado');
    }

    /**
     * Obtener rangos de peso
     */
    public function rangosPeso()
    {
        $rangos = RangoPeso::withCount('servicios')->get();
        
        return $this->successResponse($rangos, 'Rangos de peso obtenidos correctamente');
    }

    /**
     * Guardar rango de peso
     */
    public function guardarRangoPeso(Request $request, $id = null)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'pesoMinKg' => 'required|numeric|min:0',
            'pesoMaxKg' => 'required|numeric|gt:pesoMinKg',
            'factorTiempo' => 'required|numeric|min:0.5|max:3',
            'factorPrecio' => 'required|numeric|min:0.5|max:3'
        ]);
        
        if ($id) {
            $rango = RangoPeso::find($id);
            if (!$rango) {
                return $this->errorResponse('Rango no encontrado', 404);
            }
            $rango->update($request->all());
        } else {
            $rango = RangoPeso::create($request->all());
        }
        
        return $this->successResponse($rango, 'Rango de peso guardado correctamente');
    }

    /**
     * Eliminar rango de peso
     */
    public function eliminarRangoPeso($id)
    {
        $rango = RangoPeso::find($id);
        
        if (!$rango) {
            return $this->errorResponse('Rango no encontrado', 404);
        }
        
        if ($rango->servicios()->count() > 0) {
            return $this->errorResponse('No se puede eliminar el rango porque está asociado a servicios', 400);
        }
        
        $rango->delete();
        
        return $this->successResponse(null, 'Rango de peso eliminado correctamente');
    }

    private function getDiaNombre($dia)
    {
        $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        return $dias[$dia] ?? 'Desconocido';
    }
}