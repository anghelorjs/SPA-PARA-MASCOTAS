<?php
// database/factories/FacturaFactory.php

namespace Database\Factories;

use App\Models\Factura;
use App\Models\Venta;
use Illuminate\Database\Eloquent\Factories\Factory;

class FacturaFactory extends Factory
{
    protected $model = Factura::class;

    public function definition(): array
    {
        return [
            'idVenta' => Venta::factory(),
            'numeroFactura' => 'FAC-' . $this->faker->unique()->numberBetween(1000, 9999),
            'fechaEmision' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'montoTotal' => $this->faker->randomFloat(2, 50, 1000),
            'estado' => $this->faker->randomElement(['emitida', 'cancelada']),
        ];
    }
}