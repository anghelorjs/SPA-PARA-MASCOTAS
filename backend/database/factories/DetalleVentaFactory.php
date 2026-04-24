<?php
// database/factories/DetalleVentaFactory.php

namespace Database\Factories;

use App\Models\DetalleVenta;
use App\Models\Venta;
use App\Models\VarianteProducto;
use Illuminate\Database\Eloquent\Factories\Factory;

class DetalleVentaFactory extends Factory
{
    protected $model = DetalleVenta::class;

    public function definition(): array
    {
        $cantidad = $this->faker->numberBetween(1, 5);
        $precioUnitario = $this->faker->randomFloat(2, 10, 200);
        
        return [
            'idVenta' => Venta::factory(),
            'idVariante' => VarianteProducto::factory(),
            'cantidad' => $cantidad,
            'precioUnitario' => $precioUnitario,
            'subtotal' => $cantidad * $precioUnitario,
        ];
    }
}