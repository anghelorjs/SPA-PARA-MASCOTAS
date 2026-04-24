<?php
// database/factories/DetalleInsumoFactory.php

namespace Database\Factories;

use App\Models\DetalleInsumo;
use App\Models\FichaGrooming;
use App\Models\Insumo;
use Illuminate\Database\Eloquent\Factories\Factory;

class DetalleInsumoFactory extends Factory
{
    protected $model = DetalleInsumo::class;

    public function definition(): array
    {
        return [
            'idFicha' => FichaGrooming::factory(),
            'idInsumo' => Insumo::factory(),
            'cantidadUsada' => $this->faker->randomFloat(2, 0.1, 5),
        ];
    }
}