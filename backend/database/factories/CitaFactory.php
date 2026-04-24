<?php
// database/factories/CitaFactory.php

namespace Database\Factories;

use App\Models\Cita;
use App\Models\Mascota;
use App\Models\Groomer;
use App\Models\Servicio;
use App\Models\Recepcionista;
use Illuminate\Database\Eloquent\Factories\Factory;

class CitaFactory extends Factory
{
    protected $model = Cita::class;

    public function definition(): array
    {
        $fechaInicio = $this->faker->dateTimeBetween('now', '+1 month');
        $duracion = $this->faker->numberBetween(30, 120);
        $fechaFin = (clone $fechaInicio)->modify("+{$duracion} minutes");
        
        return [
            'idMascota' => Mascota::inRandomOrder()->first() ?? Mascota::factory(), // ✅ reutiliza existente
            'idGroomer' => Groomer::inRandomOrder()->first() ?? Groomer::factory(), // ✅ reutiliza existente
            'idServicio' => Servicio::inRandomOrder()->first() ?? Servicio::factory(), // ✅ reutiliza existente
            'idRecepcionista' => Recepcionista::inRandomOrder()->first() ?? Recepcionista::factory(), // ✅ reutiliza existente
            'fechaHoraInicio' => $fechaInicio,
            'fechaHoraFin' => $fechaFin,
            'duracionCalculadaMin' => $duracion,
            'estado' => $this->faker->randomElement(['programada', 'confirmada', 'completada', 'cancelada']),
            'observaciones' => $this->faker->optional()->sentence(),
        ];
    }
}