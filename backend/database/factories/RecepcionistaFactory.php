<?php
// database/factories/RecepcionistaFactory.php

namespace Database\Factories;

use App\Models\Recepcionista;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecepcionistaFactory extends Factory
{
    protected $model = Recepcionista::class;

    public function definition(): array
    {
        return [
            'idUsuario' => User::factory()->recepcionista(),
            'turno' => $this->faker->randomElement(['matutino', 'vespertino', 'completo']),
        ];
    }
}