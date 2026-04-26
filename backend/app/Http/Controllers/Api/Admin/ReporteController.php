<?php
// app/Http/Controllers/Api/Admin/ReporteController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Venta;
use App\Models\Producto;
use App\Models\Insumo;
use App\Models\Cliente;
use App\Models\Mascota;
use App\Models\Reporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteController extends ApiController
{
    // ==================== REPORTES DE AGENDA ====================
    
    /**
     * Reporte de citas
     */
    public function citas(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'groomer_id' => 'nullable|exists:groomers,idGroomer'
        ]);
        
        $query = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio'])
            ->whereBetween('fechaHoraInicio', [$request->fecha_desde, $request->fecha_hasta]);
        
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        $citas = $query->orderBy('fechaHoraInicio')->get();
        
        // Estadísticas
        $totalCitas = $citas->count();
        $citasCompletadas = $citas->where('estado', 'completada')->count();
        $citasCanceladas = $citas->where('estado', 'cancelada')->count();
        $tasaOcupacion = $totalCitas > 0 ? round(($citasCompletadas / $totalCitas) * 100, 2) : 0;
        
        // Agrupar por groomer
        $citasPorGroomer = $citas->groupBy(function($cita) {
            return $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido;
        })->map(function($items, $groomer) {
            return [
                'groomer' => $groomer,
                'total_citas' => $items->count(),
                'completadas' => $items->where('estado', 'completada')->count(),
                'canceladas' => $items->where('estado', 'cancelada')->count()
            ];
        })->values();
        
        // Agrupar por servicio
        $citasPorServicio = $citas->groupBy('servicio.nombre')->map(function($items, $servicio) {
            return [
                'servicio' => $servicio,
                'total_citas' => $items->count()
            ];
        })->values();
        
        // Datos para gráfica de barras (por día)
        $citasPorDia = $citas->groupBy(function($cita) {
            return $cita->fechaHoraInicio->format('Y-m-d');
        })->map(function($items, $fecha) {
            return [
                'fecha' => $fecha,
                'total' => $items->count(),
                'completadas' => $items->where('estado', 'completada')->count(),
                'canceladas' => $items->where('estado', 'cancelada')->count()
            ];
        })->values();
        
        // Guardar reporte - Pasar el usuario autenticado
        $this->guardarReporte('agenda', $request->fecha_desde, $request->fecha_hasta, $request->user(), $request->groomer_id);
        
        return $this->successResponse([
            'citas' => $citas,
            'estadisticas' => [
                'total_citas' => $totalCitas,
                'citas_completadas' => $citasCompletadas,
                'citas_canceladas' => $citasCanceladas,
                'tasa_ocupacion' => $tasaOcupacion
            ],
            'citas_por_groomer' => $citasPorGroomer,
            'citas_por_servicio' => $citasPorServicio,
            'citas_por_dia' => $citasPorDia
        ], 'Reporte de citas generado correctamente');
    }
    
    // ==================== REPORTES DE INGRESOS ====================
    
    /**
     * Reporte de ingresos
     */
    public function ingresos(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde'
        ]);
        
        $ventas = Venta::with(['detalleVentas.variante.producto'])
            ->whereBetween('fecha', [$request->fecha_desde, $request->fecha_hasta])
            ->where('estado', 'pagado')
            ->get();
        
        $citas = Cita::with(['servicio', 'mascota'])
            ->whereBetween('fechaHoraInicio', [$request->fecha_desde, $request->fecha_hasta])
            ->where('estado', 'completada')
            ->get();
        
        // Totales
        $totalIngresos = $ventas->sum('total');
        $ingresosServicios = $citas->sum(function($cita) {
            return $cita->servicio->getPrecioForRango($cita->mascota->idRango);
        });
        $ingresosProductos = $totalIngresos;
        
        // Ticket promedio
        $ticketPromedio = $ventas->count() > 0 ? $totalIngresos / $ventas->count() : 0;
        
        // Ingresos por día (para gráfica de línea)
        $ingresosPorDia = $ventas->groupBy(function($venta) {
            return $venta->fecha->format('Y-m-d');
        })->map(function($items, $fecha) {
            return [
                'fecha' => $fecha,
                'total' => $items->sum('total')
            ];
        })->values();
        
        // Ingresos por medio de pago
        $ingresosPorMedioPago = $ventas->groupBy('medioPago')->map(function($items, $medio) {
            return [
                'medio' => $medio,
                'total' => $items->sum('total')
            ];
        })->values();
        
        // Ticket estimado vs real (servicios)
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
        
        // Guardar reporte - Pasar el usuario autenticado
        $this->guardarReporte('ingresos', $request->fecha_desde, $request->fecha_hasta, $request->user());
        
        return $this->successResponse([
            'resumen' => [
                'total_ingresos' => $totalIngresos,
                'ingresos_servicios' => $ingresosServicios,
                'ingresos_productos' => $ingresosProductos,
                'ticket_promedio' => round($ticketPromedio, 2)
            ],
            'ingresos_por_dia' => $ingresosPorDia,
            'ingresos_por_medio_pago' => $ingresosPorMedioPago,
            'ticket_estimado_real' => $ticketEstimadoReal
        ], 'Reporte de ingresos generado correctamente');
    }
    
    // ==================== REPORTES DE INVENTARIO ====================
    
    /**
     * Reporte de inventario
     */
    public function inventario(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde'
        ]);
        
        // Productos y su stock
        $productos = Producto::with('variantes')->get()->map(function($producto) {
            $stockTotal = $producto->variantes->sum('stock');
            $stockMinimo = 5;
            return [
                'idProducto' => $producto->idProducto,
                'nombre' => $producto->nombre,
                'stock_actual' => $stockTotal,
                'stock_minimo' => $stockMinimo,
                'alerta' => $stockTotal <= $stockMinimo,
                'variantes' => $producto->variantes->map(function($variante) {
                    return [
                        'nombre' => $variante->nombreVariante,
                        'stock' => $variante->stock
                    ];
                })
            ];
        });
        
        // Insumos y su stock
        $insumos = Insumo::all()->map(function($insumo) {
            return [
                'idInsumo' => $insumo->idInsumo,
                'nombre' => $insumo->nombre,
                'stock_actual' => $insumo->stockActual,
                'stock_minimo' => $insumo->stockMinimo,
                'alerta' => $insumo->stockActual <= $insumo->stockMinimo,
                'unidad_medida' => $insumo->unidadMedida
            ];
        });
        
        // Insumos más consumidos
        $insumosMasConsumidos = DB::table('detalle_insumos')
            ->join('insumos', 'detalle_insumos.idInsumo', '=', 'insumos.idInsumo')
            ->select('insumos.nombre', DB::raw('SUM(detalle_insumos.cantidadUsada) as total_consumido'))
            ->groupBy('insumos.idInsumo', 'insumos.nombre')
            ->orderBy('total_consumido', 'desc')
            ->limit(10)
            ->get();
        
        // Movimientos del período
        $movimientos = [];
        if ($request->has('fecha_desde') && $request->has('fecha_hasta')) {
            $movimientos = DB::table('movimientos_inventario')
                ->join('productos', 'movimientos_inventario.idProducto', '=', 'productos.idProducto')
                ->whereBetween('fecha', [$request->fecha_desde, $request->fecha_hasta])
                ->select('movimientos_inventario.*', 'productos.nombre as producto_nombre')
                ->orderBy('fecha', 'desc')
                ->get();
        }
        
        // Guardar reporte - Pasar el usuario autenticado
        $this->guardarReporte('inventario', $request->fecha_desde, $request->fecha_hasta, $request->user());
        
        return $this->successResponse([
            'productos' => $productos,
            'insumos' => $insumos,
            'insumos_mas_consumidos' => $insumosMasConsumidos,
            'movimientos' => $movimientos,
            'alertas' => [
                'productos_bajo_stock' => $productos->filter(function($p) { return $p['alerta']; })->values(),
                'insumos_bajo_stock' => $insumos->filter(function($i) { return $i['alerta']; })->values()
            ]
        ], 'Reporte de inventario generado correctamente');
    }
    
    // ==================== REPORTES DE CLIENTES ====================
    
    /**
     * Reporte de clientes
     */
    public function clientes(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde'
        ]);
        
        // Top clientes por número de citas
        $topClientes = Cliente::with('user')
            ->withCount(['mascotas as citas_count' => function($query) use ($request) {
                $query->join('citas', 'mascotas.idMascota', '=', 'citas.idMascota');
                if ($request->has('fecha_desde')) {
                    $query->whereDate('citas.fechaHoraInicio', '>=', $request->fecha_desde);
                }
                if ($request->has('fecha_hasta')) {
                    $query->whereDate('citas.fechaHoraInicio', '<=', $request->fecha_hasta);
                }
            }])
            ->orderBy('citas_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function($cliente) {
                return [
                    'idCliente' => $cliente->idCliente,
                    'nombre' => $cliente->user->nombre . ' ' . $cliente->user->apellido,
                    'telefono' => $cliente->user->telefono,
                    'total_citas' => $cliente->citas_count
                ];
            });
        
        // Clientes sin cita en los últimos 60 días
        $fechaLimite = now()->subDays(60);
        $clientesInactivos = Cliente::with('user')
            ->whereDoesntHave('mascotas.citas', function($query) use ($fechaLimite) {
                $query->whereDate('fechaHoraInicio', '>=', $fechaLimite);
            })
            ->get()
            ->map(function($cliente) {
                $ultimaCita = $cliente->mascotas->flatMap->citas->sortByDesc('fechaHoraInicio')->first();
                return [
                    'idCliente' => $cliente->idCliente,
                    'nombre' => $cliente->user->nombre . ' ' . $cliente->user->apellido,
                    'telefono' => $cliente->user->telefono,
                    'ultima_cita' => $ultimaCita ? $ultimaCita->fechaHoraInicio->format('Y-m-d') : 'Nunca'
                ];
            });
        
        // Top mascotas más atendidas
        $topMascotas = Mascota::with('cliente.user')
            ->withCount('citas')
            ->orderBy('citas_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function($mascota) {
                return [
                    'idMascota' => $mascota->idMascota,
                    'nombre' => $mascota->nombre,
                    'dueno' => $mascota->cliente->user->nombre . ' ' . $mascota->cliente->user->apellido,
                    'raza' => $mascota->raza,
                    'total_citas' => $mascota->citas_count
                ];
            });
        
        // Guardar reporte - Pasar el usuario autenticado
        $this->guardarReporte('clientes', $request->fecha_desde, $request->fecha_hasta, $request->user());
        
        return $this->successResponse([
            'top_clientes' => $topClientes,
            'clientes_inactivos' => $clientesInactivos,
            'top_mascotas' => $topMascotas
        ], 'Reporte de clientes generado correctamente');
    }
    
    // ==================== FUNCIÓN AUXILIAR ====================
    
    /**
     * Guardar reporte generado
     */
    private function guardarReporte($tipo, $fechaDesde, $fechaHasta, $user, $groomerId = null)
    {
        try {
            // Validar que el usuario existe y es administrador
            if (!$user) {
                return;
            }
            
            if (!$user->administrador) {
                return;
            }
            
            Reporte::create([
                'idAdministrador' => $user->administrador->idAdministrador,
                'tipoReporte' => $tipo,
                'fechaDesde' => $fechaDesde,
                'fechaHasta' => $fechaHasta,
                'idGroomerFiltro' => $groomerId,
                'generadoEn' => now(),
                'resultadoJson' => null
            ]);
            
        } catch (\Exception $e) {
            // No detener la ejecución si falla el guardado del reporte
            
        }
    }
}