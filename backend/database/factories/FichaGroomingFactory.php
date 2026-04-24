<?php
// database/factories/FichaGroomingFactory.php

namespace Database\Factories;

use App\Models\FichaGrooming;
use App\Models\Cita;
use App\Models\Groomer;
use App\Models\Mascota;
use Illuminate\Database\Eloquent\Factories\Factory;

class FichaGroomingFactory extends Factory
{
    protected $model = FichaGrooming::class;

    public function definition(): array
    {
        $fechaApertura = $this->faker->dateTimeBetween('-1 month', 'now');
        $fechaCierre = $this->faker->optional(0.7)->dateTimeBetween($fechaApertura, '+2 hours');
        
        return [
            'idCita' => Cita::factory(),
            'idGroomer' => Groomer::factory(),
            'idMascota' => Mascota::factory(),
            'estadoIngreso' => $this->faker->optional()->sentence(),
            'nudos' => $this->faker->boolean(30),
            'tienePulgas' => $this->faker->boolean(20),
            'tieneHeridas' => $this->faker->boolean(10),
            'observaciones' => $this->faker->optional()->paragraph(),
            'recomendaciones' => $this->faker->optional()->sentence(),
            'fechaApertura' => $fechaApertura,
            'fechaCierre' => $fechaCierre,
        ];
    }
}