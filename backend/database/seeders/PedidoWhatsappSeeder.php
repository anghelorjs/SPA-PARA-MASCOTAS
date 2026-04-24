<?php
// database/seeders/PedidoWhatsappSeeder.php

namespace Database\Seeders;

use App\Models\PedidoWhatsapp;
use App\Models\ItemPedido;
use App\Models\Cliente;
use App\Models\VarianteProducto;
use Illuminate\Database\Seeder;

class PedidoWhatsappSeeder extends Seeder
{
    public function run(): void
    {
        $clientes = Cliente::all();
        $variantes = VarianteProducto::all();
        
        foreach ($clientes as $cliente) {
            // 1-3 pedidos por cliente
            for ($i = 0; $i < rand(1, 3); $i++) {
                $subtotal = 0;
                $pedido = PedidoWhatsapp::create([
                    'idCliente' => $cliente->idCliente,
                    'fecha' => now()->subDays(rand(1, 60)),
                    'estado' => ['pendiente', 'enviado', 'confirmado', 'pagado'][rand(0, 3)],
                    'subtotal' => 0,
                    'canal' => ['whatsapp', 'telegram'][rand(0, 1)],
                ]);
                
                // 1-5 productos por pedido
                for ($j = 0; $j < rand(1, 5); $j++) {
                    $variante = $variantes->random();
                    $cantidad = rand(1, 2);
                    $precio = $variante->precio;
                    $subtotal += $cantidad * $precio;
                    
                    ItemPedido::create([
                        'idPedido' => $pedido->idPedido,
                        'idVariante' => $variante->idVariante,
                        'cantidad' => $cantidad,
                        'precioUnitario' => $precio,
                    ]);
                }
                
                $pedido->update(['subtotal' => $subtotal]);
                $pedido->generarMensajeWhatsapp();
            }
        }
        
    }
}