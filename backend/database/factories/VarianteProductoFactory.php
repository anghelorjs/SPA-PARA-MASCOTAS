<?php
// database/factories/VarianteProductoFactory.php

namespace Database\Factories;

use App\Models\VarianteProducto;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

class VarianteProductoFactory extends Factory
{
    protected $model = VarianteProducto::class;

    public function definition(): array
    {
        return [
            'idProducto' => Producto::factory(),
            'nombreVariante' => $this->faker->randomElement(['Pequeño', 'Mediano', 'Grande', '1kg', '2kg', '5kg']),
            'precio' => $this->faker->randomFloat(2, 10, 200),
            'stock' => $this->faker->numberBetween(0, 100),
        ];
    }
}