<?php

namespace App\Http\Controllers\Api;

use App\Models\DetalleVenta;
use App\Models\Factura;
use App\Models\ItemPedido;
use App\Models\Notificacion;
use App\Models\Pago;
use App\Models\PedidoWhatsapp;
use App\Models\VarianteProducto;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PedidoController extends ApiController
{
    public function index(Request $request)
    {
        $query = PedidoWhatsapp::with(['cliente.user', 'itemsPedido.variante.producto'])
            ->orderBy('fecha', 'desc');

        if ($request->filled('estado') && $request->estado !== 'todos') {
            $query->where('estado', $request->estado);
        }

        $pedidos = $query->paginate($request->get('per_page', 15));
        $pedidos->getCollection()->transform(fn ($pedido) => $this->formatearPedido($pedido));

        return $this->successResponse([
            'pedidos' => $pedidos,
            'resumen' => $this->resumenEstados(),
        ], 'Pedidos obtenidos correctamente');
    }

    public function resumen()
    {
        return $this->successResponse($this->resumenEstados(), 'Resumen de pedidos obtenido correctamente');
    }

    public function show($id)
    {
        $pedido = PedidoWhatsapp::with(['cliente.user', 'itemsPedido.variante.producto.categoria'])->find($id);

        if (!$pedido) {
            return $this->errorResponse('Pedido no encontrado', 404);
        }

        return $this->successResponse($this->formatearPedido($pedido), 'Detalle de pedido obtenido correctamente');
    }

    public function confirmar($id)
    {
        $pedido = PedidoWhatsapp::with(['cliente.user', 'itemsPedido.variante.producto'])->find($id);

        if (!$pedido) {
            return $this->errorResponse('Pedido no encontrado', 404);
        }

        if ($pedido->estado === 'pagado') {
            return $this->errorResponse('El pedido ya fue pagado', 400);
        }

        $pedido->update(['estado' => 'confirmado']);

        Notificacion::create([
            'idCliente' => $pedido->idCliente,
            'idCita' => null,
            'tipo' => 'confirmacion',
            'canal' => $pedido->canal,
            'mensaje' => "Tu pedido #{$pedido->idPedido} fue confirmado. Puedes pasar a recogerlo en los siguientes dias en cualquier horario de atencion. Te esperamos en PET SPA.",
            'fechaEnvio' => now(),
            'entregada' => false,
        ]);

        return $this->successResponse($this->formatearPedido($pedido->fresh(['cliente.user', 'itemsPedido.variante.producto'])), 'Pedido confirmado correctamente');
    }

    public function pagar(Request $request, $id)
    {
        $request->validate([
            'medioPago' => 'required|in:efectivo,qr,transferencia',
        ]);

        $pedido = PedidoWhatsapp::with(['cliente.user', 'itemsPedido.variante.producto'])->find($id);

        if (!$pedido) {
            return $this->errorResponse('Pedido no encontrado', 404);
        }

        if ($pedido->estado === 'pagado') {
            return $this->errorResponse('El pedido ya fue marcado como pagado', 400);
        }

        DB::beginTransaction();

        try {
            foreach ($pedido->itemsPedido as $item) {
                $variante = VarianteProducto::with('producto')->lockForUpdate()->find($item->idVariante);
                if (!$variante || $variante->stock < $item->cantidad) {
                    DB::rollBack();
                    return $this->errorResponse(
                        "Stock insuficiente para {$item->variante->producto->nombre} - {$item->variante->nombreVariante}",
                        400
                    );
                }
            }

            $recepcionista = Auth::user()->recepcionista;
            $venta = Venta::create([
                'idCliente' => $pedido->idCliente,
                'idRecepcionista' => $recepcionista?->idRecepcionista,
                'fecha' => now(),
                'total' => 0,
                'medioPago' => $request->medioPago,
                'estado' => 'pagado',
            ]);

            $total = 0;

            foreach ($pedido->itemsPedido as $item) {
                $variante = VarianteProducto::with('producto')->lockForUpdate()->find($item->idVariante);
                $subtotal = (float) $item->precioUnitario * (int) $item->cantidad;
                $total += $subtotal;

                DetalleVenta::create([
                    'idVenta' => $venta->idVenta,
                    'idVariante' => $item->idVariante,
                    'tipo' => 'producto',
                    'descripcion' => $variante->producto->nombre . ' - ' . $variante->nombreVariante . " (Pedido #{$pedido->idPedido})",
                    'cantidad' => $item->cantidad,
                    'precioUnitario' => $item->precioUnitario,
                    'subtotal' => $subtotal,
                ]);

                $variante->stock -= $item->cantidad;
                $variante->save();
            }

            $venta->update(['total' => $total]);

            $factura = Factura::create([
                'idVenta' => $venta->idVenta,
                'numeroFactura' => 'FAC-' . str_pad($venta->idVenta, 8, '0', STR_PAD_LEFT),
                'fechaEmision' => now(),
                'montoTotal' => $total,
                'estado' => 'emitida',
            ]);

            Pago::create([
                'idFactura' => $factura->idFactura,
                'monto' => $total,
                'metodo' => $request->medioPago,
                'fechaPago' => now(),
                'referencia' => 'PED-' . $pedido->idPedido . '-' . uniqid(),
            ]);

            $pedido->update(['estado' => 'pagado']);

            Notificacion::create([
                'idCliente' => $pedido->idCliente,
                'idCita' => null,
                'tipo' => 'listo_para_recoger',
                'canal' => $pedido->canal,
                'mensaje' => "Registramos el pago de tu pedido #{$pedido->idPedido}. Puedes pasar a recoger tus productos en PET SPA en horario de atencion.",
                'fechaEnvio' => now(),
                'entregada' => false,
            ]);

            DB::commit();

            return $this->successResponse([
                'pedido' => $this->formatearPedido($pedido->fresh(['cliente.user', 'itemsPedido.variante.producto'])),
                'venta_id' => $venta->idVenta,
            ], 'Pedido marcado como pagado y venta registrada correctamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al pagar pedido: ' . $e->getMessage(), 500);
        }
    }

    private function resumenEstados(): array
    {
        return [
            'pendiente' => PedidoWhatsapp::where('estado', 'pendiente')->count(),
            'confirmado' => PedidoWhatsapp::where('estado', 'confirmado')->count(),
            'pagado' => PedidoWhatsapp::where('estado', 'pagado')->count(),
            'cancelado' => PedidoWhatsapp::where('estado', 'cancelado')->count(),
        ];
    }

    private function formatearPedido(PedidoWhatsapp $pedido): array
    {
        $items = $pedido->itemsPedido->map(function (ItemPedido $item) {
            return [
                'idItemPedido' => $item->idItemPedido,
                'idVariante' => $item->idVariante,
                'producto' => $item->variante?->producto?->nombre,
                'variante' => $item->variante?->nombreVariante,
                'cantidad' => (int) $item->cantidad,
                'precioUnitario' => (float) $item->precioUnitario,
                'subtotal' => (float) $item->subtotal,
                'stockActual' => (int) ($item->variante?->stock ?? 0),
            ];
        })->values();

        return [
            'idPedido' => $pedido->idPedido,
            'idCliente' => $pedido->idCliente,
            'cliente' => $pedido->cliente?->user ? [
                'nombre' => $pedido->cliente->user->nombre,
                'apellido' => $pedido->cliente->user->apellido,
                'telefono' => $pedido->cliente->user->telefono,
                'email' => $pedido->cliente->user->email,
            ] : null,
            'fecha' => $pedido->fecha?->format('Y-m-d H:i:s'),
            'total' => (float) $pedido->subtotal,
            'estado' => $pedido->estado,
            'canal' => $pedido->canal,
            'mensajeGenerado' => $pedido->mensajeGenerado,
            'items' => $items,
        ];
    }
}
