<?php
// app/Http/Controllers/Api/VentaController.php

namespace App\Http\Controllers\Api;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Factura;
use App\Models\Pago;
use App\Models\VarianteProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VentaController extends ApiController
{
    /**
     * Listar ventas
     */
    public function index(Request $request)
    {
        $query = Venta::with(['cliente.user', 'recepcionista.user', 'detalleVentas.variante.producto']);
        
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->has('cliente_id')) {
            $query->where('idCliente', $request->cliente_id);
        }
        
        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }
        
        $ventas = $query->orderBy('fecha', 'desc')
                        ->paginate($request->get('per_page', 15));
        
        return $this->paginatedResponse($ventas, 'Ventas obtenidas correctamente');
    }

    /**
     * Mostrar una venta específica
     */
    public function show($id)
    {
        $venta = Venta::with([
            'cliente.user', 
            'recepcionista.user', 
            'detalleVentas.variante.producto',
            'factura.pagos'
        ])->find($id);
        
        if (!$venta) {
            return $this->errorResponse('Venta no encontrada', 404);
        }
        
        return $this->successResponse($venta, 'Venta obtenida correctamente');
    }

    /**
     * Crear una nueva venta
     */
    public function store(Request $request)
    {
        $request->validate([
            'idCliente' => 'nullable|exists:clientes,idCliente',
            'items' => 'required|array|min:1',
            'items.*.idVariante' => 'required|exists:variante_productos,idVariante',
            'items.*.cantidad' => 'required|integer|min:1',
            'medioPago' => 'required|in:efectivo,qr,transferencia',
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
                'idRecepcionista' => optional(optional(Auth::user())->recepcionista)->idRecepcionista,
                'fecha' => now(),
                'total' => 0,
                'medioPago' => $request->medioPago,
                'estado' => 'pagado',
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
                    'subtotal' => $subtotal,
                ]);
                
                // Descontar stock
                $variante->descontarStock($item['cantidad']);
            }
            
            // Actualizar total
            $venta->update(['total' => $total]);
            
            // Crear factura
            $factura = Factura::create([
                'idVenta' => $venta->idVenta,
                'numeroFactura' => 'FAC-' . str_pad($venta->idVenta, 8, '0', STR_PAD_LEFT),
                'fechaEmision' => now(),
                'montoTotal' => $total,
                'estado' => 'emitida',
            ]);
            
            // Registrar pago
            Pago::create([
                'idFactura' => $factura->idFactura,
                'monto' => $total,
                'metodo' => $request->medioPago,
                'fechaPago' => now(),
                'referencia' => 'REF-' . uniqid(),
            ]);
            
            DB::commit();
            
            return $this->successResponse(
                $venta->load(['cliente.user', 'detalleVentas.variante.producto', 'factura']), 
                'Venta creada exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear la venta: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancelar una venta
     */
    public function cancel($id)
    {
        $venta = Venta::find($id);
        
        if (!$venta) {
            return $this->errorResponse('Venta no encontrada', 404);
        }
        
        if ($venta->estado === 'cancelado') {
            return $this->errorResponse('La venta ya está cancelada', 400);
        }
        
        DB::beginTransaction();
        
        try {
            // Revertir stock
            foreach ($venta->detalleVentas as $detalle) {
                $variante = $detalle->variante;
                $variante->aumentarStock($detalle->cantidad, 'Cancelación de venta');
            }
            
            // Cancelar factura
            if ($venta->factura) {
                $venta->factura->estado = 'cancelada';
                $venta->factura->save();
            }
            
            $venta->estado = 'cancelado';
            $venta->save();
            
            DB::commit();
            
            return $this->successResponse(null, 'Venta cancelada correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al cancelar la venta: ' . $e->getMessage(), 500);
        }
    }
}