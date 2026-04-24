<?php
// database/factories/FotoFactory.php

namespace Database\Factories;

use App\Models\Foto;
use App\Models\Mascota;
use App\Models\FichaGrooming;
use Illuminate\Database\Eloquent\Factories\Factory;

class FotoFactory extends Factory
{
    protected $model = Foto::class;

    public function definition(): array
    {
        return [
            'idMascota' => Mascota::factory(),
            'idFicha' => $this->faker->optional(0.5)->passthrough(FichaGrooming::factory()),
            'urlFoto' => $this->faker->imageUrl(640, 480, 'animals'),
            'tipo' => $this->faker->randomElement(['antes', 'despues', 'perfil']),
            'fechaCarga' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
    }
}