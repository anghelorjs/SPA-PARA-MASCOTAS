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
        $cita = Cita::inRandomOrder()->first() ?? Cita::factory(); // ✅ reutiliza existente
        
        $fechaApertura = $cita->fechaHoraInicio ?? $this->faker->dateTimeBetween('-1 month', 'now');
        $fechaCierre = $this->faker->optional(0.7)->dateTimeBetween($fechaApertura, '+2 hours');
        
        return [
            'idCita' => $cita->idCita,
            'idGroomer' => $cita->idGroomer, // ✅ usa el groomer de la cita
            'idMascota' => $cita->idMascota, // ✅ usa la mascota de la cita
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