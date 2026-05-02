<?php
// app/Http/Controllers/Api/Admin/Reportes/InventarioReporteController.php

namespace App\Http\Controllers\Api\Admin\Reportes;

use App\Http\Controllers\Api\ApiController;
use App\Models\Producto;
use App\Models\Insumo;
use App\Models\MovimientoInventario;
use App\Models\DetalleInsumo;
use App\Models\Reporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventarioReporteController extends ApiController
{
    /**
     * Generar reporte de inventario
     */
    public function generar(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'categoria_id' => 'nullable|exists:categorias,idCategoria'
        ]);

        $fechaDesde = $request->fecha_desde ? Carbon::parse($request->fecha_desde) : null;
        $fechaHasta = $request->fecha_hasta ? Carbon::parse($request->fecha_hasta) : null;

        // ========== PRODUCTOS CON STOCK CRÍTICO ==========
        $productosQuery = Producto::with(['categoria', 'variantes']);
        
        if ($request->has('categoria_id')) {
            $productosQuery->where('idCategoria', $request->categoria_id);
        }
        
        $productos = $productosQuery->get()->map(function($producto) {
            $stockTotal = $producto->variantes->sum('stock');
            $stockMinimo = $producto->variantes->min('stock_minimo') ?? 5;
            return [
                'id' => $producto->idProducto,
                'nombre' => $producto->nombre,
                'categoria' => $producto->categoria->nombre,
                'stock_actual' => $stockTotal,
                'stock_minimo' => $stockMinimo,
                'critico' => $stockTotal <= $stockMinimo
            ];
        });
        
        $productosCriticos = $productos->filter(function($p) {
            return $p['critico'];
        })->values();

        // ========== INSUMOS MÁS CONSUMIDOS (TOP 10) ==========
        $insumosQuery = DetalleInsumo::select('idInsumo', DB::raw('SUM(cantidadUsada) as total_consumido'))
            ->with('insumo.categoria');
        
        if ($fechaDesde && $fechaHasta) {
            $insumosQuery->whereBetween('created_at', [$fechaDesde, $fechaHasta]);
        }
        
        if ($request->has('categoria_id')) {
            $insumosQuery->whereHas('insumo', function($q) use ($request) {
                $q->where('idCategoria', $request->categoria_id);
            });
        }
        
        $insumosMasConsumidos = $insumosQuery->groupBy('idInsumo')
            ->orderBy('total_consumido', 'desc')
            ->limit(10)
            ->get()
            ->map(function($item) {
                return [
                    'insumo_id' => $item->idInsumo,
                    'nombre' => $item->insumo->nombre,
                    'categoria' => $item->insumo->categoria->nombre,
                    'unidad_medida' => $item->insumo->unidadMedida,
                    'total_consumido' => round($item->total_consumido, 2)
                ];
            });

        // ========== PRODUCTOS MÁS VENDIDOS (TOP 10) ==========
        $productosMasVendidos = DB::table('detalle_ventas')
            ->join('variante_productos', 'detalle_ventas.idVariante', '=', 'variante_productos.idVariante')
            ->join('productos', 'variante_productos.idProducto', '=', 'productos.idProducto')
            ->join('ventas', 'detalle_ventas.idVenta', '=', 'ventas.idVenta')
            ->where('ventas.estado', 'pagado');
        
        if ($fechaDesde && $fechaHasta) {
            $productosMasVendidos->whereBetween('ventas.fecha', [$fechaDesde, $fechaHasta]);
        }
        
        if ($request->has('categoria_id')) {
            $productosMasVendidos->where('productos.idCategoria', $request->categoria_id);
        }
        
        $productosMasVendidos = $productosMasVendidos
            ->select('productos.id as producto_id', 'productos.nombre', DB::raw('SUM(detalle_ventas.cantidad) as unidades_vendidas'), DB::raw('SUM(detalle_ventas.subtotal) as ingresos'))
            ->groupBy('productos.id', 'productos.nombre')
            ->orderBy('unidades_vendidas', 'desc')
            ->limit(10)
            ->get();

        // ========== MOVIMIENTOS DE INVENTARIO DEL PERÍODO ==========
        $movimientos = [];
        if ($fechaDesde && $fechaHasta) {
            $movimientos = MovimientoInventario::with('producto')
                ->whereBetween('fecha', [$fechaDesde, $fechaHasta])
                ->orderBy('fecha', 'desc')
                ->limit(50)
                ->get()
                ->map(function($movimiento) {
                    return [
                        'fecha' => $movimiento->fecha->format('Y-m-d H:i'),
                        'producto' => $movimiento->producto->nombre ?? 'N/A',
                        'tipo' => $movimiento->tipoMovimiento,
                        'cantidad' => $movimiento->cantidad,
                        'motivo' => $movimiento->motivo
                    ];
                });
        }

        // ========== ALERTAS DE STOCK ==========
        $alertasStock = [
            'productos' => $productosCriticos,
            'insumos' => Insumo::whereRaw('stockActual <= stockMinimo')->get()->map(function($insumo) {
                return [
                    'id' => $insumo->idInsumo,
                    'nombre' => $insumo->nombre,
                    'stock_actual' => $insumo->stockActual,
                    'stock_minimo' => $insumo->stockMinimo
                ];
            })
        ];

        // ========== GUARDAR REPORTE ==========
        $resultadoJson = [
            'filtros' => [
                'fecha_desde' => $fechaDesde ? $fechaDesde->format('Y-m-d') : null,
                'fecha_hasta' => $fechaHasta ? $fechaHasta->format('Y-m-d') : null,
                'categoria_id' => $request->categoria_id
            ],
            'productos_criticos' => $productosCriticos->count(),
            'insumos_mas_consumidos' => $insumosMasConsumidos
        ];

        $this->guardarReporte('inventario', $fechaDesde, $fechaHasta, null, $resultadoJson);

        // ========== DATOS PARA EXPORTACIÓN ==========
        $exportData = [
            'productos_criticos' => $productosCriticos,
            'insumos_mas_consumidos' => $insumosMasConsumidos,
            'productos_mas_vendidos' => $productosMasVendidos
        ];

        return $this->successResponse([
            'productos_criticos' => $productosCriticos,
            'insumos_mas_consumidos' => $insumosMasConsumidos,
            'productos_mas_vendidos' => $productosMasVendidos,
            'movimientos_recientes' => $movimientos,
            'alertas_stock' => $alertasStock,
            'export_data' => $exportData
        ], 'Reporte de inventario generado correctamente');
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
            'fechaDesde' => $fechaDesde ?: now(),
            'fechaHasta' => $fechaHasta ?: now(),
            'idGroomerFiltro' => $groomerId,
            'generadoEn' => now(),
            'resultadoJson' => json_encode($resultadoJson)
        ]);
    }
}