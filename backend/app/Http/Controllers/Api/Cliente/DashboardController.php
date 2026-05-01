<?php
// app/Http/Controllers/Api/Cliente/DashboardController.php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Notificacion;
use App\Models\FichaGrooming;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends ApiController
{
    /**
     * Obtener dashboard del cliente
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        // ========== PRÓXIMA CITA ==========
        $proximaCita = Cita::with(['mascota', 'groomer.user', 'servicio'])
            ->whereHas('mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })
            ->whereIn('estado', ['programada', 'confirmada'])
            ->whereDate('fechaHoraInicio', '>=', now())
            ->orderBy('fechaHoraInicio', 'asc')
            ->first();
        
        $proximaCitaData = null;
        if ($proximaCita) {
            $estadosColores = [
                'programada' => '#3b82f6',
                'confirmada' => '#10b981'
            ];
            
            $proximaCitaData = [
                'id' => $proximaCita->idCita,
                'fecha' => $proximaCita->fechaHoraInicio->format('d/m/Y'),
                'hora' => $proximaCita->fechaHoraInicio->format('H:i'),
                'servicio' => $proximaCita->servicio->nombre,
                'groomer' => $proximaCita->groomer->user->nombre . ' ' . $proximaCita->groomer->user->apellido,
                'mascota' => $proximaCita->mascota->nombre,
                'estado' => $proximaCita->estado,
                'estado_color' => $estadosColores[$proximaCita->estado] ?? '#6b7280'
            ];
        }
        
        // ========== NOTIFICACIONES RECIENTES NO LEÍDAS ==========
        $notificacionesRecientes = Notificacion::where('idCliente', $cliente->idCliente)
            ->where('entregada', false)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function($notificacion) {
                return [
                    'id' => $notificacion->idNotificacion,
                    'tipo' => $notificacion->tipo,
                    'mensaje_resumido' => substr($notificacion->mensaje, 0, 100) . (strlen($notificacion->mensaje) > 100 ? '...' : ''),
                    'fecha' => $notificacion->created_at->format('d/m/Y H:i'),
                    'leida' => $notificacion->entregada
                ];
            });
        
        $totalNotificacionesNoLeidas = Notificacion::where('idCliente', $cliente->idCliente)
            ->where('entregada', false)
            ->count();
        
        // ========== RECOMENDACIÓN RECIENTE ==========
        $recomendacionReciente = FichaGrooming::with(['cita.mascota', 'cita.servicio', 'groomer.user'])
            ->whereHas('cita.mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })
            ->whereNotNull('recomendaciones')
            ->whereNotNull('fechaCierre')
            ->orderBy('fechaCierre', 'desc')
            ->first();
        
        $recomendacionData = null;
        if ($recomendacionReciente) {
            $recomendacionData = [
                'id' => $recomendacionReciente->idFicha,
                'recomendacion' => $recomendacionReciente->recomendaciones,
                'mascota' => $recomendacionReciente->cita->mascota->nombre,
                'fecha' => $recomendacionReciente->fechaCierre->format('d/m/Y'),
                'servicio' => $recomendacionReciente->cita->servicio->nombre,
                'groomer' => $recomendacionReciente->groomer->user->nombre . ' ' . $recomendacionReciente->groomer->user->apellido
            ];
        }
        
        // ========== ESTADÍSTICAS RÁPIDAS ==========
        $totalMascotas = $cliente->mascotas()->count();
        $totalCitasCompletadas = Cita::whereHas('mascota', function($q) use ($cliente) {
            $q->where('idCliente', $cliente->idCliente);
        })->where('estado', 'completada')->count();
        
        $totalCompras = $cliente->ventas()->where('estado', 'pagado')->count();
        
        return $this->successResponse([
            'proxima_cita' => $proximaCitaData,
            'notificaciones' => [
                'recientes' => $notificacionesRecientes,
                'total_no_leidas' => $totalNotificacionesNoLeidas
            ],
            'recomendacion' => $recomendacionData,
            'estadisticas' => [
                'total_mascotas' => $totalMascotas,
                'total_citas_completadas' => $totalCitasCompletadas,
                'total_compras' => $totalCompras
            ]
        ], 'Dashboard obtenido correctamente');
    }
}