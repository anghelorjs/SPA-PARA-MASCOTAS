<?php
// database/factories/PagoFactory.php

namespace Database\Factories;

use App\Models\Pago;
use App\Models\Factura;
use Illuminate\Database\Eloquent\Factories\Factory;

class PagoFactory extends Factory
{
    protected $model = Pago::class;

    public function definition(): array
    {
        return [
            'idFactura' => Factura::factory(),
            'monto' => $this->faker->randomFloat(2, 50, 1000),
            'metodo' => $this->faker->randomElement(['efectivo', 'qr', 'transferencia']),
            'fechaPago' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'referencia' => $this->faker->optional()->uuid(),
        ];
    }
}