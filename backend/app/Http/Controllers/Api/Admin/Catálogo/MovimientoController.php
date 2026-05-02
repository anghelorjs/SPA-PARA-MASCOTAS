<?php
// app/Http/Controllers/Api/Admin/Catalogo/MovimientoController.php

namespace App\Http\Controllers\Api\Admin\Catalogo;

use App\Http\Controllers\Api\ApiController;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\VarianteProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovimientoController extends ApiController
{
    /**
     * Listar movimientos de inventario
     */
    public function index(Request $request)
    {
        $query = MovimientoInventario::with('producto');
        
        // Filtro por producto (buscador por nombre)
        if ($request->has('producto_search')) {
            $search = $request->producto_search;
            $query->whereHas('producto', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%");
            });
        }
        
        // Filtro por tipo de movimiento
        if ($request->has('tipoMovimiento')) {
            $query->where('tipoMovimiento', $request->tipoMovimiento);
        }
        
        // Filtro por rango de fechas
        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }
        
        $movimientos = $query->orderBy('fecha', 'desc')
            ->paginate($request->get('per_page', 20))
            ->through(function($movimiento) {
                // Obtener stock resultante (aproximado)
                $stockResultante = null;
                if ($movimiento->producto) {
                    $variantes = $movimiento->producto->variantes;
                    $stockResultante = $variantes->sum('stock');
                }
                
                return [
                    'id' => $movimiento->idMovimiento,
                    'fecha' => $movimiento->fecha->format('Y-m-d H:i'),
                    'producto_id' => $movimiento->idProducto,
                    'producto_nombre' => $movimiento->producto->nombre ?? 'N/A',
                    'tipoMovimiento' => $movimiento->tipoMovimiento,
                    'cantidad' => $movimiento->cantidad,
                    'motivo' => $movimiento->motivo,
                    'stock_resultante' => $stockResultante
                ];
            });
        
        // Obtener tipos de movimiento para filtros
        $tiposMovimiento = [
            ['id' => 'entrada', 'nombre' => 'Entrada'],
            ['id' => 'salida', 'nombre' => 'Salida'],
            ['id' => 'ajuste', 'nombre' => 'Ajuste']
        ];
        
        return $this->successResponse([
            'movimientos' => $movimientos,
            'tipos_movimiento' => $tiposMovimiento
        ], 'Movimientos obtenidos correctamente');
    }

    /**
     * Ver detalle de un movimiento
     */
    public function show($id)
    {
        $movimiento = MovimientoInventario::with('producto')->find($id);
        
        if (!$movimiento) {
            return $this->errorResponse('Movimiento no encontrado', 404);
        }
        
        return $this->successResponse($movimiento, 'Movimiento obtenido correctamente');
    }

    /**
     * Registrar movimiento manual
     */
    public function store(Request $request)
    {
        $request->validate([
            'idProducto' => 'required|exists:productos,idProducto',
            'tipoMovimiento' => 'required|in:entrada,salida,ajuste',
            'cantidad' => 'required|integer|min:1',
            'variante_id' => 'required|exists:variante_productos,idVariante',
            'motivo' => 'required|string|max:255'
        ]);

        DB::beginTransaction();
        
        try {
            $movimiento = MovimientoInventario::create([
                'idProducto' => $request->idProducto,
                'tipoMovimiento' => $request->tipoMovimiento,
                'cantidad' => $request->cantidad,
                'fecha' => now(),
                'motivo' => $request->motivo
            ]);
            
            // Actualizar stock de la variante
            $variante = VarianteProducto::find($request->variante_id);
            
            if ($request->tipoMovimiento === 'entrada') {
                $variante->stock += $request->cantidad;
            } elseif ($request->tipoMovimiento === 'salida') {
                if ($variante->stock < $request->cantidad) {
                    throw new \Exception('Stock insuficiente para realizar la salida');
                }
                $variante->stock -= $request->cantidad;
            } else { // ajuste
                $variante->stock = $request->cantidad;
            }
            
            $variante->save();
            
            DB::commit();
            
            return $this->successResponse($movimiento, 'Movimiento registrado correctamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al registrar movimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar movimiento (solo si es necesario)
     */
    public function destroy($id)
    {
        $movimiento = MovimientoInventario::find($id);
        
        if (!$movimiento) {
            return $this->errorResponse('Movimiento no encontrado', 404);
        }
        
        // Normalmente no se deben eliminar movimientos, solo si son incorrectos
        // y se debe revertir el stock
        
        return $this->errorResponse('No se pueden eliminar movimientos registrados', 400);
    }

    /**
     * Obtener productos para selector de movimientos
     */
    public function productosList(Request $request)
    {
        $search = $request->get('search', '');
        
        $query = Producto::with('variantes')->where('activo', true);
        
        if ($search) {
            $query->where('nombre', 'like', "%{$search}%");
        }
        
        $productos = $query->limit(20)->get()->map(function($producto) {
            return [
                'id' => $producto->idProducto,
                'nombre' => $producto->nombre,
                'variantes' => $producto->variantes->map(function($variante) {
                    return [
                        'id' => $variante->idVariante,
                        'nombre' => $variante->nombreVariante,
                        'stock_actual' => $variante->stock
                    ];
                })
            ];
        });
        
        return $this->successResponse($productos, 'Productos obtenidos correctamente');
    }
}