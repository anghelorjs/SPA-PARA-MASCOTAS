<?php
// app/Http/Controllers/Api/Groomer/DashboardController.php

namespace App\Http\Controllers\Api\Groomer;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\FichaGrooming;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends ApiController
{
    /**
     * Obtener dashboard del groomer
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $groomer = $user->groomer;
        $fecha = $request->get('fecha', now()->toDateString());
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        // ========== TARJETAS DE ESTADO ==========
        
        // Total citas asignadas hoy
        $totalCitasHoy = Cita::where('idGroomer', $groomer->idGroomer)
            ->whereDate('fechaHoraInicio', $fecha)
            ->count();
        
        // Citas completadas hoy
        $citasCompletadasHoy = Cita::where('idGroomer', $groomer->idGroomer)
            ->whereDate('fechaHoraInicio', $fecha)
            ->where('estado', 'completada')
            ->count();
        
        // Citas en curso
        $citasEnCurso = Cita::where('idGroomer', $groomer->idGroomer)
            ->whereDate('fechaHoraInicio', $fecha)
            ->where('estado', 'en_curso')
            ->count();
        
        // Citas pendientes (programadas + confirmadas)
        $citasPendientes = Cita::where('idGroomer', $groomer->idGroomer)
            ->whereDate('fechaHoraInicio', $fecha)
            ->whereIn('estado', ['programada', 'confirmada'])
            ->count();
        
        // Próxima cita
        $proximaCita = Cita::with(['mascota', 'servicio'])
            ->where('idGroomer', $groomer->idGroomer)
            ->whereDate('fechaHoraInicio', $fecha)
            ->whereIn('estado', ['programada', 'confirmada'])
            ->orderBy('fechaHoraInicio', 'asc')
            ->first();
        
        $tiempoRestante = null;
        if ($proximaCita) {
            $tiempoRestante = now()->diffInMinutes($proximaCita->fechaHoraInicio, false);
            $tiempoRestante = $tiempoRestante > 0 ? $tiempoRestante : 0;
        }
        
        // ========== LISTA DE CITAS DEL DÍA ==========
        $citasDelDia = Cita::with(['mascota.cliente.user', 'servicio', 'fichaGrooming'])
            ->where('idGroomer', $groomer->idGroomer)
            ->whereDate('fechaHoraInicio', $fecha)
            ->orderBy('fechaHoraInicio', 'asc')
            ->get()
            ->map(function($cita) {
                $estados = [
                    'programada' => ['texto' => 'Programada', 'color' => '#3b82f6'],
                    'confirmada' => ['texto' => 'Confirmada', 'color' => '#10b981'],
                    'en_curso' => ['texto' => 'En curso', 'color' => '#f59e0b'],
                    'completada' => ['texto' => 'Completada', 'color' => '#6b7280'],
                    'cancelada' => ['texto' => 'Cancelada', 'color' => '#ef4444']
                ];
                
                $mascota = $cita->mascota;
                $rangoNombre = $mascota->rangoPeso ? $mascota->rangoPeso->nombre : 'No asignado';
                
                return [
                    'id' => $cita->idCita,
                    'hora_inicio' => $cita->fechaHoraInicio->format('H:i'),
                    'hora_fin' => $cita->fechaHoraFin->format('H:i'),
                    'duracion' => $cita->duracionCalculadaMin,
                    'mascota' => [
                        'id' => $mascota->idMascota,
                        'nombre' => $mascota->nombre,
                        'especie' => $mascota->especie,
                        'raza' => $mascota->raza,
                        'peso_kg' => $mascota->pesoKg,
                        'rango_nombre' => $rangoNombre,
                        'temperamento' => $mascota->temperamento,
                        'alergias' => $mascota->alergias,
                        'restricciones' => $mascota->restricciones,
                        'vacunas' => $mascota->vacunas
                    ],
                    'servicio' => [
                        'id' => $cita->servicio->idServicio,
                        'nombre' => $cita->servicio->nombre
                    ],
                    'estado' => $cita->estado,
                    'estado_texto' => $estados[$cita->estado]['texto'],
                    'estado_color' => $estados[$cita->estado]['color'],
                    'tiene_ficha' => $cita->fichaGrooming ? true : false,
                    'ficha_id' => $cita->fichaGrooming->idFicha ?? null,
                    'ficha_abierta' => $cita->fichaGrooming && !$cita->fichaGrooming->fechaCierre ? true : false
                ];
            });
        
        // ========== ÚLTIMAS RECOMENDACIONES ==========
        $ultimasRecomendaciones = FichaGrooming::with(['cita.mascota', 'cita.servicio'])
            ->where('idGroomer', $groomer->idGroomer)
            ->whereNotNull('recomendaciones')
            ->whereNotNull('fechaCierre')
            ->orderBy('fechaCierre', 'desc')
            ->limit(5)
            ->get()
            ->map(function($ficha) {
                return [
                    'id' => $ficha->idFicha,
                    'mascota' => $ficha->cita->mascota->nombre,
                    'servicio' => $ficha->cita->servicio->nombre,
                    'recomendacion' => $ficha->recomendaciones,
                    'fecha' => $ficha->fechaCierre->format('d/m/Y')
                ];
            });
        
        return $this->successResponse([
            'kpi' => [
                'total_citas_hoy' => $totalCitasHoy,
                'citas_completadas' => $citasCompletadasHoy,
                'citas_en_curso' => $citasEnCurso,
                'citas_pendientes' => $citasPendientes,
                'proxima_cita' => $proximaCita ? [
                    'hora' => $proximaCita->fechaHoraInicio->format('H:i'),
                    'mascota' => $proximaCita->mascota->nombre,
                    'minutos_restantes' => $tiempoRestante
                ] : null
            ],
            'citas_del_dia' => $citasDelDia,
            'ultimas_recomendaciones' => $ultimasRecomendaciones
        ], 'Dashboard obtenido correctamente');
    }
}