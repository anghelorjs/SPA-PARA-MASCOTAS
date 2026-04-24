<?php
// database/factories/MovimientoInventarioFactory.php

namespace Database\Factories;

use App\Models\MovimientoInventario;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

class MovimientoInventarioFactory extends Factory
{
    protected $model = MovimientoInventario::class;

    public function definition(): array
    {
        return [
            'idProducto' => Producto::factory(),
            'tipoMovimiento' => $this->faker->randomElement(['entrada', 'salida', 'ajuste']),
            'cantidad' => $this->faker->numberBetween(1, 100),
            'fecha' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'motivo' => $this->faker->optional()->sentence(),
        ];
    }
}