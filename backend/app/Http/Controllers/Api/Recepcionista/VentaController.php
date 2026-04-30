<?php
// app/Http/Controllers/Api/Recepcionista/VentaController.php

namespace App\Http\Controllers\Api\Recepcionista;

use App\Http\Controllers\Api\ApiController;
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Factura;
use App\Models\Pago;
use App\Models\Producto;
use App\Models\VarianteProducto;
use App\Models\Categoria;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VentaController extends ApiController
{
    /**
     * Listar ventas del día
     */
    public function index(Request $request)
    {
        $fecha = $request->get('fecha', now()->toDateString());
        
        $query = Venta::with(['cliente.user', 'detalleVentas.variante.producto'])
            ->whereDate('fecha', $fecha);
        
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        
        $ventas = $query->orderBy('fecha', 'desc')
            ->paginate($request->get('per_page', 15));
        
        // Total acumulado del día
        $totalDia = Venta::whereDate('fecha', $fecha)
            ->where('estado', 'pagado')
            ->sum('total');
        
        return $this->successResponse([
            'ventas' => $ventas,
            'total_dia' => $totalDia
        ], 'Ventas obtenidas correctamente');
    }

    /**
     * Ver detalle de una venta
     */
    public function show($id)
    {
        $venta = Venta::with([
            'cliente.user',
            'detalleVentas.variante.producto.categoria',
            'factura'
        ])->find($id);
        
        if (!$venta) {
            return $this->errorResponse('Venta no encontrada', 404);
        }
        
        return $this->successResponse($venta, 'Detalle de venta obtenido correctamente');
    }

    /**
     * Buscar productos para agregar a la venta
     */
    public function buscarProductos(Request $request)
    {
        $request->validate([
            'search' => 'required|string|min:2'
        ]);
        
        $productos = Producto::with(['categoria', 'variantes'])
            ->where('activo', true)
            ->where(function($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->search}%")
                  ->orWhereHas('categoria', function($q2) use ($request) {
                      $q2->where('nombre', 'like', "%{$request->search}%");
                  });
            })
            ->limit(20)
            ->get()
            ->map(function($producto) {
                return [
                    'id' => $producto->idProducto,
                    'nombre' => $producto->nombre,
                    'descripcion' => $producto->descripcion,
                    'categoria' => $producto->categoria->nombre,
                    'precio_base' => $producto->precioBase,
                    'variantes' => $producto->variantes->map(function($variante) {
                        return [
                            'id' => $variante->idVariante,
                            'nombre' => $variante->nombreVariante,
                            'precio' => $variante->precio,
                            'stock' => $variante->stock
                        ];
                    })
                ];
            });
        
        return $this->successResponse($productos, 'Productos encontrados');
    }

    /**
     * Obtener categorías para filtro de productos
     */
    public function categorias()
    {
        $categorias = Categoria::where('tipo', 'producto')
            ->withCount('productos')
            ->get()
            ->map(function($categoria) {
                return [
                    'id' => $categoria->idCategoria,
                    'nombre' => $categoria->nombre,
                    'cantidad_productos' => $categoria->productos_count
                ];
            });
        
        return $this->successResponse($categorias, 'Categorías obtenidas correctamente');
    }

    /**
     * Crear nueva venta
     */
    public function store(Request $request)
    {
        $request->validate([
            'idCliente' => 'nullable|exists:clientes,idCliente',
            'items' => 'required|array|min:1',
            'items.*.idVariante' => 'required|exists:variante_productos,idVariante',
            'items.*.cantidad' => 'required|integer|min:1',
            'medioPago' => 'required|in:efectivo,qr,transferencia'
        ]);

        DB::beginTransaction();
        
        try {
            $total = 0;
            
            // Verificar stock
            foreach ($request->items as $item) {
                $variante = VarianteProducto::find($item['idVariante']);
                if ($variante->stock < $item['cantidad']) {
                    return $this->errorResponse(
                        "Stock insuficiente para {$variante->producto->nombre} - {$variante->nombreVariante}", 
                        400
                    );
                }
            }
            
            // Crear venta
            $venta = Venta::create([
                'idCliente' => $request->idCliente,
                'idRecepcionista' => Auth::user()->recepcionista->idRecepcionista,
                'fecha' => now(),
                'total' => 0,
                'medioPago' => $request->medioPago,
                'estado' => 'pagado'
            ]);
            
            // Crear detalles y calcular total
            foreach ($request->items as $item) {
                $variante = VarianteProducto::find($item['idVariante']);
                $subtotal = $variante->precio * $item['cantidad'];
                $total += $subtotal;
                
                DetalleVenta::create([
                    'idVenta' => $venta->idVenta,
                    'idVariante' => $item['idVariante'],
                    'cantidad' => $item['cantidad'],
                    'precioUnitario' => $variante->precio,
                    'subtotal' => $subtotal
                ]);
                
                // Descontar stock
                $variante->stock -= $item['cantidad'];
                $variante->save();
            }
            
            // Actualizar total
            $venta->update(['total' => $total]);
            
            // Crear factura
            $factura = Factura::create([
                'idVenta' => $venta->idVenta,
                'numeroFactura' => 'FAC-' . str_pad($venta->idVenta, 8, '0', STR_PAD_LEFT),
                'fechaEmision' => now(),
                'montoTotal' => $total,
                'estado' => 'emitida'
            ]);
            
            // Registrar pago
            Pago::create([
                'idFactura' => $factura->idFactura,
                'monto' => $total,
                'metodo' => $request->medioPago,
                'fechaPago' => now(),
                'referencia' => 'REF-' . uniqid()
            ]);
            
            DB::commit();
            
            return $this->successResponse(
                $venta->load(['cliente.user', 'detalleVentas.variante.producto', 'factura']), 
                'Venta realizada exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear venta: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener factura de una venta
     */
    public function factura($id)
    {
        $venta = Venta::with(['cliente.user', 'detalleVentas.variante.producto', 'factura.pagos'])
            ->find($id);
        
        if (!$venta) {
            return $this->errorResponse('Venta no encontrada', 404);
        }
        
        if (!$venta->factura) {
            return $this->errorResponse('La venta no tiene factura asociada', 404);
        }
        
        return $this->successResponse($venta->factura, 'Factura obtenida correctamente');
    }
}