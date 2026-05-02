<?php
// app/Http/Controllers/Api/Cliente/HistorialController.php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Api\ApiController;
use App\Models\FichaGrooming;
use App\Models\Venta;
use App\Models\PedidoWhatsapp;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HistorialController extends ApiController
{
    /**
     * Obtener historial de servicios (fichas de grooming)
     */
    public function servicios(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $query = FichaGrooming::with(['cita.mascota', 'cita.servicio', 'groomer.user'])
            ->whereHas('cita.mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })
            ->whereNotNull('fechaCierre');
        
        // Filtro por mascota
        if ($request->has('mascota_id')) {
            $query->whereHas('cita.mascota', function($q) use ($request) {
                $q->where('idMascota', $request->mascota_id);
            });
        }
        
        $servicios = $query->orderBy('fechaCierre', 'desc')
            ->paginate($request->get('per_page', 15))
            ->through(function($ficha) {
                return [
                    'id' => $ficha->idFicha,
                    'fecha' => $ficha->fechaCierre->format('d/m/Y H:i'),
                    'mascota' => $ficha->cita->mascota->nombre,
                    'mascota_id' => $ficha->cita->mascota->idMascota,
                    'servicio' => $ficha->cita->servicio->nombre,
                    'groomer' => $ficha->groomer->user->nombre . ' ' . $ficha->groomer->user->apellido,
                    'observaciones' => $ficha->observaciones,
                    'recomendaciones' => $ficha->recomendaciones,
                    'tiene_fotos' => $ficha->fotos()->exists()
                ];
            });
        
        // Obtener lista de mascotas para el filtro
        $mascotas = $cliente->mascotas->map(function($mascota) {
            return [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre
            ];
        });
        
        return $this->successResponse([
            'servicios' => $servicios,
            'mascotas' => $mascotas
        ], 'Historial de servicios obtenido correctamente');
    }
    
    /**
     * Obtener historial de compras (ventas y pedidos)
     */
    public function compras(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        // Ventas en local
        $ventas = Venta::with(['detalleVentas.variante.producto'])
            ->where('idCliente', $cliente->idCliente)
            ->get()
            ->map(function($venta) {
                return [
                    'tipo' => 'venta_local',
                    'id' => $venta->idVenta,
                    'fecha' => $venta->fecha->format('d/m/Y H:i'),
                    'total' => $venta->total,
                    'estado' => $venta->estado,
                    'estado_color' => $this->getEstadoColor($venta->estado),
                    'items' => $venta->detalleVentas->map(function($detalle) {
                        return [
                            'producto' => $detalle->variante->producto->nombre,
                            'variante' => $detalle->variante->nombreVariante,
                            'cantidad' => $detalle->cantidad,
                            'precio' => $detalle->precioUnitario,
                            'subtotal' => $detalle->subtotal
                        ];
                    }),
                    'medio_pago' => $venta->medioPago
                ];
            });
        
        // Pedidos por WhatsApp/Telegram
        $pedidos = PedidoWhatsapp::with(['itemsPedido.variante.producto'])
            ->where('idCliente', $cliente->idCliente)
            ->get()
            ->map(function($pedido) {
                $estados = [
                    'pendiente' => ['texto' => 'Pendiente', 'color' => '#f59e0b'],
                    'enviado' => ['texto' => 'Enviado', 'color' => '#3b82f6'],
                    'confirmado' => ['texto' => 'Confirmado', 'color' => '#10b981'],
                    'pagado' => ['texto' => 'Pagado', 'color' => '#6b7280']
                ];
                
                return [
                    'tipo' => $pedido->canal === 'whatsapp' ? 'pedido_whatsapp' : 'pedido_telegram',
                    'id' => $pedido->idPedido,
                    'fecha' => $pedido->fecha->format('d/m/Y H:i'),
                    'total' => $pedido->subtotal,
                    'estado' => $pedido->estado,
                    'estado_texto' => $estados[$pedido->estado]['texto'],
                    'estado_color' => $estados[$pedido->estado]['color'],
                    'items' => $pedido->itemsPedido->map(function($item) {
                        return [
                            'producto' => $item->variante->producto->nombre,
                            'variante' => $item->variante->nombreVariante,
                            'cantidad' => $item->cantidad,
                            'precio' => $item->precioUnitario,
                            'subtotal' => $item->cantidad * $item->precioUnitario
                        ];
                    }),
                    'canal' => $pedido->canal,
                    'mensaje' => $pedido->mensajeGenerado
                ];
            });
        
        // Unificar y ordenar por fecha
        $compras = $ventas->concat($pedidos)
            ->sortByDesc(function($item) {
                return $item['fecha'];
            })
            ->values();
        
        // Aplicar filtros
        if ($request->has('estado') && $request->estado !== 'todas') {
            $compras = $compras->filter(function($item) use ($request) {
                return $item['estado'] === $request->estado;
            });
        }
        
        if ($request->has('fecha_desde')) {
            $compras = $compras->filter(function($item) use ($request) {
                return strtotime($item['fecha']) >= strtotime($request->fecha_desde);
            });
        }
        
        if ($request->has('fecha_hasta')) {
            $compras = $compras->filter(function($item) use ($request) {
                return strtotime($item['fecha']) <= strtotime($request->fecha_hasta);
            });
        }
        
        return $this->successResponse($compras->values(), 'Historial de compras obtenido correctamente');
    }
    
    /**
     * Ver detalle de un servicio (ficha específica con fotos)
     */
    public function servicioDetalle($id)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $ficha = FichaGrooming::with(['cita.mascota', 'cita.servicio', 'groomer.user', 'fotos'])
            ->whereHas('cita.mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })
            ->find($id);
        
        if (!$ficha) {
            return $this->errorResponse('Servicio no encontrado', 404);
        }
        
        return $this->successResponse([
            'id' => $ficha->idFicha,
            'fecha' => $ficha->fechaCierre->format('d/m/Y H:i'),
            'mascota' => $ficha->cita->mascota->nombre,
            'servicio' => $ficha->cita->servicio->nombre,
            'groomer' => $ficha->groomer->user->nombre . ' ' . $ficha->groomer->user->apellido,
            'observaciones' => $ficha->observaciones,
            'recomendaciones' => $ficha->recomendaciones,
            'fotos' => [
                'antes' => $ficha->fotos->where('tipo', 'antes')->values(),
                'despues' => $ficha->fotos->where('tipo', 'despues')->values()
            ]
        ], 'Detalle de servicio obtenido correctamente');
    }
    
    /**
     * Obtener color según estado
     */
    private function getEstadoColor($estado)
    {
        $colores = [
            'pendiente' => '#f59e0b',
            'pagado' => '#10b981',
            'cancelado' => '#ef4444'
        ];
        
        return $colores[$estado] ?? '#6b7280';
    }
}