<?php
// database/factories/ReporteFactory.php

namespace Database\Factories;

use App\Models\Reporte;
use App\Models\Administrador;
use App\Models\Groomer;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReporteFactory extends Factory
{
    protected $model = Reporte::class;

    public function definition(): array
    {
        return [
            'idAdministrador' => Administrador::factory(),
            'tipoReporte' => $this->faker->randomElement(['citas', 'ventas', 'ocupacion', 'productos', 'servicios']),
            'fechaDesde' => $this->faker->dateTimeBetween('-6 months', '-1 month'),
            'fechaHasta' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'idGroomerFiltro' => $this->faker->optional(0.5)->passthrough(Groomer::factory()),
            'generadoEn' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'resultadoJson' => json_encode(['total' => $this->faker->numberBetween(10, 1000)]),
        ];
    }
}