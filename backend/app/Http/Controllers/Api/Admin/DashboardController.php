<?php
// app/Http/Controllers/Api/Admin/DashboardController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Venta;
use App\Models\Groomer;
use App\Models\Producto;
use App\Models\Insumo;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends ApiController
{
    /**
     * Obtener estadísticas completas del dashboard
     */
    public function index(Request $request)
    {
        $fecha = $request->get('fecha', now()->toDateString());
        $fechaInicio = $request->get('fecha_inicio', now()->startOfMonth());
        $fechaFin = $request->get('fecha_fin', now());

        // ========== KPI CARDS ==========
        
        // Total citas del día
        $totalCitasHoy = Cita::whereDate('fechaHoraInicio', $fecha)->count();
        
        // Ingresos del día
        $ingresosHoy = Venta::whereDate('fecha', $fecha)
            ->where('estado', 'pagado')
            ->sum('total');
        
        // Groomers activos (con al menos una cita hoy)
        $groomersActivos = Groomer::whereHas('citas', function($q) use ($fecha) {
            $q->whereDate('fechaHoraInicio', $fecha);
        })->count();
        
        // Mascotas atendidas hoy
        $mascotasAtendidas = Cita::whereDate('fechaHoraInicio', $fecha)
            ->where('estado', 'completada')
            ->count();

        // ========== GRÁFICA: Citas por día (semana actual vs anterior) ==========
        $semanaActual = [];
        $semanaAnterior = [];
        
        for ($i = 0; $i < 7; $i++) {
            $fechaActual = now()->startOfWeek()->addDays($i);
            $fechaAnterior = now()->subWeek()->startOfWeek()->addDays($i);
            
            $semanaActual[] = [
                'fecha' => $fechaActual->format('Y-m-d'),
                'dia' => $fechaActual->locale('es')->isoFormat('dddd'),
                'citas' => Cita::whereDate('fechaHoraInicio', $fechaActual)->count()
            ];
            
            $semanaAnterior[] = [
                'fecha' => $fechaAnterior->format('Y-m-d'),
                'dia' => $fechaAnterior->locale('es')->isoFormat('dddd'),
                'citas' => Cita::whereDate('fechaHoraInicio', $fechaAnterior)->count()
            ];
        }

        // ========== GRÁFICA DONA: Ocupación por groomer ==========
        $totalCitasPeriodo = Cita::whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])->count();
        
        $ocupacionGroomers = Groomer::with('user')->get()->map(function($groomer) use ($fechaInicio, $fechaFin, $totalCitasPeriodo) {
            $citasGroomer = Cita::where('idGroomer', $groomer->idGroomer)
                ->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
                ->count();
            
            return [
                'idGroomer' => $groomer->idGroomer,
                'nombre' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                'citas' => $citasGroomer,
                'porcentaje' => $totalCitasPeriodo > 0 ? round(($citasGroomer / $totalCitasPeriodo) * 100, 2) : 0
            ];
        });

        // ========== TABLA: Top 5 servicios más solicitados ==========
        $topServicios = Cita::select('servicios.nombre', DB::raw('count(*) as total'))
            ->join('servicios', 'citas.idServicio', '=', 'servicios.idServicio')
            ->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
            ->groupBy('servicios.idServicio', 'servicios.nombre')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // ========== TABLA: Top 5 productos más vendidos ==========
        $topProductos = DB::table('detalle_ventas')
            ->join('variante_productos', 'detalle_ventas.idVariante', '=', 'variante_productos.idVariante')
            ->join('productos', 'variante_productos.idProducto', '=', 'productos.idProducto')
            ->join('ventas', 'detalle_ventas.idVenta', '=', 'ventas.idVenta')
            ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
            ->where('ventas.estado', 'pagado')
            ->select('productos.nombre', DB::raw('SUM(detalle_ventas.cantidad) as total_vendidos'))
            ->groupBy('productos.idProducto', 'productos.nombre')
            ->orderBy('total_vendidos', 'desc')
            ->limit(5)
            ->get();

        // ========== ALERTAS: Stock bajo ==========
        $productosBajoStock = Producto::with('variantes')
            ->whereHas('variantes', function($q) {
                $q->whereRaw('stock <= 5');
            })
            ->get()
            ->map(function($producto) {
                return [
                    'idProducto' => $producto->idProducto,
                    'nombre' => $producto->nombre,
                    'stock_total' => $producto->variantes->sum('stock'),
                    'stock_minimo' => 5,
                    'tipo' => 'producto'
                ];
            });
        
        $insumosBajoStock = Insumo::whereRaw('stockActual <= stockMinimo')
            ->get()
            ->map(function($insumo) {
                return [
                    'idInsumo' => $insumo->idInsumo,
                    'nombre' => $insumo->nombre,
                    'stock_actual' => $insumo->stockActual,
                    'stock_minimo' => $insumo->stockMinimo,
                    'tipo' => 'insumo'
                ];
            });
        
        $alertasStock = $productosBajoStock->concat($insumosBajoStock);

        // ========== ÚLTIMAS NOTIFICACIONES ==========
        $ultimasNotificaciones = Notificacion::with('cliente.user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($notificacion) {
                return [
                    'idNotificacion' => $notificacion->idNotificacion,
                    'tipo' => $notificacion->tipo,
                    'mensaje' => $notificacion->mensaje,
                    'cliente' => $notificacion->cliente->user->nombre . ' ' . $notificacion->cliente->user->apellido,
                    'fecha' => $notificacion->created_at->format('Y-m-d H:i'),
                    'entregada' => $notificacion->entregada
                ];
            });

        // ========== ÚLTIMAS CITAS ==========
        $ultimasCitas = Cita::with(['mascota', 'groomer.user', 'servicio'])
            ->orderBy('fechaHoraInicio', 'desc')
            ->limit(10)
            ->get()
            ->map(function($cita) {
                $estados = [
                    'programada' => 'azul',
                    'confirmada' => 'verde',
                    'en_curso' => 'naranja',
                    'completada' => 'gris',
                    'cancelada' => 'rojo'
                ];
                
                return [
                    'idCita' => $cita->idCita,
                    'fecha' => $cita->fechaHoraInicio->format('Y-m-d H:i'),
                    'groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
                    'servicio' => $cita->servicio->nombre,
                    'mascota' => $cita->mascota->nombre,
                    'estado' => $cita->estado,
                    'color' => $estados[$cita->estado] ?? 'gris'
                ];
            });

        return $this->successResponse([
            'kpi' => [
                'total_citas_hoy' => $totalCitasHoy,
                'ingresos_hoy' => $ingresosHoy,
                'groomers_activos' => $groomersActivos,
                'mascotas_atendidas' => $mascotasAtendidas
            ],
            'grafica_citas_semana' => [
                'semana_actual' => $semanaActual,
                'semana_anterior' => $semanaAnterior
            ],
            'ocupacion_groomers' => $ocupacionGroomers,
            'top_servicios' => $topServicios,
            'top_productos' => $topProductos,
            'alertas_stock' => $alertasStock,
            'ultimas_notificaciones' => $ultimasNotificaciones,
            'ultimas_citas' => $ultimasCitas
        ], 'Dashboard obtenido correctamente');
    }
}