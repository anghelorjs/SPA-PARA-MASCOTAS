<?php
// app/Http/Controllers/Api/Cliente/CatalogoController.php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Api\ApiController;
use App\Models\Producto;
use App\Models\VarianteProducto;
use App\Models\Categoria;
use App\Models\PedidoWhatsapp;
use App\Models\ItemPedido;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CatalogoController extends ApiController
{
    /**
     * Listar productos activos (para catálogo)
     */
    public function index(Request $request)
    {
        $query = Producto::with(['categoria', 'variantes'])
            ->where('activo', true)
            ->whereHas('variantes', function($q) {
                $q->where('stock', '>', 0);
            });
        
        // Búsqueda por nombre
        if ($request->has('search')) {
            $query->where('nombre', 'like', "%{$request->search}%");
        }
        
        // Filtro por categoría
        if ($request->has('categoria_id')) {
            $query->where('idCategoria', $request->categoria_id);
        }
        
        $productos = $query->get()->map(function($producto) {
            $precioMinimo = $producto->variantes->min('precio');
            $stockTotal = $producto->variantes->sum('stock');
            
            return [
                'id' => $producto->idProducto,
                'nombre' => $producto->nombre,
                'descripcion' => $producto->descripcion,
                'categoria_id' => $producto->idCategoria,
                'categoria_nombre' => $producto->categoria->nombre,
                'precio_desde' => $precioMinimo,
                'stock_total' => $stockTotal,
                'variantes' => $producto->variantes->map(function($variante) {
                    return [
                        'id' => $variante->idVariante,
                        'nombre' => $variante->nombreVariante,
                        'precio' => $variante->precio,
                        'stock' => $variante->stock
                    ];
                }),
                'imagen_url' => null // Se puede agregar campo imagen en productos
            ];
        });
        
        return $this->successResponse($productos, 'Productos obtenidos correctamente');
    }
    
    /**
     * Obtener categorías para filtros
     */
    public function getCategorias()
    {
        $categorias = Categoria::where('tipo', 'producto')
            ->whereHas('productos', function($q) {
                $q->where('activo', true);
            })
            ->get()
            ->map(function($categoria) {
                return [
                    'id' => $categoria->idCategoria,
                    'nombre' => $categoria->nombre,
                    'cantidad_productos' => $categoria->productos->where('activo', true)->count()
                ];
            });
        
        return $this->successResponse($categorias, 'Categorías obtenidas correctamente');
    }
    
    /**
     * Crear pedido por WhatsApp/Telegram (desde el carrito)
     */
    public function crearPedido(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.idVariante' => 'required|exists:variante_productos,idVariante',
            'items.*.cantidad' => 'required|integer|min:1',
            'canal' => 'required|in:whatsapp,telegram'
        ]);
        
        DB::beginTransaction();
        
        try {
            $subtotal = 0;
            $itemsPedido = [];
            
            foreach ($request->items as $item) {
                $variante = VarianteProducto::with('producto')->find($item['idVariante']);
                $subtotal += $variante->precio * $item['cantidad'];
                
                $itemsPedido[] = [
                    'variante' => $variante,
                    'cantidad' => $item['cantidad'],
                    'precio' => $variante->precio
                ];
            }
            
            // Generar mensaje para WhatsApp/Telegram
            $mensaje = $this->generarMensajePedido($cliente, $itemsPedido, $subtotal);
            
            // Crear pedido
            $pedido = PedidoWhatsapp::create([
                'idCliente' => $cliente->idCliente,
                'fecha' => now(),
                'estado' => 'pendiente',
                'subtotal' => $subtotal,
                'mensajeGenerado' => $mensaje,
                'canal' => $request->canal
            ]);
            
            // Crear items del pedido
            foreach ($itemsPedido as $item) {
                ItemPedido::create([
                    'idPedido' => $pedido->idPedido,
                    'idVariante' => $item['variante']->idVariante,
                    'cantidad' => $item['cantidad'],
                    'precioUnitario' => $item['precio']
                ]);
            }
            
            DB::commit();
            
            // Devolver el mensaje listo para abrir WhatsApp/Telegram
            $numeroTelefono = $cliente->user->telefono;
            $mensajeCodificado = urlencode($mensaje);
            
            $enlace = '';
            if ($request->canal === 'whatsapp') {
                $enlace = "https://wa.me/591{$numeroTelefono}?text={$mensajeCodificado}";
            } else {
                $enlace = "https://t.me/share/url?url=&text={$mensajeCodificado}";
            }
            
            return $this->successResponse([
                'pedido_id' => $pedido->idPedido,
                'subtotal' => $subtotal,
                'mensaje' => $mensaje,
                'enlace' => $enlace
            ], 'Pedido preparado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear pedido: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Generar mensaje para pedido por WhatsApp/Telegram
     */
    private function generarMensajePedido($cliente, $items, $subtotal)
    {
        $mensaje = "🛍️ *NUEVO PEDIDO* 🛍️\n\n";
        $mensaje = "Cliente: {$cliente->user->nombre} {$cliente->user->apellido}\n";
        $mensaje .= "Teléfono: {$cliente->user->telefono}\n";
        $mensaje .= "Dirección: {$cliente->direccion}\n\n";
        $mensaje .= "*Productos solicitados:*\n";
        
        foreach ($items as $item) {
            $producto = $item['variante']->producto;
            $mensaje .= "• {$producto->nombre} - {$item['variante']->nombreVariante}: {$item['cantidad']} x \${$item['precio']}\n";
        }
        
        $mensaje .= "\n*Subtotal:* \${$subtotal}\n\n";
        $mensaje .= "¡Gracias por tu compra! 🐾\n";
        $mensaje .= "El pago se coordinará al momento de la entrega o retiro en el local.";
        
        return $mensaje;
    }
}