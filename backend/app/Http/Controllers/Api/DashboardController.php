<?php
// app/Http/Controllers/Api/DashboardController.php

namespace App\Http\Controllers\Api;

use App\Models\Cita;
use App\Models\Venta;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends ApiController
{
    /**
     * Obtener estadísticas del dashboard
     */
    public function index(Request $request)
    {
        $fechaInicio = $request->get('fecha_inicio', now()->startOfMonth());
        $fechaFin = $request->get('fecha_fin', now());
        
        // Citas del período
        $totalCitas = Cita::whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])->count();
        $citasCompletadas = Cita::whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
            ->where('estado', 'completada')
            ->count();
        $citasCanceladas = Cita::whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
            ->where('estado', 'cancelada')
            ->count();
        
        // Ventas del período
        $totalVentas = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->where('estado', 'pagado')
            ->sum('total');
        
        $ventasCount = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->where('estado', 'pagado')
            ->count();
        
        $ticketPromedio = $ventasCount > 0 ? $totalVentas / $ventasCount : 0;
        
        // Clientes nuevos
        $nuevosClientes = Cliente::whereBetween('created_at', [$fechaInicio, $fechaFin])->count();
        
        // Top servicios
        $topServicios = Cita::select('servicios.nombre', DB::raw('count(*) as total'))
            ->join('servicios', 'citas.idServicio', '=', 'servicios.idServicio')
            ->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
            ->groupBy('servicios.idServicio', 'servicios.nombre')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();
        
        // Top productos
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
        
        // Ocupación por groomer
        $ocupacionGroomers = Cita::select('groomers.idGroomer', 'users.nombre', 'users.apellido', DB::raw('count(*) as total_citas'))
            ->join('groomers', 'citas.idGroomer', '=', 'groomers.idGroomer')
            ->join('users', 'groomers.idUsuario', '=', 'users.idUsuario')
            ->whereBetween('fechaHoraInicio', [$fechaInicio, $fechaFin])
            ->groupBy('groomers.idGroomer', 'users.nombre', 'users.apellido')
            ->orderBy('total_citas', 'desc')
            ->get();
        
        // Citas por día (últimos 7 días)
        $citasPorDia = Cita::select(DB::raw('DATE(fechaHoraInicio) as fecha'), DB::raw('count(*) as total'))
            ->whereBetween('fechaHoraInicio', [now()->subDays(7), now()])
            ->groupBy(DB::raw('DATE(fechaHoraInicio)'))
            ->orderBy('fecha', 'asc')
            ->get();
        
        return $this->successResponse([
            'resumen' => [
                'total_citas' => $totalCitas,
                'citas_completadas' => $citasCompletadas,
                'citas_canceladas' => $citasCanceladas,
                'total_ventas' => $totalVentas,
                'ticket_promedio' => round($ticketPromedio, 2),
                'nuevos_clientes' => $nuevosClientes,
            ],
            'top_servicios' => $topServicios,
            'top_productos' => $topProductos,
            'ocupacion_groomers' => $ocupacionGroomers,
            'citas_por_dia' => $citasPorDia,
        ], 'Dashboard obtenido correctamente');
    }

    /**
     * Reporte de citas
     */
    public function reporteCitas(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'groomer_id' => 'nullable|exists:groomers,idGroomer',
        ]);
        
        $query = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio'])
            ->whereBetween('fechaHoraInicio', [$request->fecha_desde, $request->fecha_hasta]);
        
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        $citas = $query->orderBy('fechaHoraInicio')->get();
        
        return $this->successResponse($citas, 'Reporte de citas generado correctamente');
    }
}