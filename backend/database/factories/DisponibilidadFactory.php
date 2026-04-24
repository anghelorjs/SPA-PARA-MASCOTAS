<?php
// database/factories/DisponibilidadFactory.php

namespace Database\Factories;

use App\Models\Disponibilidad;
use App\Models\Groomer;
use Illuminate\Database\Eloquent\Factories\Factory;

class DisponibilidadFactory extends Factory
{
    protected $model = Disponibilidad::class;

    public function definition(): array
    {
        $horas = [8, 9, 10, 11, 12, 14, 15, 16, 17, 18];
        $horaInicio = $this->faker->randomElement($horas);
        
        return [
            'idGroomer' => Groomer::factory(),
            'diaSemana' => $this->faker->numberBetween(0, 6),
            'horaInicio' => sprintf('%02d:00:00', $horaInicio),
            'horaFin' => sprintf('%02d:00:00', $horaInicio + 4),
            'esBloqueo' => false,
            'motivoBloqueo' => null,
        ];
    }
}