<?php
// database/seeders/VentaSeeder.php

namespace Database\Seeders;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Factura;
use App\Models\Pago;
use App\Models\Cliente;
use App\Models\Recepcionista;
use App\Models\VarianteProducto;
use Illuminate\Database\Seeder;

class VentaSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener IDs reales de recepcionistas
        $recepcionistaIds = Recepcionista::pluck('idRecepcionista')->toArray();
        
        // Si no hay recepcionistas, mostrar error
        if (empty($recepcionistaIds)) {
            $this->command->error('No hay recepcionistas en la base de datos. Ejecuta UserSeeder primero.');
            return;
        }
        
        // Obtener clientes y variantes
        $clientes = Cliente::all();
        $variantes = VarianteProducto::all();
        
        if ($clientes->isEmpty() || $variantes->isEmpty()) {
            $this->command->error('No hay clientes o variantes de productos.');
            return;
        }
        
        foreach ($clientes as $cliente) {
            // 2-5 ventas por cliente
            for ($i = 0; $i < rand(2, 5); $i++) {
                $total = 0;
                
                $venta = Venta::create([
                    'idCliente' => $cliente->idCliente,
                    'idRecepcionista' => $recepcionistaIds[array_rand($recepcionistaIds)], // ✅ usar ID real
                    'fecha' => now()->subDays(rand(1, 90)),
                    'total' => 0,
                    'medioPago' => ['efectivo', 'qr', 'transferencia'][rand(0, 2)],
                    'estado' => ['pendiente', 'pagado', 'cancelado'][rand(0, 2)],
                ]);
                
                // 1-4 productos por venta
                for ($j = 0; $j < rand(1, 4); $j++) {
                    $variante = $variantes->random();
                    $cantidad = rand(1, 3);
                    $precio = $variante->precio;
                    $subtotal = $cantidad * $precio;
                    $total += $subtotal;
                    
                    DetalleVenta::create([
                        'idVenta' => $venta->idVenta,
                        'idVariante' => $variante->idVariante,
                        'cantidad' => $cantidad,
                        'precioUnitario' => $precio,
                        'subtotal' => $subtotal,
                    ]);
                    
                    // Descontar stock
                    $variante->descontarStock($cantidad);
                }
                
                $venta->update(['total' => $total]);
                
                // Si la venta está pagada, crear factura y pago
                if ($venta->estado === 'pagado') {
                    $factura = Factura::create([
                        'idVenta' => $venta->idVenta,
                        'numeroFactura' => 'FAC-' . str_pad($venta->idVenta, 6, '0', STR_PAD_LEFT),
                        'fechaEmision' => $venta->fecha,
                        'montoTotal' => $total,
                        'estado' => 'emitida',
                    ]);
                    
                    Pago::create([
                        'idFactura' => $factura->idFactura,
                        'monto' => $total,
                        'metodo' => $venta->medioPago,
                        'fechaPago' => $venta->fecha,
                        'referencia' => 'REF-' . uniqid(),
                    ]);
                }
            }
        }
        
    }
}