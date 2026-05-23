<?php

namespace App\Http\Controllers\Api\Recepcionista;

use App\Http\Controllers\Api\ApiController;
use App\Models\Categoria;
use App\Models\DetalleVenta;
use App\Models\Factura;
use App\Models\Pago;
use App\Models\Producto;
use App\Models\VarianteProducto;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VentaController extends ApiController
{
    public function index(Request $request)
    {
        $fecha = $request->get('fecha', now()->toDateString());
        $tipo = $request->get('tipo', 'todas');

        $query = Venta::with(['cliente.user', 'detalleVentas.variante.producto', 'factura.pagos'])
            ->whereDate('fecha', $fecha);

        if ($request->filled('estado') && $request->estado !== 'todas') {
            $query->where('estado', $request->estado);
        }

        if ($tipo !== 'todas') {
            if ($tipo === 'mixta') {
                $query->whereHas('detalleVentas', fn($q) => $q->where('tipo', 'producto'))
                    ->whereHas('detalleVentas', fn($q) => $q->where('tipo', 'servicio'));
            } else {
                $query->whereHas('detalleVentas', fn($q) => $q->where('tipo', $tipo));
            }
        }

        $ventas = $query->orderBy('fecha', 'desc')
            ->paginate($request->get('per_page', 15));

        $ventas->getCollection()->transform(fn($venta) => $this->formatearVenta($venta));

        $totalDia = Venta::whereDate('fecha', $fecha)
            ->where('estado', 'pagado')
            ->sum('total');

        return $this->successResponse([
            'ventas' => $ventas,
            'total_dia' => (float) $totalDia,
            'resumen' => [
                'general' => (float) $totalDia,
                'productos' => $this->sumarPorTipo($fecha, 'producto'),
                'servicios' => $this->sumarPorTipo($fecha, 'servicio'),
            ],
        ], 'Ventas obtenidas correctamente');
    }

    public function show($id)
    {
        $venta = Venta::with([
            'cliente.user',
            'detalleVentas.variante.producto.categoria',
            'factura.pagos',
        ])->find($id);

        if (!$venta) {
            return $this->errorResponse('Venta no encontrada', 404);
        }

        return $this->successResponse($this->formatearVenta($venta), 'Detalle de venta obtenido correctamente');
    }

    public function buscarProductos(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|min:2',
            'categoria_id' => 'nullable|integer|exists:categorias,idCategoria',
        ]);

        $productosQuery = Producto::with(['categoria', 'variantes'])
            ->where('activo', true);

        if ($request->filled('categoria_id')) {
            $productosQuery->where('idCategoria', $request->categoria_id);
        }

        if ($request->filled('search')) {
            $productosQuery->where(function ($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->search}%")
                    ->orWhereHas('categoria', function ($q2) use ($request) {
                        $q2->where('nombre', 'like', "%{$request->search}%");
                    });
            });
        }

        $productos = $productosQuery
            ->orderBy('nombre')
            ->limit(100)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->idProducto,
                    'nombre' => $producto->nombre,
                    'descripcion' => $producto->descripcion,
                    'categoria' => $producto->categoria->nombre,
                    'precio_base' => (float) $producto->precioBase,
                    'variantes' => $producto->variantes->map(function ($variante) {
                        return [
                            'id' => $variante->idVariante,
                            'nombre' => $variante->nombreVariante,
                            'precio' => (float) $variante->precio,
                            'stock' => (int) $variante->stock,
                        ];
                    }),
                ];
            });

        return $this->successResponse($productos, 'Productos encontrados');
    }

    public function categorias()
    {
        $categorias = Categoria::where('tipo', 'producto')
            ->withCount('productos')
            ->get()
            ->map(function ($categoria) {
                return [
                    'id' => $categoria->idCategoria,
                    'nombre' => $categoria->nombre,
                    'cantidad_productos' => $categoria->productos_count,
                ];
            });

        return $this->successResponse($categorias, 'Categorias obtenidas correctamente');
    }

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

            foreach ($request->items as $item) {
                $variante = VarianteProducto::with('producto')->find($item['idVariante']);
                if ($variante->stock < $item['cantidad']) {
                    DB::rollBack();
                    return $this->errorResponse(
                        "Stock insuficiente para {$variante->producto->nombre} - {$variante->nombreVariante}",
                        400
                    );
                }
            }

            $recepcionista = Auth::user()->recepcionista;
            if (!$recepcionista) {
                DB::rollBack();
                return $this->errorResponse('Usuario no es recepcionista', 403);
            }

            $ahora = now();

            $venta = Venta::create([
                'idCliente' => $request->idCliente,
                'idRecepcionista' => $recepcionista->idRecepcionista,
                'fecha' => $ahora,
                'total' => 0,
                'medioPago' => $request->medioPago,
                'estado' => 'pagado',
            ]);

            foreach ($request->items as $item) {
                $variante = VarianteProducto::with('producto')->find($item['idVariante']);
                $subtotal = (float) $variante->precio * (int) $item['cantidad'];
                $total += $subtotal;

                DetalleVenta::create([
                    'idVenta' => $venta->idVenta,
                    'idVariante' => $item['idVariante'],
                    'tipo' => 'producto',
                    'descripcion' => $variante->producto->nombre . ' - ' . $variante->nombreVariante,
                    'cantidad' => $item['cantidad'],
                    'precioUnitario' => $variante->precio,
                    'subtotal' => $subtotal,
                ]);

                $variante->stock -= $item['cantidad'];
                $variante->save();
            }

            $venta->update(['total' => $total]);

            $factura = Factura::create([
                'idVenta' => $venta->idVenta,
                'numeroFactura' => 'FAC-' . str_pad($venta->idVenta, 8, '0', STR_PAD_LEFT),
                'fechaEmision' => $ahora,
                'montoTotal' => $total,
                'estado' => 'emitida',
            ]);

            Pago::create([
                'idFactura' => $factura->idFactura,
                'monto' => $total,
                'metodo' => $request->medioPago,
                'fechaPago' => $ahora,
                'referencia' => 'REF-' . uniqid(),
            ]);

            DB::commit();

            return $this->successResponse(
                $this->formatearVenta($venta->load(['cliente.user', 'detalleVentas.variante.producto', 'factura.pagos'])),
                'Venta realizada exitosamente',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear venta: ' . $e->getMessage(), 500);
        }
    }

    public function factura($id)
    {
        $venta = Venta::with(['factura.pagos'])->find($id);

        if (!$venta) {
            return $this->errorResponse('Venta no encontrada', 404);
        }

        if (!$venta->factura) {
            return $this->errorResponse('La venta no tiene factura asociada', 404);
        }

        return $this->successResponse($this->formatearVenta($venta)['factura'], 'Factura obtenida correctamente');
    }

    private function sumarPorTipo(string $fecha, string $tipo): float
    {
        return (float) Venta::whereDate('fecha', $fecha)
            ->where('estado', 'pagado')
            ->whereHas('detalleVentas', fn($q) => $q->where('tipo', $tipo))
            ->sum('total');
    }

    private function formatearVenta(Venta $venta): array
    {
        $detalles = $venta->detalleVentas->map(function ($detalle) {
            return [
                'idDetalleVenta' => $detalle->idDetalleVenta,
                'idVariante' => $detalle->idVariante,
                'tipo' => $detalle->tipo,
                'descripcion' => $detalle->descripcion,
                'cantidad' => (int) $detalle->cantidad,
                'precioUnitario' => (float) $detalle->precioUnitario,
                'subtotal' => (float) $detalle->subtotal,
                'variante' => $detalle->variante,
            ];
        })->values();

        $tipos = $detalles->pluck('tipo')->unique()->values();
        $tipoVenta = $tipos->count() > 1 ? 'mixta' : ($tipos->first() ?? 'sin_items');

        return [
            'idVenta' => $venta->idVenta,
            'idCliente' => $venta->idCliente,
            'idRecepcionista' => $venta->idRecepcionista,
            'fecha' => $venta->fecha?->format('Y-m-d H:i:s'),
            'total' => (float) $venta->total,
            'medioPago' => $venta->medioPago,
            'estado' => $venta->estado,
            'tipo_venta' => $tipoVenta,
            'created_at' => $venta->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $venta->updated_at?->format('Y-m-d H:i:s'),
            'cliente' => $venta->cliente,
            'detalleVentas' => $detalles,
            'factura' => $venta->factura ? [
                'idFactura' => $venta->factura->idFactura,
                'numeroFactura' => $venta->factura->numeroFactura,
                'fechaEmision' => $venta->factura->fechaEmision?->format('Y-m-d H:i:s'),
                'montoTotal' => (float) $venta->factura->montoTotal,
                'estado' => $venta->factura->estado,
                'pagos' => $venta->factura->pagos?->map(fn($pago) => [
                    'idPago' => $pago->idPago,
                    'monto' => (float) $pago->monto,
                    'metodo' => $pago->metodo,
                    'fechaPago' => $pago->fechaPago?->format('Y-m-d H:i:s'),
                    'referencia' => $pago->referencia,
                ])->values() ?? [],
            ] : null,
        ];
    }
}
