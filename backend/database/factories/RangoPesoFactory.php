<?php
// database/factories/RangoPesoFactory.php

namespace Database\Factories;

use App\Models\RangoPeso;
use Illuminate\Database\Eloquent\Factories\Factory;

class RangoPesoFactory extends Factory
{
    protected $model = RangoPeso::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->randomElement(['Mini', 'Pequeño', 'Mediano', 'Grande', 'Gigante']),
            'pesoMinKg' => $this->faker->randomFloat(2, 0, 30),
            'pesoMaxKg' => $this->faker->randomFloat(2, 10, 50),
            'factorTiempo' => $this->faker->randomFloat(2, 0.8, 1.5),
            'factorPrecio' => $this->faker->randomFloat(2, 0.8, 1.5),
        ];
    }
}