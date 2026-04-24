<?php
// database/factories/GroomerFactory.php

namespace Database\Factories;

use App\Models\Groomer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GroomerFactory extends Factory
{
    protected $model = Groomer::class;

    public function definition(): array
    {
        return [
            'idUsuario' => User::factory()->groomer(),
            'especialidad' => $this->faker->randomElement(['Perros', 'Gatos', 'Ambos', 'Corte fino', 'Baños medicinales']),
            'maxServiciosSimultaneos' => $this->faker->numberBetween(1, 3),
        ];
    }
}