<?php
// database/factories/ServicioRangoFactory.php

namespace Database\Factories;

use App\Models\Servicio;
use App\Models\RangoPeso;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServicioRangoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'idServicio' => Servicio::factory(),
            'idRango' => RangoPeso::factory(),
            'duracionAjustadaMin' => $this->faker->numberBetween(15, 180),
            'precioAjustado' => $this->faker->randomFloat(2, 30, 500),
        ];
    }
}