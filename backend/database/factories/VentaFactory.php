<?php
// database/factories/VentaFactory.php

namespace Database\Factories;

use App\Models\Venta;
use App\Models\Cliente;
use App\Models\Recepcionista;
use Illuminate\Database\Eloquent\Factories\Factory;

class VentaFactory extends Factory
{
    protected $model = Venta::class;

    public function definition(): array
    {
        return [
            'idCliente' => Cliente::inRandomOrder()->first() ?? Cliente::factory(), // ✅ reutiliza existente
            'idRecepcionista' => Recepcionista::inRandomOrder()->first() ?? Recepcionista::factory(), // ✅ reutiliza existente
            'fecha' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'total' => $this->faker->randomFloat(2, 50, 1000),
            'medioPago' => $this->faker->randomElement(['efectivo', 'qr', 'transferencia']),
            'estado' => $this->faker->randomElement(['pendiente', 'pagado', 'cancelado']),
        ];
    }
}