<?php
// app/Http/Controllers/Api/Recepcionista/DashboardController.php

namespace App\Http\Controllers\Api\Recepcionista;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Groomer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends ApiController
{
    /**
     * Obtener estadísticas del dashboard para recepcionista
     */
    public function index(Request $request)
    {
        $fecha = $request->get('fecha', now()->toDateString());
        $recepcionistaId = Auth::user()->recepcionista->idRecepcionista;

        // ========== KPI CARDS ==========
        
        // Total citas del día
        $totalCitasHoy = Cita::whereDate('fechaHoraInicio', $fecha)->count();
        
        // Citas confirmadas del día
        $citasConfirmadasHoy = Cita::whereDate('fechaHoraInicio', $fecha)
            ->where('estado', 'confirmada')
            ->count();
        
        // Citas en curso
        $citasEnCurso = Cita::whereDate('fechaHoraInicio', $fecha)
            ->where('estado', 'en_curso')
            ->count();
        
        // Citas completadas hoy
        $citasCompletadasHoy = Cita::whereDate('fechaHoraInicio', $fecha)
            ->where('estado', 'completada')
            ->count();

        // ========== ESTADO DE CADA GROOMER ==========
        $groomers = Groomer::with('user')->get()->map(function($groomer) use ($fecha) {
            // Verificar si tiene cita en curso
            $citaEnCurso = Cita::where('idGroomer', $groomer->idGroomer)
                ->whereDate('fechaHoraInicio', $fecha)
                ->where('estado', 'en_curso')
                ->exists();
            
            // Verificar si tiene citas hoy
            $citasHoy = Cita::where('idGroomer', $groomer->idGroomer)
                ->whereDate('fechaHoraInicio', $fecha)
                ->count();
            
            // Verificar bloqueo
            $tieneBloqueo = \App\Models\Disponibilidad::where('idGroomer', $groomer->idGroomer)
                ->where('esBloqueo', true)
                ->whereDate('created_at', $fecha)
                ->exists();
            
            $estado = 'libre';
            if ($tieneBloqueo) {
                $estado = 'ausente';
            } elseif ($citaEnCurso) {
                $estado = 'ocupado';
            } elseif ($citasHoy > 0) {
                $estado = 'con_citas';
            }
            
            return [
                'id' => $groomer->idGroomer,
                'nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                'estado' => $estado,
                'total_citas_hoy' => $citasHoy
            ];
        });

        // ========== ALERTAS DE CITAS PRÓXIMAS (30 minutos) ==========
        $alertasCitas = Cita::with(['mascota', 'groomer.user', 'servicio'])
            ->whereBetween('fechaHoraInicio', [now(), now()->addMinutes(30)])
            ->whereIn('estado', ['programada', 'confirmada'])
            ->get()
            ->map(function($cita) {
                return [
                    'id' => $cita->idCita,
                    'mascota' => $cita->mascota->nombre,
                    'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
                    'hora' => $cita->fechaHoraInicio->format('H:i'),
                    'servicio' => $cita->servicio->nombre,
                    'minutos_restantes' => now()->diffInMinutes($cita->fechaHoraInicio)
                ];
            });

        // ========== LISTA DE CITAS DEL DÍA ==========
        $citasDelDia = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio', 'fichaGrooming'])
            ->whereDate('fechaHoraInicio', $fecha)
            ->orderBy('fechaHoraInicio', 'asc')
            ->get()
            ->map(function($cita) {
                $estadosColores = [
                    'programada' => '#3b82f6',
                    'confirmada' => '#10b981',
                    'en_curso' => '#f59e0b',
                    'completada' => '#6b7280',
                    'cancelada' => '#ef4444'
                ];
                
                return [
                    'id' => $cita->idCita,
                    'hora_inicio' => $cita->fechaHoraInicio->format('H:i'),
                    'hora_fin' => $cita->fechaHoraFin->format('H:i'),
                    'mascota' => $cita->mascota->nombre,
                    'cliente' => $cita->mascota->cliente->user->nombre . ' ' . $cita->mascota->cliente->user->apellido,
                    'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
                    'servicio' => $cita->servicio->nombre,
                    'duracion' => $cita->duracionCalculadaMin,
                    'estado' => $cita->estado,
                    'color' => $estadosColores[$cita->estado] ?? '#6b7280',
                    'tiene_ficha' => $cita->fichaGrooming ? true : false,
                    'id_ficha' => $cita->fichaGrooming->idFicha ?? null,
                    'precio' => $cita->servicio->getPrecioForRango($cita->mascota->idRango)
                ];
            });

        return $this->successResponse([
            'kpi' => [
                'total_citas_hoy' => $totalCitasHoy,
                'citas_confirmadas_hoy' => $citasConfirmadasHoy,
                'citas_en_curso' => $citasEnCurso,
                'citas_completadas_hoy' => $citasCompletadasHoy
            ],
            'estado_groomers' => $groomers,
            'alertas_citas' => $alertasCitas,
            'citas_del_dia' => $citasDelDia
        ], 'Dashboard obtenido correctamente');
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
            'mascota' => $cita->mascota->nombre,
            'cliente' => $cita->mascota->cliente->user->nombre . ' ' . $cita->mascota->cliente->user->apellido,
            'cliente_id' => $cita->mascota->cliente->idCliente,
            'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
            'groomer_id' => $cita->idGroomer,
            'servicio' => $cita->servicio->nombre,
            'servicio_id' => $cita->idServicio,
            'hora_inicio' => $cita->fechaHoraInicio->format('Y-m-d H:i'),
            'hora_fin' => $cita->fechaHoraFin->format('H:i'),
            'duracion' => $cita->duracionCalculadaMin,
            'estado' => $cita->estado,
            'precio' => $cita->servicio->getPrecioForRango($cita->mascota->idRango),
            'observaciones' => $cita->observaciones,
            'tiene_ficha' => $cita->fichaGrooming ? true : false,
            'id_ficha' => $cita->fichaGrooming->idFicha ?? null
        ], 'Detalle de cita obtenido correctamente');
    }
}