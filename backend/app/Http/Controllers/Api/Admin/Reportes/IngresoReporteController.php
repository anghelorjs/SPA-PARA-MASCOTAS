<?php

namespace App\Http\Controllers\Api\Admin\Reportes;

use App\Http\Controllers\Api\ApiController;
use App\Models\Venta;
use App\Models\Cita;
use App\Models\Reporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IngresoReporteController extends ApiController
{
    /**
     * Generar reporte de ingresos
     */
    public function generar(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'groomer_id' => 'nullable|exists:groomers,idGroomer'
        ]);

        $fechaDesde = Carbon::parse($request->fecha_desde);
        $fechaHasta = Carbon::parse($request->fecha_hasta);

        // ========== VENTAS PAGADAS ==========
        $ventas = Venta::with(['detalleVentas.variante.producto'])
            ->whereBetween('fecha', [$fechaDesde, $fechaHasta])
            ->where('estado', 'pagado')
            ->get();

        // ========== SERVICIOS COBRADOS ==========
        $citasQuery = Cita::with(['servicio', 'mascota'])
            ->whereBetween('fechaHoraInicio', [$fechaDesde, $fechaHasta])
            ->where('estado', 'completada')
            ->where('pagado', true);
        
        if ($request->has('groomer_id')) {
            $citasQuery->where('idGroomer', $request->groomer_id);
        }
        
        $citas = $citasQuery->get();

        // ========== TOTALES ==========
        $ingresosProductos = $ventas->sum(function($venta) {
            return $venta->detalleVentas
                ->where('tipo', 'producto')
                ->sum('subtotal');
        });
        $ingresosServicios = $ventas->sum(function($venta) {
            return $venta->detalleVentas
                ->where('tipo', 'servicio')
                ->sum('subtotal');
        });
        $totalIngresos = $ingresosProductos + $ingresosServicios;

        // ========== TICKET PROMEDIO POR DÍA ==========
        $ventasPorDia = Venta::whereBetween('fecha', [$fechaDesde, $fechaHasta])
            ->where('estado', 'pagado')
            ->select(DB::raw('DATE(fecha) as fecha'), DB::raw('COUNT(*) as cantidad'), DB::raw('SUM(total) as total'))
            ->groupBy(DB::raw('DATE(fecha)'))
            ->get();
        
        $ticketPromedioPorDia = $ventasPorDia->map(function($item) {
            return [
                'fecha' => $item->fecha,
                'promedio' => $item->cantidad > 0 ? round($item->total / $item->cantidad, 2) : 0
            ];
        });

        // ========== GRÁFICA DE LÍNEA: Ingresos diarios ==========
        $diasEnRango = [];
        $fechaActual = $fechaDesde->copy();
        while ($fechaActual <= $fechaHasta) {
            $diasEnRango[] = $fechaActual->format('Y-m-d');
            $fechaActual->addDay();
        }

        $ingresosDiarios = collect($diasEnRango)->map(function($fecha) use ($fechaDesde, $fechaHasta, $ventas, $citas) {
            $ventasDia = $ventas->filter(function($venta) use ($fecha) {
                return $venta->fecha->format('Y-m-d') === $fecha;
            });

            $ingresosProductosDia = $ventasDia->sum(function($venta) {
                return $venta->detalleVentas
                    ->where('tipo', 'producto')
                    ->sum('subtotal');
            });

            $ingresosServiciosDia = $ventasDia->sum(function($venta) {
                return $venta->detalleVentas
                    ->where('tipo', 'servicio')
                    ->sum('subtotal');
            });
            
            return [
                'fecha' => $fecha,
                'productos' => $ingresosProductosDia,
                'servicios' => $ingresosServiciosDia,
                'total' => $ingresosProductosDia + $ingresosServiciosDia
            ];
        });

        // ========== INGRESOS POR TIPO (SERVICIO VS PRODUCTO) ==========
        $ingresosPorTipo = [
            ['tipo' => 'Servicios', 'total' => $ingresosServicios],
            ['tipo' => 'Productos', 'total' => $ingresosProductos]
        ];

        // ========== DESGLOSE POR MEDIO DE PAGO ==========
        $ingresosPorMedioPago = $ventas->groupBy('medioPago')->map(function($items, $medio) use ($totalIngresos) {
            $totalMedio = $items->sum('total');
            return [
                'medio' => $medio,
                'total' => $totalMedio,
                'porcentaje' => $totalIngresos > 0 ? round(($totalMedio / $totalIngresos) * 100, 2) : 0
            ];
        })->values();

        // ========== TICKET ESTIMADO VS REAL (SERVICIOS) ==========
        $ticketEstimadoReal = $citas->map(function($cita) {
            $precioBase = $cita->servicio->precioBase;
            $precioAjustado = $cita->servicio->getPrecioForRango($cita->mascota->idRango);
            return [
                'cita_id' => $cita->idCita,
                'servicio' => $cita->servicio->nombre,
                'precio_base' => $precioBase,
                'precio_ajustado' => $precioAjustado,
                'diferencia' => $precioAjustado - $precioBase
            ];
        });

        // ========== GUARDAR REPORTE ==========
        $resultadoJson = [
            'filtros' => [
                'fecha_desde' => $fechaDesde->format('Y-m-d'),
                'fecha_hasta' => $fechaHasta->format('Y-m-d'),
                'groomer_id' => $request->groomer_id
            ],
            'totales' => [
                'ingresos_productos' => $ingresosProductos,
                'ingresos_servicios' => $ingresosServicios,
                'total_ingresos' => $totalIngresos
            ]
        ];

        $this->guardarReporte('ingresos', $fechaDesde, $fechaHasta, $request->groomer_id, $resultadoJson);

        // ========== DATOS PARA EXPORTACIÓN ==========
        $exportData = $ventas->map(function($venta) {
            return [
                'ID' => $venta->idVenta,
                'Fecha' => $venta->fecha->format('Y-m-d H:i'),
                'Cliente' => $venta->cliente ? $venta->cliente->user->nombre . ' ' . $venta->cliente->user->apellido : 'Anónimo',
                'Total' => $venta->total,
                'MedioPago' => $venta->medioPago
            ];
        });

        return $this->successResponse([
            'resumen' => [
                'ingresos_productos' => $ingresosProductos,
                'ingresos_servicios' => $ingresosServicios,
                'total_ingresos' => $totalIngresos,
                'ticket_promedio_general' => $ventas->count() > 0 ? round($totalIngresos / $ventas->count(), 2) : 0
            ],
            'ticket_promedio_por_dia' => $ticketPromedioPorDia,
            'grafica_ingresos_diarios' => $ingresosDiarios,
            'ingresos_por_tipo' => $ingresosPorTipo,
            'ingresos_por_medio_pago' => $ingresosPorMedioPago,
            'ticket_estimado_real' => $ticketEstimadoReal,
            'detalle_ventas' => $ventas,
            'export_data' => $exportData
        ], 'Reporte de ingresos generado correctamente');
    }

    private function guardarReporte($tipo, $fechaDesde, $fechaHasta, $groomerId, $resultadoJson)
    {
        $user = auth('api')->user();
        
        if (!$user || !$user->administrador) {
            return;
        }
        
        Reporte::create([
            'idAdministrador' => $user->administrador->idAdministrador,
            'tipoReporte' => $tipo,
            'fechaDesde' => $fechaDesde,
            'fechaHasta' => $fechaHasta,
            'idGroomerFiltro' => $groomerId,
            'generadoEn' => now(),
            'resultadoJson' => json_encode($resultadoJson)
        ]);
    }
}
